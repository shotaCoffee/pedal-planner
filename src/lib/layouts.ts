import { query } from './db';
import { Layout, LayoutData } from '../types';

// レイアウト一覧取得
export async function getLayouts(userId: string): Promise<Layout[]> {
  const result = await query(
    'SELECT * FROM layouts WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );
  return result.rows;
}

// レイアウト取得（単体）
export async function getLayout(id: string, userId: string): Promise<Layout | null> {
  const result = await query(
    'SELECT * FROM layouts WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

// レイアウト作成
export async function createLayout(
  userId: string,
  boardId: string,
  name: string,
  layoutData: LayoutData,
  signalChainMemo?: string,
  generalMemo?: string
): Promise<Layout> {
  const result = await query(
    `INSERT INTO layouts (user_id, board_id, name, layout_data, signal_chain_memo, general_memo) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [userId, boardId, name, JSON.stringify(layoutData), signalChainMemo || null, generalMemo || null]
  );
  return result.rows[0];
}

// レイアウト更新
export async function updateLayout(
  id: string,
  userId: string,
  name: string,
  layoutData: LayoutData,
  signalChainMemo?: string,
  generalMemo?: string
): Promise<Layout | null> {
  const result = await query(
    `UPDATE layouts 
     SET name = $3, layout_data = $4, signal_chain_memo = $5, general_memo = $6, updated_at = NOW()
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    [id, userId, name, JSON.stringify(layoutData), signalChainMemo || null, generalMemo || null]
  );
  return result.rows[0] || null;
}

// レイアウト削除
export async function deleteLayout(id: string, userId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM layouts WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

// ボード別レイアウト一覧取得
export async function getLayoutsByBoard(boardId: string, userId: string): Promise<Layout[]> {
  const result = await query(
    'SELECT * FROM layouts WHERE board_id = $1 AND user_id = $2 ORDER BY updated_at DESC',
    [boardId, userId]
  );
  return result.rows;
}

// 共有コード生成・更新
export async function generateShareCode(id: string, userId: string): Promise<string | null> {
  // 8文字のランダムな共有コード生成
  const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const result = await query(
    `UPDATE layouts 
     SET share_code = $3, updated_at = NOW()
     WHERE id = $1 AND user_id = $2 
     RETURNING share_code`,
    [id, userId, shareCode]
  );
  
  return result.rows[0]?.share_code || null;
}

// 共有コードでレイアウト取得
export async function getLayoutByShareCode(shareCode: string): Promise<Layout | null> {
  const result = await query(
    'SELECT * FROM layouts WHERE share_code = $1',
    [shareCode]
  );
  return result.rows[0] || null;
}