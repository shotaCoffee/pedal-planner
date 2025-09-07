import { query } from './db';
import { Board } from '../types';

// ペダルボード一覧取得
export async function getBoards(userId: string): Promise<Board[]> {
  const result = await query(
    'SELECT * FROM boards WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

// ペダルボード取得（単体）
export async function getBoard(id: string, userId: string): Promise<Board | null> {
  const result = await query(
    'SELECT * FROM boards WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

// ペダルボード作成
export async function createBoard(
  userId: string,
  name: string,
  widthMm: number,
  heightMm: number,
  memo?: string
): Promise<Board> {
  const result = await query(
    `INSERT INTO boards (user_id, name, width_mm, height_mm, memo) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [userId, name, widthMm, heightMm, memo || null]
  );
  return result.rows[0];
}

// ペダルボード更新
export async function updateBoard(
  id: string,
  userId: string,
  name: string,
  widthMm: number,
  heightMm: number,
  memo?: string
): Promise<Board | null> {
  const result = await query(
    `UPDATE boards 
     SET name = $3, width_mm = $4, height_mm = $5, memo = $6 
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    [id, userId, name, widthMm, heightMm, memo || null]
  );
  return result.rows[0] || null;
}

// ペダルボード削除
export async function deleteBoard(id: string, userId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM boards WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rowCount > 0;
}