import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await pool.query(
      'SELECT id, user_id, category, monthly_limit FROM public.budgets WHERE user_id = $1',
      [user.id]
    );
    
    const rows = result.rows.map(r => ({ ...r, monthly_limit: Number(r.monthly_limit) }));
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { category, monthly_limit } = await req.json();
    if (!category || monthly_limit === undefined) {
      return NextResponse.json({ error: 'Kategori dan limit wajib diisi' }, { status: 400 });
    }

    // Upsert
    const check = await pool.query('SELECT id FROM public.budgets WHERE user_id = $1 AND category = $2', [user.id, category]);
    if (check.rows.length > 0) {
      const result = await pool.query(
        'UPDATE public.budgets SET monthly_limit = $1 WHERE id = $2 RETURNING *',
        [monthly_limit, check.rows[0].id]
      );
      return NextResponse.json({ data: { ...result.rows[0], monthly_limit: Number(result.rows[0].monthly_limit) } });
    } else {
      const result = await pool.query(
        'INSERT INTO public.budgets (user_id, category, monthly_limit) VALUES ($1, $2, $3) RETURNING *',
        [user.id, category, monthly_limit]
      );
      return NextResponse.json({ data: { ...result.rows[0], monthly_limit: Number(result.rows[0].monthly_limit) } });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
