function unauthorized() {
  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="No Štokel Admin"' },
  });
}

function checkAuth(request, env) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  const decoded = atob(header.slice(6));
  const [user, ...rest] = decoded.split(':');
  const pass = rest.join(':');
  return user === env.ADMIN_USER && pass === env.ADMIN_PASS;
}

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  const { results } = await env.DB.prepare(
    'SELECT id, name, message, created_at FROM pledges ORDER BY created_at DESC'
  ).all();
  return Response.json(results);
}

export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid body.' }, { status: 400 }); }
  const { id } = body;
  if (!id || typeof id !== 'number') return Response.json({ error: 'Invalid id.' }, { status: 400 });
  await env.DB.prepare('DELETE FROM pledges WHERE id = ?').bind(id).run();
  return Response.json({ ok: true });
}
