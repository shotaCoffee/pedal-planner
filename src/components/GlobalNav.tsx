'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Guitar, Settings, PanelsTopLeft, Home } from 'lucide-react';

export default function GlobalNav() {
  const pathname = usePathname();
  
  const navItems = [
    {
      href: '/',
      label: 'ホーム',
      icon: Home,
      description: 'メイン画面'
    },
    {
      href: '/effects',
      label: 'エフェクター',
      icon: Guitar,
      description: 'エフェクター管理'
    },
    {
      href: '/boards',
      label: 'ペダルボード',
      icon: Settings,
      description: 'ペダルボード管理'
    },
    {
      href: '/layouts',
      label: 'レイアウト',
      icon: PanelsTopLeft,
      description: 'レイアウト管理'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Guitar className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Pedalboard App
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  title={item.description}
                >
                  <Icon size={18} />
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}