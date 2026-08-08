import client from './client.js';

export const authApi = {
  /** Creates an account from an email and password. */
  register: (payload) => client.post('/auth/register', payload).then((res) => res.data.user),

  /** Exchanges an email and password for a session. */
  login: (payload) => client.post('/auth/login', payload).then((res) => res.data.user),

  /** Exchanges the Google ID token for a session cookie. */
  signInWithGoogle: (credential) =>
    client.post('/auth/google', { credential }).then((res) => res.data.user),

  /** Restores the session on page load. `skipAuthRedirect` stops the 401 loop. */
  me: () =>
    client
      .get('/auth/me', { skipAuthRedirect: true })
      .then((res) => res.data.user),

  updateProfile: (payload) => client.patch('/auth/me', payload).then((res) => res.data.user),

  logout: () => client.post('/auth/logout'),
};

export default authApi;
