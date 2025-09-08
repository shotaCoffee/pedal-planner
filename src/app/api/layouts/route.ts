import { NextRequest, NextResponse } from 'next/server';
import { getLayouts, createLayout, deleteLayout } from '../../../lib/layouts';
import { LayoutData } from '../../../types';

// GET /api/layouts - レイアウト一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const layouts = await getLayouts(userId);
    return NextResponse.json(layouts);
  } catch (error) {
    throw new Error(`Failed to fetch layouts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// POST /api/layouts - レイアウト作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, boardId, name, layoutData, signalChainMemo, generalMemo } = body;

    if (!userId || !boardId || !name || !layoutData) {
      return NextResponse.json(
        { error: 'userId, boardId, name, and layoutData are required' },
        { status: 400 }
      );
    }

    const layout = await createLayout(
      userId,
      boardId,
      name,
      layoutData as LayoutData,
      signalChainMemo,
      generalMemo
    );

    return NextResponse.json(layout, { status: 201 });
  } catch (error) {
    throw new Error(`Failed to create layout: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// DELETE /api/layouts - レイアウト削除
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId are required' }, { status: 400 });
    }

    const success = await deleteLayout(id, userId);
    
    if (success) {
      return NextResponse.json({ message: 'Layout deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
    }
  } catch (error) {
    throw new Error(`Failed to delete layout: ${error instanceof Error ? error.message : String(error)}`);
  }
}