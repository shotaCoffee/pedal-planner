// 座標変換とレイアウト計算のユーティリティ関数

// mm → px 変換
export function mmToPx(mm: number, scale: number): number {
  return mm * scale;
}

// px → mm 変換
export function pxToMm(px: number, scale: number): number {
  return px / scale;
}

// スケール計算（コンテナ幅に基づいてボードサイズを決定）
export function calculateScale(containerWidth: number, boardWidthMm: number, maxScale: number = 2): number {
  // 余白を考慮（20px）
  const availableWidth = containerWidth - 40;
  const scale = availableWidth / boardWidthMm;
  
  // 最小0.1倍、最大指定倍数でクランプ
  return Math.max(0.1, Math.min(scale, maxScale));
}

// グリッドスナップ（指定されたグリッドサイズに吸着）
export function snapToGrid(coord: number, gridSizeMm: number): number {
  return Math.round(coord / gridSizeMm) * gridSizeMm;
}

// 高度なスナップ機能（境界チェック付き）
export function snapToGridEnhanced(
  x: number, 
  y: number, 
  gridSize: number = 5,
  effectSize: { width: number; height: number },
  boardSize: { width: number; height: number },
  rotation: number = 0
): { x: number; y: number; snapped: boolean } {
  const snappedX = snapToGrid(x, gridSize);
  const snappedY = snapToGrid(y, gridSize);
  
  // 境界チェック
  const isValid = checkBounds(
    snappedX, 
    snappedY, 
    effectSize.width, 
    effectSize.height, 
    boardSize.width, 
    boardSize.height, 
    rotation
  );
  
  if (isValid) {
    return { x: snappedX, y: snappedY, snapped: true };
  } else {
    // スナップできない場合は元の座標を返す
    return { x, y, snapped: false };
  }
}

// 境界チェック（エフェクターがボード内に収まるかチェック）
export function checkBounds(
  x: number, 
  y: number, 
  effectWidthMm: number, 
  effectHeightMm: number, 
  boardWidthMm: number, 
  boardHeightMm: number,
  rotation: number = 0
): boolean {
  // 回転を考慮したエフェクターの実際のサイズ
  const isRotated = rotation === 90 || rotation === 270;
  const actualWidth = isRotated ? effectHeightMm : effectWidthMm;
  const actualHeight = isRotated ? effectWidthMm : effectHeightMm;
  
  // 境界チェック
  return x >= 0 && 
         y >= 0 && 
         (x + actualWidth) <= boardWidthMm && 
         (y + actualHeight) <= boardHeightMm;
}

// 重複チェック（他のエフェクターと重複していないかチェック）
export function checkOverlap(
  x: number,
  y: number,
  effectWidthMm: number,
  effectHeightMm: number,
  existingEffects: Array<{
    x: number;
    y: number;
    width_mm: number;
    height_mm: number;
    rotation?: number;
  }>,
  rotation: number = 0,
  excludeIndex?: number
): boolean {
  // 回転を考慮したエフェクターの実際のサイズ
  const isRotated = rotation === 90 || rotation === 270;
  const actualWidth = isRotated ? effectHeightMm : effectWidthMm;
  const actualHeight = isRotated ? effectWidthMm : effectHeightMm;
  
  for (let i = 0; i < existingEffects.length; i++) {
    if (excludeIndex !== undefined && i === excludeIndex) {
      continue; // 自分自身は除外
    }
    
    const other = existingEffects[i];
    const otherIsRotated = (other.rotation === 90 || other.rotation === 270);
    const otherActualWidth = otherIsRotated ? other.height_mm : other.width_mm;
    const otherActualHeight = otherIsRotated ? other.width_mm : other.height_mm;
    
    // 矩形の重複判定
    if (!(x + actualWidth <= other.x || 
          other.x + otherActualWidth <= x || 
          y + actualHeight <= other.y || 
          other.y + otherActualHeight <= y)) {
      return true; // 重複あり
    }
  }
  
  return false; // 重複なし
}

// 最適な配置位置を探す（空いているスペースを探す）
export function findOptimalPosition(
  effectWidthMm: number,
  effectHeightMm: number,
  boardWidthMm: number,
  boardHeightMm: number,
  existingEffects: Array<{
    x: number;
    y: number;
    width_mm: number;
    height_mm: number;
    rotation?: number;
  }>,
  gridSizeMm: number = 5,
  rotation: number = 0
): { x: number; y: number } | null {
  // 左上から右下へ順番に空きスペースを探す
  for (let y = 0; y <= boardHeightMm; y += gridSizeMm) {
    for (let x = 0; x <= boardWidthMm; x += gridSizeMm) {
      if (checkBounds(x, y, effectWidthMm, effectHeightMm, boardWidthMm, boardHeightMm, rotation) &&
          !checkOverlap(x, y, effectWidthMm, effectHeightMm, existingEffects, rotation)) {
        return { x, y };
      }
    }
  }
  
  return null; // 空きスペースなし
}

// 距離計算（2点間の距離）
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// ボード中央位置計算
export function getBoardCenter(boardWidthMm: number, boardHeightMm: number): { x: number; y: number } {
  return {
    x: boardWidthMm / 2,
    y: boardHeightMm / 2
  };
}

// エフェクターを中央配置するための座標計算
export function centerEffect(
  effectWidthMm: number,
  effectHeightMm: number,
  boardWidthMm: number,
  boardHeightMm: number,
  rotation: number = 0
): { x: number; y: number } {
  const isRotated = rotation === 90 || rotation === 270;
  const actualWidth = isRotated ? effectHeightMm : effectWidthMm;
  const actualHeight = isRotated ? effectWidthMm : effectHeightMm;
  
  return {
    x: (boardWidthMm - actualWidth) / 2,
    y: (boardHeightMm - actualHeight) / 2
  };
}