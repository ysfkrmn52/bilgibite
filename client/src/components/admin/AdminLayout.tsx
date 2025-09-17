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
  Bell,
  Brain,
  CreditCard,
  Target,
  FileQuestion,
  Sparkles
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  {
    href: '/xadmin',
    label: 'Dashboard',
    description: 'Ana kontrol paneli ve AI soru üretimi',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/users',
    label: 'Kullanıcılar',
    description: 'Kullanıcı yönetimi ve test paketi atama',
    icon: Users,
  },
  {
    href: '/admin/questions',
    label: 'Sorular',
    description: 'Soru görüntüleme ve yönetimi',
    icon: FileQuestion,
  },
  {
    href: '/admin/subscriptions',
    label: 'Abonelikler',
    description: 'Subscription istatistikleri ve yönetim',
    icon: CreditCard,
  },
  {
    href: '/admin/analytics',
    label: 'Analitik',
    description: 'Platform performans raporları',
    icon: BarChart3,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  const currentPage = sidebarItems.find(item => item.href === location);
  const pageTitle = currentPage?.label || 'Dashboard';
  const pageDescription = currentPage?.description || 'Admin paneline hoş geldiniz';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile Sidebar Overlay - SADECE MOBİL İÇİN */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />
            {/* Mobile Sidebar - SADECE MOBİL İÇİN GÖSTER */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-purple-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg">BilgiBite</h2>
                      <p className="text-xs text-blue-100">Admin Panel</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-3 py-4">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200
                            ${isActive 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                              : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                            }
                          `}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                              {item.label}
                            </div>
                            <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                              {item.description}
                            </div>
                          </div>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile Sidebar Footer */}
                <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Admin Yetkisi
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      v2.0.0
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* FULL WIDTH MAIN CONTENT - SOL BOŞLUK YOK */}
      <div className="w-full min-h-screen">
        {/* Top Header - FULL WIDTH */}
        <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - SADECE MOBİL */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Desktop Navigation - DESKTOP İÇİN */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">BilgiBite</h2>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>

              {/* Desktop Menu Items */}
              <nav className="flex items-center gap-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`flex items-center gap-2 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Page Title - MOBİL İÇİN */}
            <div className="lg:hidden">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {pageTitle}
              </h1>
              <p className="text-sm text-gray-600">
                {pageDescription}
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Page Content - FULL WIDTH, NO SIDEBAR */}
        <main className="w-full p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}