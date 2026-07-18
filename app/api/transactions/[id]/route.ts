import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const check = await pool.query('SELECT id, type, goal_id, amount FROM public.transactions WHERE id = $1 AND user_id = $2', [id, user.id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    const tx = check.rows[0];

    await pool.query('DELETE FROM public.transactions WHERE id = $1 AND user_id = $2', [id, user.id]);

    if (tx.type === 'saving' && tx.goal_id) {
      await pool.query('UPDATE public.goals SET current_amount = current_amount - $1 WHERE id = $2 AND user_id = $3', [tx.amount, tx.goal_id, user.id]);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
