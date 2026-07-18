import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await pool.query(
      'SELECT id, user_id, name, target_amount, linked_account_id, current_amount, target_date, created_at FROM public.goals WHERE user_id = $1 ORDER BY created_at ASC',
      [user.id]
    );
    const rows = result.rows.map(r => ({
      ...r,
      target_amount: Number(r.target_amount),
      current_amount: Number(r.current_amount),
      target_date: r.target_date ? r.target_date.toISOString().split('T')[0] : null
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
    const { name, target_amount, linked_account_id, current_amount, target_date } = await req.json();

    if (!name || target_amount === undefined) {
      return NextResponse.json({ error: 'Nama dan target wajib diisi' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO public.goals (user_id, name, target_amount, linked_account_id, current_amount, target_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.id, name, target_amount, linked_account_id || null, current_amount || 0, target_date || null]
    );

    const r = result.rows[0];
    r.target_amount = Number(r.target_amount);
    r.current_amount = Number(r.current_amount);
    if (r.target_date) r.target_date = r.target_date.toISOString().split('T')[0];

    return NextResponse.json({ data: r });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
