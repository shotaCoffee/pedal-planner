import Link from "next/link";
import { Guitar, Settings, PanelsTopLeft } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ペダルボードレイアウトアプリ</h1>
          <p className="text-lg text-gray-600 mb-12">
            ギターエフェクターとペダルボードを管理して、理想のレイアウトを作成しよう
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link 
              href="/effects"
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-8 text-center group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Guitar className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">エフェクター管理</h2>
              <p className="text-gray-600">
                所有しているエフェクターを登録・管理する
              </p>
            </Link>
            <Link
              href="/boards"
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-8 text-center group"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">ペダルボード管理</h2>
              <p className="text-gray-600">
                ペダルボードを登録・管理する
              </p>
            </Link>
            <Link
              href="/layouts"
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-8 text-center group"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <PanelsTopLeft className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">レイアウト管理</h2>
              <p className="text-gray-600">
                ペダルボード上にエフェクターを配置・管理する
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
