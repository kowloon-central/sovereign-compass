export default {
  async fetch(request, env, ctx) {
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

    // API endpoint - this needs to be handled BEFORE assets
    if (url.pathname === '/api/log' && request.method === 'POST') {
      try {
        const data = await request.json();

        // Insert into database
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
          id: result.meta.last_row_id
        }, { 
          status: 200,
          headers: corsHeaders 
        });
      } catch (err) {
        console.error('Database error:', err);
        return Response.json({ 
          success: false, 
          error: err.message 
        }, { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }

    // Health check endpoint
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return Response.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: Object.keys(env)
      }, { 
        headers: corsHeaders 
      });
    }

    // For all other paths, let the assets handler take over
    // If you don't have an assets handler, fall through to 404
    return new Response('Not found', { status: 404 });
  },
  
  // Optional: Add assets handler if you want to serve static files
  // The assets field in wrangler.jsonc might automatically handle this
};