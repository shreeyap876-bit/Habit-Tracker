import axios from 'axios';

/**
 * Single axios instance for the whole app.
 *
 * `withCredentials` matters: the session lives in an httpOnly cookie, so the
 * browser has to be allowed to attach it to every request.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/** Pulls the readable message out of whatever shape the failure arrived in. */
export function toErrorMessage(error, fallback = 'Something went wrong') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'The request timed out — please try again';
  if (error?.message === 'Network Error') return 'Cannot reach the server. Is the API running?';
  return error?.message || fallback;
}

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;

    // Let the auth layer know the session is gone so it can bounce to /login.
    if (status === 401 && !error.config?.skipAuthRedirect) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(
      Object.assign(error, {
        friendlyMessage: toErrorMessage(error),
        status,
      })
    );
  }
);

export default client;
