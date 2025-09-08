-- Row Level Security (RLS) ポリシー設定
-- 本番デプロイ時にSupabaseで実行する

-- RLS を有効化
ALTER TABLE effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE layouts ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザー用ポリシー: effects テーブル
CREATE POLICY "匿名ユーザーは自分のエフェクターのみアクセス可能" ON effects
  FOR ALL 
  USING (
    user_id::text = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'user_id',
      current_setting('app.user_id', true)
    )
  )
  WITH CHECK (
    user_id::text = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'user_id',
      current_setting('app.user_id', true)
    )
  );

-- 匿名ユーザー用ポリシー: boards テーブル
CREATE POLICY "匿名ユーザーは自分のボードのみアクセス可能" ON boards
  FOR ALL 
  USING (
    user_id::text = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'user_id',
      current_setting('app.user_id', true)
    )
  )
  WITH CHECK (
    user_id::text = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'user_id',
      current_setting('app.user_id', true)
    )
  );

-- 匿名ユーザー用ポリシー: layouts テーブル
CREATE POLICY "匿名ユーザーは自分のレイアウトのみアクセス可能" ON layouts
  FOR ALL 
  USING (
    user_id::text = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'user_id',
      current_setting('app.user_id', true)
    )
  )
  WITH CHECK (
    user_id::text = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'user_id',
      current_setting('app.user_id', true)
    )
  );

-- 共有レイアウト用ポリシー: share_code が存在するレイアウトは読み取り専用で公開
CREATE POLICY "共有コード付きレイアウトは読み取り可能" ON layouts
  FOR SELECT
  USING (share_code IS NOT NULL AND share_code != '');

-- インデックスの最適化
CREATE INDEX IF NOT EXISTS idx_effects_user_id ON effects(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);  
CREATE INDEX IF NOT EXISTS idx_layouts_user_id ON layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_layouts_share_code ON layouts(share_code) WHERE share_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_layouts_board_id ON layouts(board_id);