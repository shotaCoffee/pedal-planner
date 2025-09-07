import { NextRequest, NextResponse } from 'next/server';
import { generateShareCode } from '../../../../lib/layouts';

// POST /api/layouts/share-code - 共有コード生成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId are required' }, { status: 400 });
    }

    const shareCode = await generateShareCode(id, userId);
    
    if (shareCode) {
      return NextResponse.json({ shareCode });
    } else {
      return NextResponse.json({ error: 'Failed to generate share code' }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to generate share code:', error);
    return NextResponse.json({ error: 'Failed to generate share code' }, { status: 500 });
  }
}