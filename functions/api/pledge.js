const MAX_NAME = 100;
const MAX_MSG = 500;

function sanitize(str) {
  return String(str)
    .replace(/[<>]/g, '')
    .trim();
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT name, message, created_at FROM pledges ORDER BY created_at DESC LIMIT 50'
  ).all();
  return Response.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { name, message, token } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'Name is required.' }, { status: 400 });
  }

  // Verify Cloudflare Turnstile
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const verifyRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: ip,
      }),
    }
  );
  const verify = await verifyRes.json();
  if (!verify.success) {
    return Response.json(
      { error: 'Robot check failed. Please refresh and try again.' },
      { status: 400 }
    );
  }

  const safeName = sanitize(name).slice(0, MAX_NAME);
  const safeMsg = message ? sanitize(message).slice(0, MAX_MSG) : null;

  if (!safeName) {
    return Response.json({ error: 'Name is required.' }, { status: 400 });
  }

  await env.DB.prepare(
    'INSERT INTO pledges (name, message) VALUES (?, ?)'
  )
    .bind(safeName, safeMsg)
    .run();

  return Response.json({ ok: true });
}
