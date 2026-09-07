'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  demoMode,
  getSupabaseBrowserClient
} from '../../lib/supabase';
import { setDemoUser } from '../../lib/demo';

export default function Login() {
  const [email, setEmail] = useState('student@astrum.demo');
  const [password, setPassword] = useState('astrum');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('login');

  const router = useRouter();

  useEffect(() => {
    if (!demoMode) {
      setEmail('');
      setPassword('');
    }

    if (demoMode) return;

    const supabase = getSupabaseBrowserClient();
    let active = true;

    async function detectRecovery() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const hash = window.location.hash || '';

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }

          if (active) {
            setMode('reset');
            setMessage(
              'Recovery link verified. Choose a new password for your ASTRUM account.'
            );
          }

          return;
        }

        if (
          hash.includes('type=recovery') ||
          hash.includes('access_token=')
        ) {
          await new Promise((resolve) => setTimeout(resolve, 250));

          const {
            data: { session }
          } = await supabase.auth.getSession();

          if (active && session) {
            setMode('reset');
            setMessage(
              'Recovery link verified. Choose a new password for your ASTRUM account.'
            );
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err?.message ||
              'This recovery link is invalid or expired. Request a new password reset email.'
          );
          setMode('forgot');
        }
      }
    }

    detectRecovery();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        active &&
        event === 'PASSWORD_RECOVERY' &&
        session
      ) {
        setMode('reset');
        setMessage(
          'Recovery link verified. Choose a new password for your ASTRUM account.'
        );
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();

    setBusy(true);
    setError('');
    setMessage('');

    if (demoMode) {
      setDemoUser({
        email,
        full_name: 'Astrum Scholar',
        role: 'student'
      });

      router.push('/dashboard');
      return;
    }

    const supabase = getSupabaseBrowserClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    router.push('/dashboard');
  }

  async function handleForgotPassword(event) {
    event.preventDefault();

    setBusy(true);
    setError('');
    setMessage('');

    const supabase = getSupabaseBrowserClient();

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/login`
        }
      );

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        'Password reset email sent. Open the newest ASTRUM password reset email.'
      );
    }

    setBusy(false);
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setBusy(true);

    const supabase = getSupabaseBrowserClient();

    const { error } =
      await supabase.auth.updateUser({
        password
      });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    await supabase.auth.signOut();

    window.history.replaceState(
      {},
      '',
      window.location.pathname
    );

    setPassword('');
    setConfirmPassword('');
    setMode('login');
    setBusy(false);

    setMessage(
      'Password updated successfully. Sign in with your new password.'
    );
  }

  function returnToLogin() {
    setMode('login');
    setError('');
    setMessage('');
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="loginPage">
      <div className="loginGlow"></div>

      <section className="loginPanel">
        <img
          src="/astrum-crest.png"
          alt="Astrum crest"
          className="loginCrest"
        />

        <div className="eyebrow">
          THE ADAM INSTITUTE AT ELTON
        </div>

        <h1>
          {mode === 'login'
            ? 'WELCOME TO '
            : mode === 'forgot'
            ? 'RESET '
            : 'REESTABLISH '}

          <span>
            {mode === 'login'
              ? 'ASTRUM'
              : 'ACCESS'}
          </span>
        </h1>

        <p className="motto">
          AD ASTRA. CUM FIDE.
        </p>

        <p className="subtle">
          {mode === 'login'
            ? 'Private mission systems learning environment'
            : mode === 'forgot'
            ? 'Request a secure password reset link.'
            : 'Choose a new password for your ASTRUM account.'}
        </p>

        {message && (
          <div className="success">
            {message}
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </label>

            <button
              className="primaryBtn"
              disabled={busy}
            >
              {busy
                ? 'Authenticating…'
                : 'CONTINUE MISSION'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </label>

            <button
              className="primaryBtn"
              disabled={busy}
            >
              {busy
                ? 'Sending…'
                : 'SEND RESET LINK'}
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <label>
              New Password
              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={8}
                required
              />
            </label>

            <label>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                minLength={8}
                required
              />
            </label>

            <button
              className="primaryBtn"
              disabled={busy}
            >
              {busy
                ? 'Updating…'
                : 'SET NEW PASSWORD'}
            </button>
          </form>
        )}

        {!demoMode &&
          mode === 'login' && (
            <div className="loginLinks">
              <button
                className="textBtn"
                type="button"
                onClick={() => {
                  setError('');
                  setMessage('');
                  setMode('forgot');
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

        {!demoMode &&
          mode === 'forgot' && (
            <div className="loginLinks">
              <button
                className="textBtn"
                type="button"
                onClick={returnToLogin}
              >
                Return to sign in
              </button>
            </div>
          )}

        {demoMode && (
          <div className="demoNote">
            Demo mode is active. Production
            deployment uses individual Supabase
            accounts.
          </div>
        )}
      </section>
    </div>
  );
}
