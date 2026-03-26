function takePledge() {
  const msg = document.getElementById('pledgeMsg');
  const btn = document.querySelector('.pledge-btn');
  msg.classList.add('show');
  btn.textContent = 'Pledge Taken ✓';
  btn.disabled = true;
  btn.style.background = '#27ae60';
  btn.style.cursor = 'default';
}
