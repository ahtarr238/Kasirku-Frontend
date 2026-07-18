import { Pool } from 'pg';

// Kita gunakan koneksi Singleton untuk mencegah 
// too many connections saat live reload di development
let pool: Pool;

declare global {
  var __dbPool: Pool | undefined;
}

if (!global.__dbPool) {
  global.__dbPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Jika perlu SSL untuk Supabase dsb, biasanya tambahkan ini:
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });
}

pool = global.__dbPool;

export default pool;
