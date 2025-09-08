import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// GET /api/effects - エフェクター一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await query(
      'SELECT * FROM effects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const effects = result.rows;
    return NextResponse.json(effects);
  } catch (error) {
    console.error('Effects fetch error:', error);
    return NextResponse.json(
      { error: `Failed to fetch effects: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// POST /api/effects - エフェクター作成
export async function POST(request: NextRequest) {
  try {
    const { userId, name, width_mm, height_mm, memo } = await request.json();

    if (!userId || !name || !width_mm || !height_mm) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO effects (user_id, name, width_mm, height_mm, memo) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, name, width_mm, height_mm, memo || null]
    );
    const effect = result.rows[0];
    return NextResponse.json(effect, { status: 201 });
  } catch (error) {
    console.error('Effect creation error:', error);
    return NextResponse.json(
      { error: `Failed to create effect: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// PUT /api/effects - エフェクター更新
export async function PUT(request: NextRequest) {
  try {
    const { id, userId, name, widthMm, heightMm, memo } = await request.json();

    if (!id || !userId || !name || !widthMm || !heightMm) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const result = await query(
      `UPDATE effects 
       SET name = $3, width_mm = $4, height_mm = $5, memo = $6 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId, name, widthMm, heightMm, memo || null]
    );
    const effect = result.rows[0] || null;
    return NextResponse.json(effect);
  } catch (error) {
    console.error('Effect update error:', error);
    return NextResponse.json(
      { error: `Failed to update effect: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// DELETE /api/effects - エフェクター削除
export async function DELETE(request: NextRequest) {
  try {
    const { id, userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId are required' }, { status: 400 });
    }

    const result = await query(
      'DELETE FROM effects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    const success = (result.rowCount ?? 0) > 0;
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to delete effect' }, { status: 404 });
    }
  } catch (error) {
    console.error('Effect deletion error:', error);
    return NextResponse.json(
      { error: `Failed to delete effect: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}