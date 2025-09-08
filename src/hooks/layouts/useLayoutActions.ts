'use client';

import { Layout } from '../../types';
import { getUserId } from '../../lib/auth';
import { useToast } from '../../components/Toast';

export interface UseLayoutActionsParams {
  layouts: Layout[];
  setLayouts: (layouts: Layout[]) => void;
}

export interface UseLayoutActionsReturn {
  deleteLayout: (layout: Layout) => Promise<boolean>;
  generateShareCode: (layout: Layout) => Promise<boolean>;
}

export function useLayoutActions({ layouts, setLayouts }: UseLayoutActionsParams): UseLayoutActionsReturn {
  const { addToast } = useToast();

  const deleteLayout = async (layout: Layout): Promise<boolean> => {
    if (!confirm(`「${layout.name}」を削除しますか？`)) {
      return false;
    }

    try {
      const userId = getUserId();
      const res = await fetch(`/api/layouts?id=${layout.id}&userId=${userId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setLayouts(layouts.filter(l => l.id !== layout.id));
        return true;
      } else {
        addToast('削除に失敗しました', 'error');
        return false;
      }
    } catch {
      addToast('削除に失敗しました', 'error');
      return false;
    }
  };

  const generateShareCode = async (layout: Layout): Promise<boolean> => {
    try {
      const userId = getUserId();
      const res = await fetch('/api/layouts/share-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: layout.id,
          userId: userId,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const shareCode = data.shareCode;
        
        // レイアウトリストを更新
        setLayouts(layouts.map(l => 
          l.id === layout.id ? { ...l, share_code: shareCode } : l
        ));
        
        // 共有URLをクリップボードにコピー
        const shareUrl = `${window.location.origin}/layouts/shared/${shareCode}`;
        await navigator.clipboard.writeText(shareUrl);
        addToast('共有URLをクリップボードにコピーしました', 'success');
        return true;
      } else {
        addToast('共有コードの生成に失敗しました', 'error');
        return false;
      }
    } catch {
      addToast('共有コード生成に失敗しました', 'error');
      return false;
    }
  };

  return {
    deleteLayout,
    generateShareCode
  };
}