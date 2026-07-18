import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const check = await pool.query('SELECT * FROM public.reminders WHERE id = $1 AND user_id = $2', [id, user.id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Pengingat tidak ditemukan' }, { status: 404 });
    }

    const reminder = check.rows[0];
    const body = await req.json();
    const { title, amount, due_date, category, is_recurring, recurring_type, action } = body;

    if (action === 'mark_paid') {
      if (reminder.is_recurring) {
        let interval = '1 month';
        if (reminder.recurring_type === 'daily') interval = '1 day';
        if (reminder.recurring_type === 'weekly') interval = '1 week';
        if (reminder.recurring_type === 'yearly') interval = '1 year';
        
        const updateResult = await pool.query(
          `UPDATE public.reminders SET due_date = due_date + interval '${interval}' WHERE id = $1 AND user_id = $2 RETURNING *`,
          [id, user.id]
        );
        const r = updateResult.rows[0];
        r.amount = Number(r.amount);
        r.due_date = r.due_date.toISOString().split('T')[0];
        return NextResponse.json({ data: r });
      } else {
        await pool.query('DELETE FROM public.reminders WHERE id = $1 AND user_id = $2', [id, user.id]);
        return NextResponse.json({ success: true, deleted: true });
      }
    }

    const result = await pool.query(
      `UPDATE public.reminders 
       SET title = COALESCE($1, title),
           amount = COALESCE($2, amount),
           due_date = COALESCE($3, due_date),
           category = $4,
           is_recurring = COALESCE($5, is_recurring),
           recurring_type = $6
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title, amount, due_date, category !== undefined ? category : reminder.category, is_recurring, recurring_type !== undefined ? recurring_type : reminder.recurring_type, id, user.id]
    );

    const r = result.rows[0];
    r.amount = Number(r.amount);
    r.due_date = r.due_date.toISOString().split('T')[0];

    return NextResponse.json({ data: r });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const result = await pool.query('DELETE FROM public.reminders WHERE id = $1 AND user_id = $2 RETURNING id', [id, user.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pengingat tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
