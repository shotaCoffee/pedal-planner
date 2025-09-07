# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
ユーザーへの返答は日本語で行なってください

## Development Commands

### Application Commands
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code linting

### Database Commands
- `npm run db:up` - Start PostgreSQL database with Docker Compose
- `npm run db:down` - Stop Docker PostgreSQL containers
- `npm run db:reset` - Reset database (removes volumes and restarts)
- `npm run db:logs` - View PostgreSQL container logs
- `npm run dev:full` - Start both database and development server concurrently

### Direct Database Access
Connect to PostgreSQL directly via Docker:
```bash
docker exec -it pedalboard-postgres psql -U postgres -d pedalboard_dev
```

## Project Architecture

This is a pedalboard layout application for guitar effects pedals, built with:

- **Next.js 15** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **React 19** for UI components

### Current Technology Stack
- **PostgreSQL 15** with Docker for local development
- **pg** library for direct database connections
- **concurrently** for running multiple processes

### Planned Technology Stack
According to the development plan (`pedalboard_development_plan.md`), this project will also include:
- **@dnd-kit/core** for drag-and-drop functionality  
- **Supabase** for production database hosting
- **Vercel** for deployment

### File Structure

- `src/app/` - Next.js app router pages and layout
- `src/app/layout.tsx` - Root layout with Geist fonts
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global CSS styles

### Database Schema

The application uses three main PostgreSQL tables (initialized in `db/init/01_create_tables.sql`):

- **`effects`** - User's guitar effect pedals with dimensions and metadata
  - `id` (UUID), `user_id` (UUID), `name` (VARCHAR), `width_mm`/`height_mm` (INTEGER), `memo` (TEXT)
- **`boards`** - Pedalboards with physical dimensions  
  - `id` (UUID), `user_id` (UUID), `name` (VARCHAR), `width_mm`/`height_mm` (INTEGER), `memo` (TEXT)
- **`layouts`** - Complete pedalboard layouts with positioning data
  - `id` (UUID), `user_id` (UUID), `board_id` (FK), `name` (VARCHAR), `layout_data` (JSONB)
  - `signal_chain_memo` (TEXT), `general_memo` (TEXT), `share_code` (VARCHAR)

All tables include performance indexes on user_id and foreign keys.

### Key Features (Planned)

1. **Effect Management** - CRUD operations for guitar effect pedals
2. **Board Management** - Managing pedalboard dimensions and specifications
3. **Layout Editor** - Drag-and-drop interface for positioning effects on boards
4. **Signal Chain Management** - Track and document effect order/routing
5. **Sharing System** - Generate shareable codes for layouts
6. **Responsive Design** - Mobile and desktop support

### TypeScript Configuration

- Path alias `@/*` maps to `./src/*`
- Strict TypeScript configuration enabled
- Next.js plugin configured for optimal development experience

## Development Workflow

1. **Start database**: `npm run db:up` (first time setup)
2. **Start development**: `npm run dev` or `npm run dev:full` (includes database)
3. **Database access**: Use the direct PostgreSQL connection for debugging
4. **Reset if needed**: `npm run db:reset` to clear all data

## Environment Configuration

- **Local development**: Uses Docker PostgreSQL on port 5432
- **Database**: `pedalboard_dev` with user `postgres`, password `password`
- **Connection**: Direct via `pg` library (not Supabase in local development)

## Development Notes

- Uses Turbopack for faster builds and development
- Anonymous user system planned (no authentication required)
- All dimensions stored in millimeters for precision
- Database schema automatically initialized on first Docker startup
- Japanese documentation available in `pedalboard_development_plan.md`

## 次回開発継続の手順

### 開発環境再開
```bash
# 1. データベース起動
npm run db:up

# 2. 開発サーバー起動 
npm run dev
# または同時起動
npm run dev:full
```

### Phase 3 実装継続
**次に実装すべき内容**: Phase 3 Step 1（基盤機能）

1. **レイアウトCRUD操作関数** - `/src/lib/layouts.ts`
   - getLayouts(), createLayout(), updateLayout(), deleteLayout()
2. **座標変換ユーティリティ** - `/src/lib/coordinates.ts`
   - mm ↔ px 変換、グリッドスナップ、境界チェック
3. **レイアウト一覧ページ** - `/layouts`
   - 一覧表示、新規作成ボタン、編集・削除機能

**参照**: 詳細な設計・計画は `docs/0907.md` の Phase 3設計・計画セクション参照

### 現在の完了状況
- ✅ **Phase 1**: 環境構築・基本セットアップ (100%)
- ✅ **Phase 2**: 基本CRUD機能（エフェクター・ペダルボード管理） (100%)  
- 🎯 **Phase 3**: レイアウト機能実装 (設計完了、実装準備済み)