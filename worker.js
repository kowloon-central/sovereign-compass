export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API endpoint - note the path matches exactly
    if (url.pathname === '/api/log' && request.method === 'POST') {
      try {
        const data = await request.json();

        const stmt = env.sovereign_compass_db.prepare(`
          INSERT INTO moment_entries (
            user_id, primary_emotion, secondary_emotion, leaf_emotion,
            emotion_path, narrative, intensity, device_info, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `);

        const result = await stmt.bind(
          data.user_id || 'anonymous',
          data.primary_emotion,
          data.secondary_emotion || null,
          data.leaf_emotion || null,
          data.emotion_path || null,
          data.narrative || null,
          data.intensity || 3,
          JSON.stringify(data.device_info || {})
        ).run();

        return Response.json({ 
          success: true, 
          message: "Pact logged successfully",
          data: { id: result.meta.last_row_id }
        }, { 
          status: 200,
          headers: corsHeaders 
        });
      } catch (err) {
        console.error(err);
        return Response.json({ 
          success: false, 
          error: err.message 
        }, { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }

    // Simple test endpoint to verify worker is running
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return Response.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
      }, { 
        headers: corsHeaders 
      });
    }

    // Return a simple response for root path instead of trying to fetch from Pages
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sovereign Compass API</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
              pre { background: #f4f4f4; padding: 15px; border-radius: 8px; overflow-x: auto; }
              button { background: #0066ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
              button:hover { background: #0052cc; }
              .success { color: #00a86b; }
              .error { color: #ff3b30; }
            </style>
          </head>
          <body>
            <h1>🚀 Sovereign Compass API</h1>
            <p>Worker is running! Use POST requests to <code>/api/log</code> to save entries.</p>
            
            <h2>Test the API:</h2>
            <button onclick="testAPI()">Send Test Entry</button>
            <pre id="result"></pre>

            <script>
              async function testAPI() {
                const resultDiv = document.getElementById('result');
                resultDiv.textContent = 'Sending request...';
                
                try {
                  const response = await fetch('/api/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: 'test_' + Date.now(),
                      primary_emotion: 'Happy',
                      secondary_emotion: 'Content',
                      leaf_emotion: 'Joyful',
                      emotion_path: 'Happy → Content → Joyful',
                      narrative: 'Test from the API landing page',
                      intensity: 4
                    })
                  });
                  
                  const data = await response.json();
                  resultDiv.textContent = JSON.stringify(data, null, 2);
                  
                  if (data.success) {
                    resultDiv.className = 'success';
                  } else {
                    resultDiv.className = 'error';
                  }
                } catch (err) {
                  resultDiv.textContent = 'Error: ' + err.message;
                  resultDiv.className = 'error';
                }
              }
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};