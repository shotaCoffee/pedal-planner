``# ペダルボードレイアウトアプリ開発ガイド

## プロジェクト概要
ギターエフェクターとペダルボードを登録し、ドラッグ&ドロップでレイアウトを作成できるWebアプリ

## 技術スタック
- Next.js 14 (App Router)
- TypeScript
- Supabase (データベース)
- Tailwind CSS
- @dnd-kit/core (ドラッグ&ドロップ)
- Vercel (ホスティング)

---

## Phase 1: 環境構築・基本セットアップ

### Setup & 初期設定
- [x] Next.jsプロジェクト作成
  ```bash
  npx create-next-app@latest pedalboard-app --typescript --tailwind --eslint --app
  cd pedalboard-app
  ```
- [ ] 必要ライブラリインストール
  ```bash
  npm install @supabase/supabase-js @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  npm install lucide-react
  ```
- [x] Supabaseプロジェクト作成（ローカルPostgreSQLで代替）
- [x] Supabase接続設定（.env.local）（PostgreSQL接続設定で代替）
- [x] 基本的なフォルダ構造作成
  ```
  /src
    /app ✓
      /components
      /lib ✓
      /types
  ```

### データベース設計
- [x] PostgreSQLでテーブル作成（Docker環境）
  - [x] `effects` テーブル
    ```sql
    CREATE TABLE effects (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL,
      name VARCHAR(100) NOT NULL,
      width_mm INTEGER NOT NULL,
      height_mm INTEGER NOT NULL,
      memo TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    ```
  - [x] `boards` テーブル
    ```sql
    CREATE TABLE boards (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL,
      name VARCHAR(100) NOT NULL,
      width_mm INTEGER NOT NULL,
      height_mm INTEGER NOT NULL,
      memo TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    ```
  - [x] `layouts` テーブル
    ```sql
    CREATE TABLE layouts (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL,
      board_id UUID REFERENCES boards(id),
      name VARCHAR(100) NOT NULL,
      layout_data JSONB NOT NULL,
      signal_chain_memo TEXT,
      general_memo TEXT,
      share_code VARCHAR(50) UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    ```

### TypeScript型定義
- [ ] `/src/types/index.ts` 作成
  ```typescript
  export interface Effect {
    id: string;
    user_id: string;
    name: string;
    width_mm: number;
    height_mm: number;
    memo?: string;
    created_at: string;
  }
  
  export interface Board {
    id: string;
    user_id: string;
    name: string;
    width_mm: number;
    height_mm: number;
    memo?: string;
    created_at: string;
  }
  
  export interface Layout {
    id: string;
    user_id: string;
    board_id: string;
    name: string;
    layout_data: LayoutData;
    signal_chain_memo?: string;
    general_memo?: string;
    share_code?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface LayoutData {
    effects: EffectPosition[];
  }
  
  export interface EffectPosition {
    effect_id: string;
    x: number;
    y: number;
    rotation?: number;
  }
  ```

---

## Phase 2: 基本CRUD機能実装

### ユーザー管理（匿名）
- [ ] 匿名ユーザーID生成機能
- [ ] LocalStorageでユーザーID保存
- [ ] `/src/lib/auth.ts` 作成

### エフェクター管理
- [ ] エフェクター一覧画面 `/effects`
  - [ ] エフェクター一覧表示
  - [ ] 新規追加ボタン
  - [ ] 編集・削除機能
- [ ] エフェクター追加・編集モーダル
  - [ ] 名前入力
  - [ ] サイズ入力（縦横mm）
  - [ ] メモ入力（設定値など）
  - [ ] バリデーション
- [ ] `/src/components/EffectList.tsx`
- [ ] `/src/components/EffectModal.tsx`
- [ ] Supabase CRUD操作関数

### ペダルボード管理
- [ ] ボード一覧画面 `/boards`
  - [ ] ボード一覧表示
  - [ ] 新規追加ボタン
  - [ ] 編集・削除機能
- [ ] ボード追加・編集モーダル
  - [ ] 名前入力
  - [ ] サイズ入力（縦横mm）
  - [ ] メモ入力（パワーサプライ情報など）
  - [ ] バリデーション
- [ ] `/src/components/BoardList.tsx`
- [ ] `/src/components/BoardModal.tsx`
- [ ] Supabase CRUD操作関数

---

## Phase 3: レイアウト機能実装

### レイアウト基本機能
- [ ] レイアウト一覧画面 `/layouts`
- [ ] レイアウト作成画面 `/layouts/new`
- [ ] レイアウト編集画面 `/layouts/[id]`
- [ ] ボード選択機能
- [ ] エフェクター選択パネル

### ドラッグ&ドロップ機能
- [ ] `/src/components/LayoutEditor.tsx` 作成
- [ ] @dnd-kit セットアップ
- [ ] ボードエリア（mm単位グリッド）
- [ ] エフェクターのドラッグ可能コンポーネント
- [ ] 配置座標のリアルタイム計算・表示
- [ ] 重複配置チェック機能
- [ ] エフェクター回転機能（0°/90°/180°/270°）

### レイアウト座標管理
- [ ] mm ↔ px 変換関数
- [ ] グリッドスナップ機能（1mm, 5mm, 10mm単位）
- [ ] ズーム機能（拡大・縮小）
- [ ] ボード境界チェック（エフェクターがはみ出さない）

---

## Phase 4: メモ機能実装

### 配線順メモ機能
- [ ] `/src/components/SignalChainEditor.tsx`
- [ ] エフェクター順序指定機能
  - [ ] レイアウト上でクリック順に番号付与
  - [ ] 手動でドラッグして順序変更
  - [ ] 自動配線順提案（座標ベース）
- [ ] 配線順テキスト自動生成
  ```
  例: "ギター → Boss DS-1 → Ibanez TS9 → Boss DD-7 → アンプ"
  ```
- [ ] 配線メモの手動編集機能

### その他メモ機能
- [ ] レイアウト全体メモ
- [ ] エフェクター個別メモ（設定値記録）
- [ ] ボードメモ（電源・配線ルール）
- [ ] Markdown対応（**太字**、*斜体*など）

---

## Phase 5: データ共有機能

### コード生成・復元
- [ ] `/src/lib/shareCode.ts` 作成
- [ ] レイアウトデータのJSON化
- [ ] LZString圧縮 + Base64エンコード
- [ ] 短縮コード生成（8-12文字）
- [ ] コード入力UI
- [ ] データ復元・インポート機能
- [ ] 復元時の重複チェック

### 共有UI
- [ ] 「コード生成」ボタン
- [ ] QRコード生成機能
- [ ] 「コード入力」モーダル
- [ ] SNS共有ボタン（Twitter、LINE）

---

## Phase 6: UI/UX改善

### レスポンシブ対応
- [ ] モバイル向けレイアウト調整
- [ ] タッチ操作最適化
- [ ] スマホでのドラッグ&ドロップ改善
- [ ] 横画面対応

### ユーザビリティ
- [ ] ローディング状態表示
- [ ] エラーハンドリング
- [ ] 操作ヘルプ・チュートリアル
- [ ] ショートカットキー
- [ ] 操作履歴（Undo/Redo）

### デザイン調整
- [ ] 一貫したデザインシステム
- [ ] ダークモード対応
- [ ] アニメーション追加
- [ ] アクセシビリティ対応

---

## Phase 7: デプロイ・運用

### Vercelデプロイ
- [ ] GitHubリポジトリ作成
- [ ] Vercelプロジェクト作成
- [ ] 環境変数設定
- [ ] 自動デプロイ設定

### 運用準備
- [ ] エラー監視設定
- [ ] パフォーマンス最適化
- [ ] SEO対策
- [ ] Google Analytics設定（オプション）

---

## 技術的な考慮事項

### パフォーマンス
- [ ] 大量エフェクター表示の最適化
- [ ] レイアウト描画の最適化
- [ ] 画像遅延読み込み（Phase 2で実装時）

### セキュリティ
- [ ] XSS対策
- [ ] 入力値サニタイズ
- [ ] CORS設定

### 拡張性
- [ ] コンポーネント設計の統一
- [ ] 状態管理の整理（Context API or Zustand）
- [ ] 国際化対応準備（i18n）

---

## 開発環境設定

### ローカル開発（Docker PostgreSQL）
```bash
# データベース起動
npm run db:up

# 開発サーバー起動
npm run dev

# データベース停止
npm run db:down

# データベースリセット
npm run db:reset
```

### Docker Compose 構成
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: pedalboard_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
```

### 環境変数
```env
# ローカル開発 (.env.local)
DATABASE_URL=postgresql://postgres:password@localhost:5432/pedalboard_dev
NODE_ENV=development

# 本番環境 (.env.production)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NODE_ENV=production
```

---

## 開発メモ

### Supabase無料枠制限
- データベース容量: 500MB（約14,500ユーザー対応可能）
- 帯域幅: 月10GB（約300-400ユーザー/月の同時利用上限）
- ファイルアップロード: 50MB/ファイル（画像機能実装時）

### スケール戦略
- Phase 1: 完全無料（月300ユーザーまで）
- Phase 2: Supabase Pro $25/月（月1,000-5,000ユーザー）
- Phase 3: Supabase Pro + Vercel Pro $45/月（月10,000ユーザー+）

---

## 次のステップ
1. Phase 1の環境構築から開始
2. 基本的なCRUD機能で動作確認
3. ドラッグ&ドロップ機能の実装
4. メモ機能追加
5. 共有機能実装
6. UI/UX改善とデプロイ