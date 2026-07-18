import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const check = await pool.query('SELECT id FROM public.goals WHERE id = $1 AND user_id = $2', [id, user.id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Goal tidak ditemukan' }, { status: 404 });
    }

    const { name, target_amount, linked_account_id, current_amount, target_date } = await req.json();

    const result = await pool.query(
      `UPDATE public.goals 
       SET name = COALESCE($1, name),
           target_amount = COALESCE($2, target_amount),
           linked_account_id = $3,
           current_amount = COALESCE($4, current_amount),
           target_date = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [name, target_amount, linked_account_id || null, current_amount, target_date || null, id, user.id]
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
