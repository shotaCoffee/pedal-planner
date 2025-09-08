#!/bin/bash

# 本番デプロイ前のチェックスクリプト

echo "🔍 本番デプロイ前チェックを開始します..."

# 色付きログ用の関数
print_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

print_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

print_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

# エラーカウンター
error_count=0

echo ""
echo "📦 依存関係チェック..."

# package.json の必要な依存関係チェック
if grep -q "@supabase/supabase-js" package.json; then
    print_success "Supabase クライアント依存関係が存在します"
else
    print_error "Supabase クライアント (@supabase/supabase-js) がインストールされていません"
    echo "   実行: npm install @supabase/supabase-js"
    ((error_count++))
fi

echo ""
echo "🔧 TypeScript チェック..."

# TypeScript エラーチェック
if npx tsc --noEmit --skipLibCheck; then
    print_success "TypeScript エラーなし"
else
    print_error "TypeScript エラーが存在します"
    ((error_count++))
fi

echo ""
echo "🧹 ESLint チェック..."

# ESLint チェック
if npm run lint; then
    print_success "ESLint エラーなし"
else
    print_error "ESLint エラーが存在します"
    ((error_count++))
fi

echo ""
echo "🏗️  ビルドテスト..."

# ビルドテスト
if npm run build; then
    print_success "ビルド成功"
else
    print_error "ビルドが失敗しました"
    ((error_count++))
fi

echo ""
echo "📁 必要ファイル存在チェック..."

# 必要なファイルの存在チェック
files_to_check=(
    ".env.example"
    "src/lib/supabase.ts"
    "src/types/supabase.ts" 
    "vercel.json"
    "db/production/01_rls_policies.sql"
    "docs/PRODUCTION_DEPLOYMENT_GUIDE.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file が存在します"
    else
        print_error "$file が存在しません"
        ((error_count++))
    fi
done

echo ""
echo "🔍 環境変数テンプレートチェック..."

# .env.example の内容チェック
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.example; then
    print_success ".env.example に Supabase URL テンプレートが存在"
else
    print_error ".env.example に NEXT_PUBLIC_SUPABASE_URL が存在しません"
    ((error_count++))
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.example; then
    print_success ".env.example に Supabase Anon Key テンプレートが存在"
else
    print_error ".env.example に NEXT_PUBLIC_SUPABASE_ANON_KEY が存在しません"
    ((error_count++))
fi

echo ""
echo "🔒 セキュリティチェック..."

# .env.local が git に含まれていないかチェック
if [ -f ".env.local" ]; then
    if git check-ignore .env.local > /dev/null 2>&1; then
        print_success ".env.local は Git に無視されています"
    else
        print_warning ".env.local が Git に追跡される可能性があります"
        print_info ".gitignore に .env.local を追加することを推奨します"
    fi
fi

# 危険なconsole.log をチェック
console_logs=$(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | wc -l)
if [ "$console_logs" -gt 0 ]; then
    print_warning "console.log が $console_logs 個見つかりました"
    print_info "本番デプロイ前に不要なconsole.logの削除を検討してください"
else
    print_success "console.log は見つかりませんでした"
fi

echo ""
echo "📊 結果サマリー"
echo "=================="

if [ $error_count -eq 0 ]; then
    print_success "すべてのチェックが完了しました! デプロイの準備ができています 🚀"
    echo ""
    print_info "次のステップ:"
    echo "   1. Supabase プロジェクトを作成"
    echo "   2. GitHub リポジトリにプッシュ"
    echo "   3. Vercel でデプロイ"
    echo "   4. 環境変数を設定"
    echo ""
    print_info "詳細な手順は docs/PRODUCTION_DEPLOYMENT_GUIDE.md を参照してください"
else
    print_error "$error_count 個のエラーが見つかりました"
    echo ""
    print_info "エラーを修正してから再度このスクリプトを実行してください:"
    echo "   bash scripts/deploy-check.sh"
fi

echo ""
exit $error_count