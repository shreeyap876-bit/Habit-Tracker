import { Component } from 'react';

/**
 * Last line of defence: keeps a render-time crash from leaving a blank page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ui] Unhandled render error', error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="auth">
        <div className="auth-card" style={{ width: 'min(520px, 100%)' }}>
          <p className="eyebrow">Something broke</p>
          <h1 className="auth-card__title" style={{ fontSize: 'var(--text-xl)' }}>
            The app hit an unexpected error
          </h1>
          <p className="auth-card__subtitle">
            Reloading usually clears it. If it keeps happening, check the browser console for details.
          </p>
          <div style={{ marginTop: 'var(--space-5)' }}>
            <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
              Reload the page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
