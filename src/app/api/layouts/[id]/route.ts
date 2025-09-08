import { NextRequest, NextResponse } from 'next/server';
import { updateLayout } from '../../../../lib/layouts';
import { LayoutData } from '../../../../types';

// PUT /api/layouts/[id] - レイアウト更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { userId, name, layoutData, signalChainMemo, generalMemo } = body;
    const resolvedParams = await params;
    const layoutId = resolvedParams.id;

    if (!userId || !layoutId) {
      return NextResponse.json({ error: 'userId and layoutId are required' }, { status: 400 });
    }

    if (!layoutData) {
      return NextResponse.json({ error: 'layoutData is required' }, { status: 400 });
    }

    const updatedLayout = await updateLayout(
      layoutId,
      userId,
      name,
      layoutData as LayoutData,
      signalChainMemo,
      generalMemo
    );

    if (updatedLayout) {
      return NextResponse.json(updatedLayout);
    } else {
      return NextResponse.json({ error: 'Layout not found or update failed' }, { status: 404 });
    }
  } catch (error) {
    console.error('Layout update error:', error);
    return NextResponse.json(
      { error: `Failed to update layout: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}