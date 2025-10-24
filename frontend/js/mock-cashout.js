import { onReady, cashOutDemo, getState, formatPoints } from './app.js';

onReady(() => {
  const amount = document.getElementById('amount');
  const btn = document.getElementById('cashout');
  const msg = document.getElementById('cashout-msg');
  if (!amount || !btn) return;
  btn.addEventListener('click', () => {
    const cents = Math.round(Number(amount.value || '0') * 100);
    const res = cashOutDemo(cents);
    if (res.ok) {
      msg.textContent = 'Cash out requested (mock)';
      document.getElementById('points').textContent = formatPoints(getState().user.points);
    } else {
      msg.textContent = res.error;
    }
  });
});
