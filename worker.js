export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/log' && request.method === 'POST') {
      try {
        const data = await request.json();

        const stmt = env.sovereign_compass_db.prepare(`
          INSERT INTO moment_entries (
            user_id, primary_emotion, secondary_emotion, leaf_emotion,
            emotion_path, narrative, intensity, device_info
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        await stmt.bind(
          data.user_id || 'anonymous',
          data.primary_emotion,
          data.secondary_emotion || null,
          data.leaf_emotion || null,
          data.emotion_path || null,
          data.narrative || null,
          data.intensity || 3,
          JSON.stringify(data.device_info || {})
        ).run();

        return Response.json({ success: true, message: "Pact logged successfully" }, { headers: corsHeaders });
      } catch (err) {
        console.error(err);
        return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
      }
    }

    // Serve your HTML on the root path
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(await fetch('https://9659540e.sovereign-compass.pages.dev').then(r => r.text()), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};