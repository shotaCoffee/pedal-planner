'use client';

import { useDroppable } from '@dnd-kit/core';
import { Board, Effect, EffectPosition } from '../types';
import BoardCanvas from './BoardCanvas';

interface DroppableBoardProps {
  board: Board;
  effects: (Effect & { position: EffectPosition })[];
  scale: number;
  showGrid: boolean;
  selectedEffectId: string;
  onEffectSelect: (effectId: string) => void;
  onEffectPositionUpdate: (effectId: string, x: number, y: number) => void;
  onEffectDrop?: (effectId: string, x: number, y: number) => void;
}

export default function DroppableBoard({
  board,
  effects,
  scale,
  showGrid,
  selectedEffectId,
  onEffectSelect,
  onEffectPositionUpdate,
  ...props
}: DroppableBoardProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'board-canvas',
    data: {
      type: 'board',
      board,
    },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`relative w-full h-full ${
        isOver ? 'bg-purple-50' : 'bg-white'
      } transition-colors`}
      style={{
        minHeight: `${Math.max(400, board.height_mm * 0.8 * scale + 100)}px`,
      }}
    >
      <BoardCanvas
        board={board}
        effects={effects}
        scale={scale}
        showGrid={showGrid}
        selectedEffectId={selectedEffectId}
        onEffectSelect={onEffectSelect}
        onEffectPositionUpdate={onEffectPositionUpdate}
        {...props}
      />
      
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium">
            ここにエフェクターをドロップ
          </div>
        </div>
      )}
    </div>
  );
}