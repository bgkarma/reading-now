const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'X-App-Key, Content-Type',
};

function unauthorized() {
  return new Response('Unauthorized', { status: 401, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  const key = request.headers.get('X-App-Key');
  if (!key || key !== env.APP_KEY) return unauthorized();

  const data = await env.RN_DATA.get('data');
  return new Response(data || '{"articles":[],"books":[]}', {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }) {
  const key = request.headers.get('X-App-Key');
  if (!key || key !== env.APP_KEY) return unauthorized();

  const body = await request.text();

  // Basic validation — must be a JSON object
  try { JSON.parse(body); } catch {
    return new Response('Bad Request', { status: 400, headers: CORS });
  }

  await env.RN_DATA.put('data', body);
  return new Response('OK', { headers: CORS });
}
