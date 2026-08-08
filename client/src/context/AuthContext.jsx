import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import authApi from '../api/auth.js';
import { toErrorMessage } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  // Restore the session from the httpOnly cookie on first paint.
  useEffect(() => {
    let cancelled = false;

    authApi
      .me()
      .then((restored) => {
        if (!cancelled) setUser(restored);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitialising(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Any 401 from anywhere in the app drops the session.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const signInWithGoogle = useCallback(async (credential) => {
    setSigningIn(true);
    try {
      const signedIn = await authApi.signInWithGoogle(credential);
      setUser(signedIn);
      toast.success(`Welcome back, ${signedIn.name.split(' ')[0]}`);
      return signedIn;
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not sign you in'));
      throw error;
    } finally {
      setSigningIn(false);
    }
  }, []);

  /**
   * Email and password sign-in. Errors are rethrown so the form can show them
   * inline rather than only as a toast.
   */
  const login = useCallback(async (credentials) => {
    setSigningIn(true);
    try {
      const signedIn = await authApi.login(credentials);
      setUser(signedIn);
      toast.success(`Welcome back, ${signedIn.name.split(' ')[0]}`);
      return signedIn;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setSigningIn(true);
    try {
      const created = await authApi.register(payload);
      setUser(created);
      toast.success(`Welcome, ${created.name.split(' ')[0]}! Let's build your first habit.`);
      return created;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The cookie is cleared server-side on a best-effort basis; either way the
      // client should end up signed out.
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await authApi.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initialising,
      signingIn,
      login,
      register,
      signInWithGoogle,
      logout,
      updateProfile,
    }),
    [user, initialising, signingIn, login, register, signInWithGoogle, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an <AuthProvider>');
  return context;
}

export default AuthContext;
