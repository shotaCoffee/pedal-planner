import { NextRequest, NextResponse } from 'next/server';
import { getBoards } from '../../../lib/boards';

// GET /api/boards - ペダルボード一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const boards = await getBoards(userId);
    return NextResponse.json(boards);
  } catch (error) {
    console.error('Failed to fetch boards:', error);
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}