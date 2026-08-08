import client from './client.js';

export const coachApi = {
  history: () => client.get('/coach/history').then((res) => res.data.messages),

  /** Returns both the stored user message and the coach's reply. */
  send: (message, date) =>
    client.post('/coach/chat', { message, date }).then((res) => res.data.messages),

  tip: (date) => client.get('/coach/tip', { params: { date } }).then((res) => res.data.tip),

  clear: () => client.delete('/coach/history'),
};

export default coachApi;
