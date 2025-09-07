import { query } from './db';
import { Effect } from '../types';

// エフェクター一覧取得
export async function getEffects(userId: string): Promise<Effect[]> {
  const result = await query(
    'SELECT * FROM effects WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

// エフェクター取得（単体）
export async function getEffect(id: string, userId: string): Promise<Effect | null> {
  const result = await query(
    'SELECT * FROM effects WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

// エフェクター作成
export async function createEffect(
  userId: string,
  name: string,
  widthMm: number,
  heightMm: number,
  memo?: string
): Promise<Effect> {
  const result = await query(
    `INSERT INTO effects (user_id, name, width_mm, height_mm, memo) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [userId, name, widthMm, heightMm, memo || null]
  );
  return result.rows[0];
}

// エフェクター更新
export async function updateEffect(
  id: string,
  userId: string,
  name: string,
  widthMm: number,
  heightMm: number,
  memo?: string
): Promise<Effect | null> {
  const result = await query(
    `UPDATE effects 
     SET name = $3, width_mm = $4, height_mm = $5, memo = $6 
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    [id, userId, name, widthMm, heightMm, memo || null]
  );
  return result.rows[0] || null;
}

// エフェクター削除
export async function deleteEffect(id: string, userId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM effects WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rowCount > 0;
}