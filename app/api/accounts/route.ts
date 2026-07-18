import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await pool.query(
      'SELECT id, user_id, name, type, created_at FROM public.accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [user.id]
    );
    return NextResponse.json({ data: result.rows });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, type } = await req.json();
    if (!name || !type) {
      return NextResponse.json({ error: 'Nama dan tipe akun wajib diisi' }, { status: 400 });
    }

    const validTypes = ['bank', 'ewallet', 'cash', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipe akun tidak valid' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO public.accounts (user_id, name, type) VALUES ($1, $2, $3) RETURNING *',
      [user.id, name, type]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
