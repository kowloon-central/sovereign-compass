export default {
  async fetch(request, env, ctx) {
    // Only handle API requests - no HTML, no assets
    const url = new URL(request.url);
    
    // CORS headers for browser requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only handle POST to /api/log
    if (url.pathname === '/api/log' && request.method === 'POST') {
      try {
        const data = await request.json();
        
        console.log('Received data:', data);

        // Insert into database
        const result = await env.sovereign_compass_db.prepare(`
          INSERT INTO moment_entries (
            user_id, 
            primary_emotion, 
            secondary_emotion, 
            leaf_emotion,
            emotion_path, 
            narrative, 
            intensity,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
          data.user_id || 'anonymous',
          data.primary_emotion,
          data.secondary_emotion || null,
          data.leaf_emotion || null,
          data.emotion_path || null,
          data.narrative || null,
          data.intensity || 3
        ).run();

        return Response.json({
          success: true,
          message: "Entry saved successfully",
          id: result.meta.last_row_id
        }, {
          status: 200,
          headers: corsHeaders
        });
        
      } catch (error) {
        console.error('Error:', error);
        return Response.json({
          success: false,
          error: error.message
        }, {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // Return 404 for all other routes
    return new Response('Not found - use POST to /api/log', { 
      status: 404,
      headers: corsHeaders
    });
  }
};