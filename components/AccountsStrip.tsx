import { Account } from '@/lib/types';

interface AccountsStripProps {
  accounts: Account[];
}

export function AccountsStrip({ accounts }: AccountsStripProps) {
  const totalBalance = accounts.reduce((acc, account) => acc + (account.balance || 0), 0);

  return (
    <div className="mb-10">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Total Saldo
        </p>
        <h2 className="text-4xl" style={{ fontFamily: 'var(--font-mono)' }}>
          Rp {totalBalance.toLocaleString('id-ID')}
        </h2>
      </div>

      {accounts.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory w-full">
          {accounts.map(account => (
            <div 
              key={account.id} 
              className="w-[80vw] sm:w-[240px] p-4 rounded-sm flex-shrink-0 snap-start"
              style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium truncate pr-2">{account.name}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider" style={{ background: 'var(--bg)', color: 'var(--text-dim)', border: '1px solid var(--line)' }}>
                  {account.type}
                </span>
              </div>
              <p className="text-lg" style={{ fontFamily: 'var(--font-mono)' }}>
                Rp {(account.balance || 0).toLocaleString('id-ID')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center rounded-sm text-sm" style={{ border: '1px dashed var(--line-strong)', color: 'var(--text-dim)' }}>
          Belum ada akun terdaftar.
        </div>
      )}
    </div>
  );
}
