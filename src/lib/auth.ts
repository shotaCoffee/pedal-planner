'use client';

const USER_ID_KEY = 'pedalboard_user_id';

// UUIDv4生成関数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 匿名ユーザーIDを取得（なければ生成して保存）
export function getUserId(): string {
  if (typeof window === 'undefined') {
    // サーバーサイドでは一時的なIDを返す
    return 'temp-server-id';
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

// ユーザーIDを再生成（データリセット時などに使用）
export function regenerateUserId(): string {
  if (typeof window === 'undefined') {
    return 'temp-server-id';
  }

  const newUserId = generateUUID();
  localStorage.setItem(USER_ID_KEY, newUserId);
  return newUserId;
}

// ユーザーIDをクリア
export function clearUserId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(USER_ID_KEY);
}