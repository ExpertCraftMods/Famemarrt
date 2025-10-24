const STORAGE_KEY = 'rewards_demo_state_v1';

const initialState = {
  user: {
    id: 'demo-user',
    displayName: 'Demo User',
    points: 250,
    referralCode: 'DEMO1234',
  },
  tasks: [
    { id: 't1', title: 'Daily Survey', description: '3-minute survey about shopping', type: 'survey', points: 50, status: 'available' },
    { id: 't2', title: 'Watch a Trailer', description: 'Watch a 30s product trailer', type: 'video', points: 20, status: 'available' },
    { id: 't3', title: 'Try an App', description: 'Install and try the app', type: 'offer', points: 150, status: 'available' },
  ],
  activity: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const s = JSON.parse(raw);
    return { ...initialState, ...s };
  } catch {
    return initialState;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getState() {
  return loadState();
}

export function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

export function formatPoints(p) {
  return `${p} pts`;
}

export function completeTask(taskId) {
  const state = loadState();
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.status === 'completed') return state;
  task.status = 'completed';
  state.user.points += task.points;
  state.activity.unshift({ type: 'earn', amount: task.points, note: `Completed: ${task.title}`, ts: Date.now() });
  saveState(state);
  return state;
}

export function cashOutDemo(amountCents) {
  const state = loadState();
  const pointsNeeded = Math.ceil(amountCents / 100) * 100; // demo rate: 100 pts = $1
  if (state.user.points < pointsNeeded) {
    return { ok: false, error: 'Not enough points' };
  }
  state.user.points -= pointsNeeded;
  state.activity.unshift({ type: 'redeem', amount: -pointsNeeded, note: `Cash out $${(amountCents/100).toFixed(2)} (mock)`, ts: Date.now() });
  saveState(state);
  return { ok: true, state };
}
