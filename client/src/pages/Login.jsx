import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toErrorMessage } from '../api/client.js';
import AuthShell, { LeafOrnament } from '../components/auth/AuthShell.jsx';
import GoogleButton, { googleIsConfigured } from '../components/auth/GoogleButton.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import TextField from '../components/auth/TextField.jsx';
import Button from '../components/ui/Button.jsx';

export default function Login() {
  const { isAuthenticated, login, signingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  const setField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Enter your email address';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Enter your password';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError('');
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(toErrorMessage(error, 'Could not sign you in'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <section className="auth-card auth-card--form">
        <LeafOrnament />

        <p className="eyebrow auth-card__eyebrow">Welcome back</p>
        <h2 className="auth-card__title">Log in</h2>
        <p className="auth-card__subtitle">Here you log in securely</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
          />

          <PasswordField
            label="Password"
            value={form.password}
            onChange={setField('password')}
            error={errors.password}
            autoComplete="current-password"
          />

          {formError && (
            <p className="auth-card__notice" role="alert">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            block
            loading={submitting}
            disabled={signingIn}
          >
            Log in
          </Button>
        </form>

        {googleIsConfigured && (
          <>
            <div className="auth-card__divider">
              <span>or</span>
            </div>

            <div className="auth-card__google">
              <GoogleButton onSuccess={() => navigate(redirectTo, { replace: true })} text="signin_with" />
            </div>
          </>
        )}

        <p className="auth-card__switch">
          Don&rsquo;t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </section>
    </AuthShell>
  );
}
