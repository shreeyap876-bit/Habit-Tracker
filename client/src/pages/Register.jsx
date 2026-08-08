import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toErrorMessage } from '../api/client.js';
import AuthShell, { LeafOrnament } from '../components/auth/AuthShell.jsx';
import GoogleButton, { googleIsConfigured } from '../components/auth/GoogleButton.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import TextField from '../components/auth/TextField.jsx';
import Button from '../components/ui/Button.jsx';

const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
  const { isAuthenticated, register, signingIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const setField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = 'Enter your name';

    if (!form.email.trim()) next.email = 'Enter your email address';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address';

    if (!form.password) next.password = 'Choose a password';
    else if (form.password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
    } else if (form.password.length > 72) {
      next.password = 'Passwords are limited to 72 characters';
    }

    if (!form.confirmPassword) next.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError('');
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(toErrorMessage(error, 'Could not create your account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <section className="auth-card auth-card--form">
        <LeafOrnament />

        <p className="eyebrow auth-card__eyebrow">Get started</p>
        <h2 className="auth-card__title">Sign up</h2>
        <p className="auth-card__subtitle">Create an account, it&rsquo;s free</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Name"
            value={form.name}
            onChange={setField('name')}
            error={errors.name}
            placeholder="Your name"
            autoComplete="name"
            autoFocus
          />

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <PasswordField
            label="Password"
            value={form.password}
            onChange={setField('password')}
            error={errors.password}
            autoComplete="new-password"
          />

          <PasswordField
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={setField('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
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
            Sign Up
          </Button>
        </form>

        {googleIsConfigured && (
          <>
            <div className="auth-card__divider">
              <span>or</span>
            </div>

            <div className="auth-card__google">
              <GoogleButton onSuccess={() => navigate('/dashboard', { replace: true })} text="signup_with" />
            </div>
          </>
        )}

        <p className="auth-card__switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </section>
    </AuthShell>
  );
}
