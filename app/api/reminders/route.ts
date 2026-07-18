import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await pool.query(
      'SELECT id, user_id, title, amount, due_date, category, is_recurring, recurring_type, created_at FROM public.reminders WHERE user_id = $1 ORDER BY due_date ASC, created_at ASC',
      [user.id]
    );
    const rows = result.rows.map(r => ({
      ...r,
      amount: Number(r.amount),
      due_date: r.due_date.toISOString().split('T')[0]
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
    const { title, amount, due_date, category, is_recurring, recurring_type } = await req.json();

    if (!title || amount === undefined || !due_date) {
      return NextResponse.json({ error: 'Judul, jumlah, dan tanggal jatuh tempo wajib diisi' }, { status: 400 });
    }

    if (is_recurring && !['daily', 'weekly', 'monthly', 'yearly'].includes(recurring_type)) {
      return NextResponse.json({ error: 'Tipe perulangan tidak valid' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO public.reminders (user_id, title, amount, due_date, category, is_recurring, recurring_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user.id, title, amount, due_date, category || null, is_recurring || false, is_recurring ? recurring_type : null]
    );

    const r = result.rows[0];
    r.amount = Number(r.amount);
    r.due_date = r.due_date.toISOString().split('T')[0];

    return NextResponse.json({ data: r });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
