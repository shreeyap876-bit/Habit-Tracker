import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/pages.css';

// Falls back to a placeholder so the app still renders (and explains itself)
// when the client id has not been filled in yet.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing-google-client-id';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: 'var(--text-sm)',
                },
                success: { iconTheme: { primary: 'var(--success)', secondary: '#fffdfa' } },
                error: { iconTheme: { primary: 'var(--danger)', secondary: '#fffdfa' } },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
