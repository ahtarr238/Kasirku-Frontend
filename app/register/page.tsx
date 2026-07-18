'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import { setToken } from '@/lib/auth';

interface RegisterResponse {
  token: string;
  user: { id: string; email: string; name: string | null };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await apiPost('/api/auth/register', {
        name,
        email,
        password,
      });
      
      // Auto login after register
      const loginRes = await apiPost<{ data: { token: string } }>('/api/auth/login', {
        email,
        password,
      });
      
      setToken(loginRes.data.token);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: 'var(--bg)',
    color: 'var(--text)',
    border: '1px solid var(--line-strong)',
    fontFamily: 'var(--font-mono)',
  };

  const labelStyle = {
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
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
            Buat akun baru
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
          {/* Nama */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-xs tracking-wide uppercase"
              style={labelStyle}
            >
              Nama <span style={{ color: 'var(--text-muted)' }}>(opsional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              autoComplete="name"
              className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line-strong)')}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs tracking-wide uppercase"
              style={labelStyle}
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
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line-strong)')}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs tracking-wide uppercase"
              style={labelStyle}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 karakter"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line-strong)')}
            />
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-1">
            <label
              htmlFor="confirm"
              className="text-xs tracking-wide uppercase"
              style={labelStyle}
            >
              Konfirmasi Password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi password"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line-strong)')}
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
            {loading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>

        {/* Login link */}
        <p
          className="text-center text-sm mt-4"
          style={{ color: 'var(--text-dim)' }}
        >
          Sudah punya akun?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--accent-gold)' }}
            className="hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
