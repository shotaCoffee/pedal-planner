import { Board } from '../../types';

export interface UseBoardLookupReturn {
  getBoardName: (boardId: string) => string;
  getBoardById: (boardId: string) => Board | undefined;
}

export function useBoardLookup(boards: Board[]): UseBoardLookupReturn {
  const getBoardName = (boardId: string): string => {
    const board = boards.find(b => b.id === boardId);
    return board?.name || 'Unknown Board';
  };

  const getBoardById = (boardId: string): Board | undefined => {
    return boards.find(b => b.id === boardId);
  };

  return {
    getBoardName,
    getBoardById
  };
}