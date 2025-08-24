import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  {
    href: '/xadmin',
    label: 'Dashboard',
    description: 'Ana kontrol paneli',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/users',
    label: 'Kullanıcılar',
    description: 'Kullanıcı yönetimi',
    icon: Users,
  },
  {
    href: '/admin/questions',
    label: 'Sorular',
    description: 'Soru bankası',
    icon: BookOpen,
  },
  {
    href: '/admin/analytics', 
    label: 'Analitik',
    description: 'İstatistik ve raporlar',
    icon: BarChart3,
  },
  {
    href: '/admin/settings',
    label: 'Ayarlar', 
    description: 'Sistem ayarları',
    icon: Settings,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  const currentPage = sidebarItems.find(item => item.href === location);
  const pageTitle = currentPage?.label || 'Dashboard';
  const pageDescription = currentPage?.description || 'Admin paneline hoş geldiniz';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : -320,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 z-50 lg:relative lg:translate-x-0 lg:z-0"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">BilgiBite</h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg mb-2 transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-xs">Admin Yetkisi</Badge>
              <Badge variant="secondary" className="text-xs">v1.0.0</Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Page Title - SOL ÜST KÖŞEDE */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {pageTitle}
              </h1>
              <p className="text-sm text-gray-500">
                {pageDescription}
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}