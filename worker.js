export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Simple test endpoint
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Your API endpoint
    if (url.pathname === '/api/log' && request.method === 'POST') {
      try {
        const data = await request.json();
        
        await env.sovereign_compass_db.prepare(`
          INSERT INTO moment_entries (
            user_id, primary_emotion, secondary_emotion, leaf_emotion,
            emotion_path, narrative, intensity
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          data.user_id || 'anonymous',
          data.primary_emotion,
          data.secondary_emotion || null,
          data.leaf_emotion || null,
          data.emotion_path || null,
          data.narrative || null,
          data.intensity || 3
        ).run();
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};