const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'X-App-Key, Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/data') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
      }
      const key = request.headers.get('X-App-Key');
      if (!key || key !== env.APP_KEY) {
        return new Response('Unauthorized', { status: 401, headers: CORS });
      }
      if (request.method === 'GET') {
        const data = await env.RN_DATA.get('data');
        return new Response(data || '{"articles":[],"books":[]}', {
          headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }
      if (request.method === 'POST') {
        const body = await request.text();
        try { JSON.parse(body); } catch {
          return new Response('Bad Request', { status: 400, headers: CORS });
        }
        await env.RN_DATA.put('data', body);
        return new Response('OK', { headers: CORS });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
