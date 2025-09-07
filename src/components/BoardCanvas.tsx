'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Board, Effect, EffectPosition } from '../types';

interface BoardCanvasProps {
  board: Board;
  effects: (Effect & { position: EffectPosition })[];
  scale: number;
  showGrid: boolean;
  selectedEffectId: string;
  onEffectSelect: (effectId: string) => void;
  onEffectPositionUpdate: (effectId: string, x: number, y: number) => void;
}

// 定数
const MM_TO_PX_RATIO = 0.8; // 1mm = 0.8px (基準値)
const GRID_SIZE_MM = 10; // グリッドサイズ（mm）

export default function BoardCanvas({
  board,
  effects,
  scale,
  showGrid,
  selectedEffectId,
  onEffectSelect,
  onEffectPositionUpdate,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState<{
    effectId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // mm to px 変換 - メモ化で最適化
  const mmToPx = useCallback((mm: number) => mm * MM_TO_PX_RATIO * scale, [scale]);
  
  // px to mm 変換 - メモ化で最適化
  const pxToMm = useCallback((px: number) => px / (MM_TO_PX_RATIO * scale), [scale]);

  // キャンバスサイズの計算結果をメモ化
  const canvasSize = useMemo(() => ({
    width: mmToPx(board.width_mm),
    height: mmToPx(board.height_mm),
  }), [board.width_mm, board.height_mm, mmToPx]);

  // requestAnimationFrameを使用した最適化された描画関数
  const scheduleDrawCanvas = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // キャンバスサイズ設定 - メモ化された値を使用
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // 背景クリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ペダルボード背景描画
      ctx.fillStyle = '#2D3748'; // グレー系の背景色
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // ペダルボード枠線
      ctx.strokeStyle = '#4A5568';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvasSize.width - 2, canvasSize.height - 2);

    // グリッド描画
    if (showGrid) {
      ctx.strokeStyle = '#4A5568';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);
      
      const gridSizePx = mmToPx(GRID_SIZE_MM);
      
        // 縦線
        for (let x = gridSizePx; x < canvasSize.width; x += gridSizePx) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasSize.height);
          ctx.stroke();
        }
        
        // 横線
        for (let y = gridSizePx; y < canvasSize.height; y += gridSizePx) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasSize.width, y);
          ctx.stroke();
        }
      
      ctx.setLineDash([]); // 破線リセット
    }

      // エフェクター描画 - 最適化されたレンダリング
      effects.forEach((effect) => {
      const x = mmToPx(effect.position.x);
      const y = mmToPx(effect.position.y);
      const width = mmToPx(effect.width_mm);
      const height = mmToPx(effect.height_mm);

      // エフェクター本体
      const isSelected = effect.id === selectedEffectId;
      ctx.fillStyle = isSelected ? '#9F7AEA' : '#E2E8F0'; // 選択時は紫、通常は薄いグレー
      ctx.fillRect(x, y, width, height);

      // エフェクター枠線
      ctx.strokeStyle = isSelected ? '#6B46C1' : '#A0AEC0';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.strokeRect(x, y, width, height);

      // エフェクター名前描画
      ctx.fillStyle = isSelected ? '#FFFFFF' : '#2D3748';
      ctx.font = `${Math.max(10, mmToPx(3))}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // テキストが長い場合は省略
      const maxWidth = width - mmToPx(2);
      let displayName = effect.name;
      const textMetrics = ctx.measureText(displayName);
      
      if (textMetrics.width > maxWidth) {
        // 文字を短縮
        while (ctx.measureText(displayName + '...').width > maxWidth && displayName.length > 1) {
          displayName = displayName.slice(0, -1);
        }
        displayName += '...';
      }
      
        ctx.fillText(displayName, x + width / 2, y + height / 2);
      });

      // ボードサイズ表示
      ctx.fillStyle = '#A0AEC0';
      ctx.font = `${Math.max(10, mmToPx(2.5))}px Arial`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`${board.name} (${board.width_mm} × ${board.height_mm} mm)`, 10, 10);
    });
  }, [board, effects, showGrid, selectedEffectId, mmToPx, canvasSize]);

  // マウスイベント処理
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // エフェクタークリック判定（逆順でチェック - 上にあるものを優先）
    for (let i = effects.length - 1; i >= 0; i--) {
      const effect = effects[i];
      const effectX = mmToPx(effect.position.x);
      const effectY = mmToPx(effect.position.y);
      const effectWidth = mmToPx(effect.width_mm);
      const effectHeight = mmToPx(effect.height_mm);

      if (x >= effectX && x <= effectX + effectWidth && 
          y >= effectY && y <= effectY + effectHeight) {
        
        onEffectSelect(effect.id);
        
        // ドラッグ開始
        setDragging({
          effectId: effect.id,
          offsetX: x - effectX,
          offsetY: y - effectY,
        });
        
        return;
      }
    }

    // エフェクター以外をクリックした場合は選択解除
    onEffectSelect('');
  }, [effects, mmToPx, onEffectSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 新しい位置計算（オフセット考慮）
    const newX = pxToMm(x - dragging.offsetX);
    const newY = pxToMm(y - dragging.offsetY);

    // 境界チェック
    const effect = effects.find(e => e.id === dragging.effectId);
    if (!effect) return;

    const clampedX = Math.max(0, Math.min(newX, board.width_mm - effect.width_mm));
    const clampedY = Math.max(0, Math.min(newY, board.height_mm - effect.height_mm));

    onEffectPositionUpdate(dragging.effectId, clampedX, clampedY);
  }, [dragging, effects, board, pxToMm, onEffectPositionUpdate]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // キャンバス描画更新 - requestAnimationFrame使用
  useEffect(() => {
    scheduleDrawCanvas();
  }, [scheduleDrawCanvas]);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // レスポンシブ対応
  const containerStyle = {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const canvasStyle = {
    border: '2px solid #E2E8F0',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    cursor: dragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}