import { NextRequest, NextResponse } from 'next/server';
import { getEffects } from '../../../lib/effects';

// GET /api/effects - エフェクター一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const effects = await getEffects(userId);
    return NextResponse.json(effects);
  } catch (error) {
    console.error('Failed to fetch effects:', error);
    return NextResponse.json({ error: 'Failed to fetch effects' }, { status: 500 });
  }
}