import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { Board } from '../../../types';

// GET /api/boards - ペダルボード一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await query(
      'SELECT * FROM boards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const boards = result.rows;
    return NextResponse.json(boards);
  } catch (error) {
    console.error('Failed to fetch boards:', error);
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}

// POST /api/boards - ペダルボード作成
export async function POST(request: NextRequest) {
  try {
    const { userId, name, widthMm, heightMm, memo } = await request.json();

    if (!userId || !name || !widthMm || !heightMm) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO boards (user_id, name, width_mm, height_mm, memo) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, name, widthMm, heightMm, memo || null]
    );
    const board = result.rows[0];
    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error('Failed to create board:', error);
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 });
  }
}

// PUT /api/boards - ペダルボード更新
export async function PUT(request: NextRequest) {
  try {
    const { id, userId, name, widthMm, heightMm, memo } = await request.json();

    if (!id || !userId || !name || !widthMm || !heightMm) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const result = await query(
      `UPDATE boards 
       SET name = $3, width_mm = $4, height_mm = $5, memo = $6 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId, name, widthMm, heightMm, memo || null]
    );
    const board = result.rows[0] || null;
    return NextResponse.json(board);
  } catch (error) {
    console.error('Failed to update board:', error);
    return NextResponse.json({ error: 'Failed to update board' }, { status: 500 });
  }
}

// DELETE /api/boards - ペダルボード削除
export async function DELETE(request: NextRequest) {
  try {
    const { id, userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId are required' }, { status: 400 });
    }

    const result = await query(
      'DELETE FROM boards WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    const success = result.rowCount > 0;
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to delete board' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to delete board:', error);
    return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}