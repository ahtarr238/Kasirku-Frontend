import { LogOut, Plus } from 'lucide-react';
import { removeToken, TokenPayload } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  user: TokenPayload | null;
  onAddTransaction: () => void;
  onAddAccount: () => void;
  onExport: () => void;
}

export function Header({ user, onAddTransaction, onAddAccount, onExport }: HeaderProps) {
  const router = useRouter();

  function handleLogout() {
    removeToken();
    router.replace('/login');
  }

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b" style={{ borderColor: 'var(--line)' }}>
      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}>
          Kasirku
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          {user?.email || 'Memuat...'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onAddAccount}
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-sm transition-colors hover:bg-white/5"
          style={{ border: '1px dashed var(--line-strong)', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
        >
          <Plus size={14} /> Akun
        </button>
        <button
          onClick={onAddTransaction}
          className="hidden sm:flex items-center gap-2 px-4 py-1.5 text-xs rounded-sm transition-opacity hover:opacity-80 font-medium"
          style={{ background: 'var(--accent-gold)', color: '#101a2b', fontFamily: 'var(--font-mono)' }}
        >
          <Plus size={14} /> Transaksi
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-sm transition-colors hover:bg-white/5"
          style={{ border: '1px solid var(--line-strong)', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
        >
          Export
        </button>
        <div className="w-px h-6 mx-1" style={{ background: 'var(--line-strong)' }} />
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-sm transition-colors hover:bg-white/5 text-red-400"
          title="Keluar"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
