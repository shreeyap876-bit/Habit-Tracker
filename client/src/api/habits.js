import client from './client.js';

export const habitsApi = {
  list: (params = {}) => client.get('/habits', { params }).then((res) => res.data.habits),

  get: (id) => client.get(`/habits/${id}`).then((res) => res.data),

  create: (payload) => client.post('/habits', payload).then((res) => res.data.habit),

  update: (id, payload) => client.patch(`/habits/${id}`, payload).then((res) => res.data.habit),

  remove: (id) => client.delete(`/habits/${id}`),
};

export const logsApi = {
  /** All completions between two `YYYY-MM-DD` keys, inclusive. */
  range: (start, end) =>
    client.get('/logs', { params: { start, end } }).then((res) => res.data.logs),

  toggle: (habitId, date) =>
    client.post('/logs/toggle', { habitId, date }).then((res) => res.data),
};

export const statsApi = {
  overview: (date) => client.get('/stats/overview', { params: { date } }).then((res) => res.data),

  heatmap: (date, days = 112) =>
    client.get('/stats/heatmap', { params: { date, days } }).then((res) => res.data),
};

export default habitsApi;
