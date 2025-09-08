import {
  mmToPx,
  pxToMm,
  calculateScale,
  snapToGrid,
  snapToGridEnhanced,
  checkBounds,
  checkOverlap,
  findOptimalPosition,
  calculateDistance,
  getBoardCenter,
  centerEffect,
  clampToBoundsWithRotation
} from '../src/lib/coordinates';

describe('座標計算ロジックのテスト', () => {
  describe('基本変換関数', () => {
    describe('mmToPx', () => {
      test('正常な変換', () => {
        expect(mmToPx(100, 2)).toBe(200);
        expect(mmToPx(50, 0.5)).toBe(25);
      });

      test('境界値', () => {
        expect(mmToPx(0, 1)).toBe(0);
        expect(mmToPx(1, 0)).toBe(0);
        expect(mmToPx(-1, 1)).toBe(-1);
      });
    });

    describe('pxToMm', () => {
      test('正常な変換', () => {
        expect(pxToMm(200, 2)).toBe(100);
        expect(pxToMm(25, 0.5)).toBe(50);
      });

      test('境界値', () => {
        expect(pxToMm(0, 1)).toBe(0);
        expect(pxToMm(100, 0)).toBe(Infinity);
        expect(pxToMm(-100, 1)).toBe(-100);
      });
    });

    describe('calculateScale', () => {
      test('正常なスケール計算', () => {
        expect(calculateScale(500, 200, 2)).toBeCloseTo(2); // (500-40)/200 = 2.3 -> 2でクランプ
        expect(calculateScale(300, 200, 2)).toBeCloseTo(1.3); // (300-40)/200 = 1.3
      });

      test('境界値 - 最小スケール', () => {
        expect(calculateScale(50, 1000, 2)).toBe(0.1); // (50-40)/1000 = 0.01 -> 0.1でクランプ
        expect(calculateScale(0, 100, 2)).toBe(0.1); // (0-40)/100 = -0.4 -> 0.1でクランプ
      });

      test('境界値 - 最大スケール', () => {
        expect(calculateScale(1000, 100, 1)).toBe(1); // (1000-40)/100 = 9.6 -> 1でクランプ
        expect(calculateScale(1000, 100, 0.5)).toBe(0.5); // maxScaleでクランプ
      });
    });

    describe('snapToGrid', () => {
      test('正常なスナップ', () => {
        expect(snapToGrid(12, 5)).toBe(10);
        expect(snapToGrid(13, 5)).toBe(15);
        expect(snapToGrid(7.5, 5)).toBe(10);
      });

      test('境界値', () => {
        expect(snapToGrid(0, 5)).toBe(0);
        expect(snapToGrid(2.4, 5)).toBe(0);
        expect(snapToGrid(2.5, 5)).toBe(5);
        expect(snapToGrid(-3, 5)).toBe(-5);
      });

      test('グリッドサイズ0や負の値', () => {
        expect(snapToGrid(10, 0)).toBeNaN(); // 0で割るとNaN
        expect(snapToGrid(10, -5)).toBe(10); // Math.round(10/-5) * -5 = Math.round(-2) * -5 = -2 * -5 = 10
      });
    });
  });

  describe('境界チェック関数', () => {
    const boardWidth = 400;
    const boardHeight = 300;
    const effectWidth = 50;
    const effectHeight = 30;

    describe('checkBounds', () => {
      test('正常な境界内', () => {
        expect(checkBounds(0, 0, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(true);
        expect(checkBounds(350, 270, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(true);
        expect(checkBounds(200, 150, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(true);
      });

      test('境界値 - ぴったり', () => {
        expect(checkBounds(350, 270, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(true); // 400-50=350, 300-30=270
        expect(checkBounds(350, 271, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(false);
        expect(checkBounds(351, 270, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(false);
      });

      test('境界外', () => {
        expect(checkBounds(-1, 0, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(false);
        expect(checkBounds(0, -1, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(false);
        expect(checkBounds(351, 270, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(false);
        expect(checkBounds(350, 271, effectWidth, effectHeight, boardWidth, boardHeight)).toBe(false);
      });

      test('回転時の境界チェック', () => {
        // 90度回転: width=30, height=50になる
        expect(checkBounds(0, 0, effectWidth, effectHeight, boardWidth, boardHeight, 90)).toBe(true);
        expect(checkBounds(370, 250, effectWidth, effectHeight, boardWidth, boardHeight, 90)).toBe(true); // 400-30=370, 300-50=250
        expect(checkBounds(371, 250, effectWidth, effectHeight, boardWidth, boardHeight, 90)).toBe(false);
        expect(checkBounds(370, 251, effectWidth, effectHeight, boardWidth, boardHeight, 90)).toBe(false);
      });

      test('エッジケース - サイズ0', () => {
        expect(checkBounds(400, 300, 0, 0, boardWidth, boardHeight)).toBe(true);
        expect(checkBounds(401, 300, 0, 0, boardWidth, boardHeight)).toBe(false);
      });
    });

    describe('snapToGridEnhanced', () => {
      const effectSize = { width: effectWidth, height: effectHeight };
      const boardSize = { width: boardWidth, height: boardHeight };

      test('正常なスナップ', () => {
        const result = snapToGridEnhanced(12, 13, 5, effectSize, boardSize);
        expect(result.x).toBe(10);
        expect(result.y).toBe(15);
        expect(result.snapped).toBe(true);
      });

      test('境界内スナップ成功', () => {
        const result = snapToGridEnhanced(347, 267, 5, effectSize, boardSize);
        expect(result.x).toBe(345); // snapToGrid(347, 5) = 345, checkBounds(345, 270, ...) = true
        expect(result.y).toBe(265); // snapToGrid(267, 5) = 265, checkBounds(345, 265, ...) = true
        expect(result.snapped).toBe(true);
      });

      test('境界外スナップ失敗時のクランプ', () => {
        const result = snapToGridEnhanced(355, 275, 5, effectSize, boardSize);
        // snapToGrid(355, 5) = 355, snapToGrid(275, 5) = 275
        // checkBounds(355, 275, 50, 30, 400, 300) = false (355+50=405 > 400)
        expect(result.x).toBe(350); // Math.min(355, 400-50) = 350
        expect(result.y).toBe(270); // Math.min(275, 300-30) = 270
        expect(result.snapped).toBe(false);
      });

      test('負の座標のクランプ', () => {
        const result = snapToGridEnhanced(-5, -3, 5, effectSize, boardSize);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
        expect(result.snapped).toBe(false);
      });

      test('回転時のスナップ', () => {
        // 90度回転時: 実際のサイズは30x50
        const result = snapToGridEnhanced(367, 247, 5, effectSize, boardSize, 90);
        // snapToGrid(367, 5) = 365, snapToGrid(247, 5) = 245
        // checkBounds(365, 245, 50, 30, 400, 300, 90) -> 実際は(365, 245, 30, 50)
        // 365+30=395 <= 400, 245+50=295 <= 300 -> true
        expect(result.x).toBe(365);
        expect(result.y).toBe(245);
        expect(result.snapped).toBe(true);
      });
    });

    describe('clampToBoundsWithRotation', () => {
      test('正常な範囲内', () => {
        const result = clampToBoundsWithRotation(100, 100, effectWidth, effectHeight, boardWidth, boardHeight);
        expect(result.x).toBe(100);
        expect(result.y).toBe(100);
      });

      test('境界値クランプ', () => {
        const result = clampToBoundsWithRotation(355, 275, effectWidth, effectHeight, boardWidth, boardHeight);
        expect(result.x).toBe(350); // Math.min(355, 400-50)
        expect(result.y).toBe(270); // Math.min(275, 300-30)
      });

      test('負の値クランプ', () => {
        const result = clampToBoundsWithRotation(-10, -5, effectWidth, effectHeight, boardWidth, boardHeight);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
      });

      test('回転時のクランプ', () => {
        // 90度回転: 実際サイズ30x50
        const result = clampToBoundsWithRotation(375, 260, effectWidth, effectHeight, boardWidth, boardHeight, 90);
        expect(result.x).toBe(370); // Math.min(375, 400-30)
        expect(result.y).toBe(250); // Math.min(260, 300-50)
      });

      test('エッジケース - ボードサイズより大きいエフェクター', () => {
        const result = clampToBoundsWithRotation(100, 100, 500, 400, boardWidth, boardHeight);
        expect(result.x).toBe(0); // Math.min(100, 400-500) = Math.min(100, -100) = 0
        expect(result.y).toBe(0); // Math.min(100, 300-400) = Math.min(100, -100) = 0
      });
    });
  });

  describe('重複チェック関数', () => {
    const existingEffects = [
      { x: 50, y: 50, width_mm: 30, height_mm: 20, rotation: 0 },
      { x: 100, y: 100, width_mm: 40, height_mm: 25, rotation: 90 }, // 実際サイズ: 25x40
      { x: 200, y: 150, width_mm: 35, height_mm: 30, rotation: 0 }
    ];

    describe('checkOverlap', () => {
      test('重複なし', () => {
        expect(checkOverlap(0, 0, 30, 20, existingEffects)).toBe(false);
        expect(checkOverlap(300, 300, 30, 20, existingEffects)).toBe(false);
        expect(checkOverlap(85, 50, 10, 10, existingEffects)).toBe(false);
      });

      test('重複あり', () => {
        expect(checkOverlap(60, 60, 30, 20, existingEffects)).toBe(true); // 最初のエフェクターと重複
        expect(checkOverlap(110, 110, 20, 20, existingEffects)).toBe(true); // 2番目のエフェクターと重複
        expect(checkOverlap(210, 160, 20, 15, existingEffects)).toBe(true); // 3番目のエフェクターと重複
      });

      test('境界値 - ぴったり接触（重複なし）', () => {
        expect(checkOverlap(80, 50, 20, 20, existingEffects)).toBe(false); // x: 50+30=80, 重複なし
        expect(checkOverlap(50, 70, 30, 20, existingEffects)).toBe(false); // y: 50+20=70, 重複なし
      });

      test('境界値 - 1px重複', () => {
        expect(checkOverlap(79, 50, 20, 20, existingEffects)).toBe(true); // x: 79+20=99 > 50+30=80だが、79 < 80なので重複
        expect(checkOverlap(50, 69, 30, 20, existingEffects)).toBe(true); // y: 69+20=89 > 50+20=70だが、69 < 70なので重複
      });

      test('自分自身の除外', () => {
        expect(checkOverlap(50, 50, 30, 20, existingEffects, 0, 0)).toBe(false);
        expect(checkOverlap(100, 100, 40, 25, existingEffects, 90, 1)).toBe(false);
      });

      test('回転を考慮した重複チェック', () => {
        // 90度回転したエフェクター: 25x40の範囲をチェック
        expect(checkOverlap(115, 120, 20, 15, existingEffects, 0)).toBe(true); // 2番目(100,100,25x40)と重複
        expect(checkOverlap(125, 100, 20, 15, existingEffects, 0)).toBe(false); // x: 125 >= 100+25=125, 重複なし
      });
    });

    describe('findOptimalPosition', () => {
      test('最適位置の発見', () => {
        const position = findOptimalPosition(20, 15, 400, 300, existingEffects, 5);
        expect(position).not.toBeNull();
        expect(position!.x).toBeGreaterThanOrEqual(0);
        expect(position!.y).toBeGreaterThanOrEqual(0);
        
        // 境界チェック
        expect(position!.x + 20).toBeLessThanOrEqual(400);
        expect(position!.y + 15).toBeLessThanOrEqual(300);
        
        // 重複チェック
        expect(checkOverlap(position!.x, position!.y, 20, 15, existingEffects)).toBe(false);
      });

      test('配置不可能な場合', () => {
        // ボード全体を大きなエフェクターで埋める
        const largeEffects = [
          { x: 0, y: 0, width_mm: 400, height_mm: 300, rotation: 0 }
        ];
        const position = findOptimalPosition(20, 15, 400, 300, largeEffects, 5);
        expect(position).toBeNull();
      });

      test('グリッド境界での配置', () => {
        const position = findOptimalPosition(5, 5, 20, 15, [], 5);
        expect(position).toEqual({ x: 0, y: 0 });
      });

      test('回転考慮での配置', () => {
        const position = findOptimalPosition(30, 20, 400, 300, existingEffects, 5, 90);
        expect(position).not.toBeNull();
        // 90度回転時は実際サイズが20x30になる
        expect(checkBounds(position!.x, position!.y, 30, 20, 400, 300, 90)).toBe(true);
        expect(checkOverlap(position!.x, position!.y, 30, 20, existingEffects, 90)).toBe(false);
      });
    });
  });

  describe('中央配置関数', () => {
    describe('getBoardCenter', () => {
      test('正常な中央座標', () => {
        expect(getBoardCenter(400, 300)).toEqual({ x: 200, y: 150 });
        expect(getBoardCenter(0, 0)).toEqual({ x: 0, y: 0 });
      });
    });

    describe('centerEffect', () => {
      test('正常な中央配置', () => {
        const result = centerEffect(50, 30, 400, 300);
        expect(result.x).toBe(175); // (400-50)/2
        expect(result.y).toBe(135); // (300-30)/2
      });

      test('回転時の中央配置', () => {
        // 90度回転: 実際サイズ30x50
        const result = centerEffect(50, 30, 400, 300, 90);
        expect(result.x).toBe(185); // (400-30)/2
        expect(result.y).toBe(125); // (300-50)/2
      });

      test('エフェクターがボードより大きい場合', () => {
        const result = centerEffect(500, 400, 400, 300);
        expect(result.x).toBe(-50); // (400-500)/2
        expect(result.y).toBe(-50); // (300-400)/2
      });

      test('境界値 - 同サイズ', () => {
        const result = centerEffect(400, 300, 400, 300);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
      });
    });
  });

  describe('距離計算関数', () => {
    describe('calculateDistance', () => {
      test('正常な距離計算', () => {
        expect(calculateDistance(0, 0, 3, 4)).toBe(5);
        expect(calculateDistance(0, 0, 0, 0)).toBe(0);
        expect(calculateDistance(-1, -1, 2, 3)).toBe(5); // sqrt((2-(-1))^2 + (3-(-1))^2) = sqrt(9+16) = sqrt(25) = 5
      });

      test('負の座標', () => {
        expect(calculateDistance(-3, -4, 0, 0)).toBe(5);
        expect(calculateDistance(-1, 1, 1, -1)).toBeCloseTo(2.83, 2);
      });
    });
  });
});