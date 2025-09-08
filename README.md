# ペダルボードレイアウトアプリ

ギターエフェクターとペダルボードを管理し、ドラッグ&ドロップでレイアウトを作成できるWebアプリケーションです。

## 🎸 機能

- **エフェクター管理**: エフェクターの登録・編集・削除（名前、サイズ、メモ）
- **ペダルボード管理**: ペダルボードの登録・編集・削除（名前、サイズ、メモ）
- **レイアウト作成**: ドラッグ&ドロップでエフェクターをペダルボード上に配置
- **座標管理**: mm単位での精密な配置、グリッドスナップ機能
- **匿名利用**: ユーザー登録不要、LocalStorageでデータ管理

## 🛠 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS 4
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL (開発: Docker, 本番: Supabase)
- **UI**: React 19, @dnd-kit (ドラッグ&ドロップ)
- **ホスティング**: Vercel

## 🚀 開発環境セットアップ

### 前提条件
- Node.js 18+
- Docker & Docker Compose
- Git

### インストール

```bash
# リポジトリクローン
git clone <repository-url>
cd pedalboard-app

# 依存関係インストール
npm install

# データベース起動
npm run db:up

# 開発サーバー起動
npm run dev
```

開発サーバーは http://localhost:3000 で起動します。

### 便利なコマンド

```bash
# データベース + 開発サーバー同時起動
npm run dev:full

# データベース関連
npm run db:up      # データベース起動
npm run db:down    # データベース停止
npm run db:reset   # データベースリセット
npm run db:logs    # ログ確認

# コード品質チェック
npm run lint       # ESLint実行
npm run type:check # TypeScript型チェック
npm run build      # ビルドテスト

# 本番デプロイ準備
npm run deploy:check  # デプロイ前チェック
```

### データベース直接接続

```bash
# PostgreSQLに直接接続
docker exec -it pedalboard-postgres psql -U postgres -d pedalboard_dev

# テーブル確認
\dt

# 終了
\q
```

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── effects/           # エフェクター管理ページ
│   ├── boards/            # ボード管理ページ
│   ├── layouts/           # レイアウト作成・編集ページ
│   └── page.tsx          # ホームページ
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ・DB接続
└── types/                 # TypeScript型定義

db/
├── init/                  # 開発環境DB初期化
└── production/            # 本番環境設定

docs/                      # ドキュメント
scripts/                   # ビルド・デプロイスクリプト
```

## 🗄️ データベース構造

### effects (エフェクター)
- `id`, `user_id`, `name`, `width_mm`, `height_mm`, `memo`

### boards (ペダルボード)
- `id`, `user_id`, `name`, `width_mm`, `height_mm`, `memo`

### layouts (レイアウト)
- `id`, `user_id`, `board_id`, `name`, `layout_data` (JSONB)
- `signal_chain_memo`, `general_memo`, `share_code`

## 🌐 本番デプロイ

詳細な手順は [本番デプロイメント計画書](docs/PRODUCTION_DEPLOYMENT_GUIDE.md) を参照してください。

### クイックスタート

1. **デプロイ前チェック**
```bash
npm run deploy:check
```

2. **Supabaseプロジェクト作成**
   - https://supabase.com でプロジェクト作成
   - `db/init/01_create_tables.sql` でテーブル作成
   - `db/production/01_rls_policies.sql` でセキュリティ設定

3. **Vercelデプロイ**
   - GitHubにプッシュ
   - Vercelでインポート
   - 環境変数設定 (`.env.example` 参照)

## 🤝 開発・貢献

### 開発フロー

1. 機能ブランチ作成
2. 開発・テスト
3. `npm run deploy:check` でチェック
4. Pull Request作成

### 開発進捗

- ✅ **Phase 1**: 環境構築・基本セットアップ
- ✅ **Phase 2**: 基本CRUD機能（エフェクター・ペダルボード管理）
- ✅ **Phase 3**: レイアウト機能実装
- 🚀 **現在**: 本番デプロイ準備

## 📄 ライセンス

MIT License

## 📞 サポート

質問やバグ報告は [Issues](https://github.com/username/pedalboard-app/issues) でお知らせください。