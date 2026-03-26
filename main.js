function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return '';
  }
}

async function loadPledges() {
  const wall = document.getElementById('pledgeWall');
  try {
    const res = await fetch('/api/pledge');
    if (!res.ok) throw new Error();
    const pledges = await res.json();
    if (!pledges.length) {
      wall.innerHTML = '<p class="wall-empty">No pledges yet — be the first!</p>';
      return;
    }
    wall.innerHTML = pledges.map(p => `
      <div class="wall-card">
        <div class="pledger-name">${escHtml(p.name)}</div>
        ${p.message ? `<div class="pledger-msg">"${escHtml(p.message)}"</div>` : ''}
        <div class="pledger-date">${formatDate(p.created_at)}</div>
      </div>
    `).join('');
  } catch {
    wall.innerHTML = '<p class="wall-empty">Could not load pledges right now.</p>';
  }
}

document.getElementById('pledgeForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const feedback = document.getElementById('pledgeFeedback');
  const btn = this.querySelector('.pledge-btn');
  const name = document.getElementById('pledgeName').value.trim();
  const message = document.getElementById('pledgeMessage').value.trim();
  const tokenEl = this.querySelector('[name="cf-turnstile-response"]');
  const token = tokenEl ? tokenEl.value : '';

  if (!name) {
    feedback.textContent = 'Please enter your name.';
    feedback.className = 'pledge-feedback error';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending…';
  feedback.textContent = '';
  feedback.className = 'pledge-feedback';

  try {
    const res = await fetch('/api/pledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message, token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');

    feedback.textContent = 'Welcome to No Štokel. The world needs more friends like you.';
    feedback.className = 'pledge-feedback success';
    btn.textContent = 'Pledge Taken ✓';
    btn.style.background = '#27ae60';
    btn.style.cursor = 'default';
    loadPledges();
  } catch (err) {
    feedback.textContent = err.message;
    feedback.className = 'pledge-feedback error';
    btn.disabled = false;
    btn.textContent = 'I Take This Pledge';
    if (window.turnstile) window.turnstile.reset();
  }
});

loadPledges();
