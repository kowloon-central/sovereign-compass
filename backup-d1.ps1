# backup-and-truncate-d1.ps1
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = "backups"
$jsonFile = "$backupFolder\moment_entries_$timestamp.json"
$sqlFile  = "import-to-mysql.sql"

New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null

Write-Host "🔄 Exporting latest data from Cloudflare D1..." -ForegroundColor Cyan

npx wrangler d1 execute sovereign-compass-db --remote --command="SELECT * FROM moment_entries ORDER BY id DESC" --json > $jsonFile

Write-Host "✅ Exported to: $jsonFile" -ForegroundColor Green

# === Generate MySQL Import Script (with HK Time) ===
Write-Host "🛠 Generating MySQL import script..." -ForegroundColor Cyan

$json = Get-Content $jsonFile -Raw | ConvertFrom-Json
$rows = $json[0].results

function Convert-ToMySQLDateTime {
    param([string]$isoDate)
    if (-not $isoDate) { return 'CURRENT_TIMESTAMP' }
    $utc = [DateTime]::Parse($isoDate.Replace('Z',''), [System.Globalization.CultureInfo]::InvariantCulture)
    $hk = $utc.AddHours(8)
    return $hk.ToString("yyyy-MM-dd HH:mm:ss")
}

$sql = "TRUNCATE TABLE moment_entries;`n"
$sql += "INSERT INTO moment_entries (id, created_at, updated_at, user_id, primary_emotion, secondary_emotion, leaf_emotion, emotion_path, narrative, intensity, reflection, tags, context, device_info, version) VALUES`n"

$values = @()
foreach ($row in $rows) {
    $id        = if ($row.id) { $row.id } else { 'NULL' }
    $created   = Convert-ToMySQLDateTime $row.created_at
    $updated   = Convert-ToMySQLDateTime $row.updated_at
    
    $user      = if ($row.user_id) { "'$($row.user_id -replace "'", "''")'" } else { 'NULL' }
    $primary   = if ($row.primary_emotion) { "'$($row.primary_emotion -replace "'", "''")'" } else { 'NULL' }
    $secondary = if ($row.secondary_emotion) { "'$($row.secondary_emotion -replace "'", "''")'" } else { 'NULL' }
    $leaf      = if ($row.leaf_emotion) { "'$($row.leaf_emotion -replace "'", "''")'" } else { 'NULL' }
    $path      = if ($row.emotion_path) { "'$($row.emotion_path -replace "'", "''")'" } else { 'NULL' }
    $narrative = if ($row.narrative) { "'$($row.narrative -replace "'", "''")'" } else { 'NULL' }
    $intensity = if ($null -ne $row.intensity) { $row.intensity } else { 'NULL' }
    $device    = if ($row.device_info) { "'$($row.device_info | ConvertTo-Json -Compress -Depth 10 -replace "'", "''")'" } else { 'NULL' }
    $version   = if ($row.version) { $row.version } else { 1 }

    $values += "($id, '$created', '$updated', $user, $primary, $secondary, $leaf, $path, $narrative, $intensity, NULL, NULL, NULL, $device, $version)"
}

$sql += ($values -join ",`n") + ";"

$sql | Out-File $sqlFile -Encoding utf8
Write-Host "✅ MySQL import script created: $sqlFile" -ForegroundColor Green

# === Import to Local MySQL ===
Write-Host "📥 Importing into local MySQL..." -ForegroundColor Cyan
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"

Get-Content $sqlFile -Raw | & $mysqlPath --default-character-set=utf8mb4 -u root -pP@tt07200 journal

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Successfully imported to local MySQL!" -ForegroundColor Green
    
    # === TRUNCATE D1 (Remove cloud data) ===
    Write-Host "🗑️  Truncating Cloudflare D1 database..." -ForegroundColor Yellow
    npx wrangler d1 execute sovereign-compass-db --remote --command="DELETE FROM moment_entries;"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cloudflare D1 successfully cleared!" -ForegroundColor Green
        Write-Host "✅ Mission complete: Data moved from cloud to local." -ForegroundColor Magenta
    } else {
        Write-Host "⚠️ Failed to truncate D1" -ForegroundColor Red
    }
} else {
    Write-Host "❌ MySQL import failed. D1 was NOT truncated." -ForegroundColor Red
}