import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../ui/Spinner.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/** True when a real client id has been supplied in `client/.env`. */
export const googleIsConfigured =
  Boolean(GOOGLE_CLIENT_ID) && !GOOGLE_CLIENT_ID.startsWith('<');

/**
 * Google Sign-In button. Explains itself instead of rendering a dead control
 * when the client id is missing.
 *
 * @param {(user: object) => void} props.onSuccess  Called once signed in.
 */
export default function GoogleButton({ onSuccess, text = 'continue_with' }) {
  const { signInWithGoogle, signingIn } = useAuth();

  if (!googleIsConfigured) {
    return (
      <p className="auth-card__notice">
        Google sign-in is not configured. Add <code>VITE_GOOGLE_CLIENT_ID</code> to{' '}
        <code>client/.env</code> and restart the dev server.
      </p>
    );
  }

  if (signingIn) {
    return (
      <div className="row" style={{ color: 'var(--muted)' }}>
        <Spinner />
        <span>Signing you in…</span>
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={async (response) => {
        try {
          const user = await signInWithGoogle(response.credential);
          onSuccess?.(user);
        } catch {
          // The auth context has already surfaced this as a toast.
        }
      }}
      onError={() => toast.error('Google sign-in was cancelled or failed')}
      shape="pill"
      size="large"
      width="300"
      text={text}
    />
  );
}
