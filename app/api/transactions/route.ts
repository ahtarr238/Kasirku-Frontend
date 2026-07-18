import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await pool.query(
      'SELECT id, user_id, account_id, to_account_id, goal_id, date, type, category, amount, note, created_at FROM public.transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
      [user.id]
    );
    const rows = result.rows.map(r => ({
      ...r,
      amount: Number(r.amount),
      date: r.date.toISOString().split('T')[0]
    }));
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { account_id, to_account_id, goal_id, date, type, category, amount, note } = await req.json();

    if (!account_id || !date || !type || amount === undefined) {
      return NextResponse.json({ error: 'Data transaksi tidak lengkap' }, { status: 400 });
    }

    if (!['income', 'expense', 'transfer', 'saving'].includes(type)) {
      return NextResponse.json({ error: 'Tipe transaksi tidak valid' }, { status: 400 });
    }

    if (type === 'transfer' && !to_account_id) {
      return NextResponse.json({ error: 'Akun tujuan wajib diisi untuk transfer' }, { status: 400 });
    }

    if (type === 'transfer' && account_id === to_account_id) {
      return NextResponse.json({ error: 'Akun asal dan tujuan tidak boleh sama' }, { status: 400 });
    }

    if (type === 'saving') {
      if (!goal_id) {
        return NextResponse.json({ error: 'Target Tabungan wajib diisi' }, { status: 400 });
      }
      const checkGoal = await pool.query('SELECT id FROM public.goals WHERE id = $1 AND user_id = $2', [goal_id, user.id]);
      if (checkGoal.rows.length === 0) {
        return NextResponse.json({ error: 'Tabungan tidak ditemukan' }, { status: 404 });
      }
    }

    const result = await pool.query(
      `INSERT INTO public.transactions (user_id, account_id, to_account_id, goal_id, date, type, category, amount, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [user.id, account_id, to_account_id || null, goal_id || null, date, type, category || null, amount, note || null]
    );

    if (type === 'saving' && goal_id) {
      await pool.query('UPDATE public.goals SET current_amount = current_amount + $1 WHERE id = $2 AND user_id = $3', [amount, goal_id, user.id]);
    }

    const r = result.rows[0];
    r.amount = Number(r.amount);
    r.date = r.date.toISOString().split('T')[0];

    return NextResponse.json({ data: r });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
