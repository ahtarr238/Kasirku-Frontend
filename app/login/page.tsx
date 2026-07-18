'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import { setToken } from '@/lib/auth';

interface LoginResponse {
  token: string;
  user: { id: string; email: string; name: string | null };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiPost<{ data: LoginResponse }>('/api/auth/login', {
        email,
        password,
      });
      setToken(res.data.token);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm fade-in">
        {/* Header */}
        <div className="text-center mb-8 space-y-1">
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}
          >
            Kasirku
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Masuk ke akun Anda
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-sm p-6"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line-strong)',
          }}
        >
          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs tracking-wide uppercase"
              style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              autoComplete="email"
              className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--line-strong)',
                fontFamily: 'var(--font-mono)',
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = 'var(--accent-gold)')
              }
              onBlur={(e) =>
                (e.target.style.borderColor = 'var(--line-strong)')
              }
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs tracking-wide uppercase"
              style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--line-strong)',
                fontFamily: 'var(--font-mono)',
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = 'var(--accent-gold)')
              }
              onBlur={(e) =>
                (e.target.style.borderColor = 'var(--line-strong)')
              }
            />
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-xs px-3 py-2 rounded-sm"
              style={{
                color: 'var(--accent-rust)',
                background: 'var(--accent-rust-dim)',
                border: '1px solid var(--accent-rust)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {error}
            </p>
          )}

          {/* Garis pemisah */}
          <div style={{ borderTop: '1px solid var(--line)' }} />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-medium tracking-wide transition-opacity rounded-sm"
            style={{
              background: 'var(--accent-gold)',
              color: '#101a2b',
              fontFamily: 'var(--font-mono)',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Register link */}
        <p
          className="text-center text-sm mt-4"
          style={{ color: 'var(--text-dim)' }}
        >
          Belum punya akun?{' '}
          <Link
            href="/register"
            style={{ color: 'var(--accent-gold)' }}
            className="hover:underline"
          >
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
