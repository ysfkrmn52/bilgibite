import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Shield,
  Package,
  UserCheck,
  DollarSign,
  TrendingUp,
  Bell,
  Search,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Genel bakış ve istatistikler'
  },
  {
    label: 'Kullanıcılar',
    href: '/admin/users',
    icon: Users,
    description: 'Kullanıcı yönetimi'
  },
  {
    label: 'Abonelikler',
    href: '/admin/subscriptions', 
    icon: CreditCard,
    description: 'Subscription yönetimi'
  },
  {
    label: 'Paket Yönetimi',
    href: '/admin/plans',
    icon: Package,
    description: 'Subscription paketleri'
  },
  {
    label: 'Ödemeler',
    href: '/admin/payments',
    icon: DollarSign,
    description: 'Ödeme geçmişi'
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    description: 'Detaylı analytics'
  },
  {
    label: 'Verification',
    href: '/admin/verification',
    icon: UserCheck,
    description: 'Öğrenci doğrulamaları'
  },
  {
    label: 'Ayarlar',
    href: '/admin/settings',
    icon: Settings,
    description: 'Sistem ayarları'
  }
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : -320
        }}
        className="fixed left-0 top-0 z-50 h-full w-80 bg-white border-r border-gray-200 lg:translate-x-0 lg:static lg:z-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-sm text-gray-500">BilgiBite</p>
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

          {/* Search */}
          <div className="p-6 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Menüde ara..."
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-xs">
                Admin Yetkisi
              </Badge>
              <Badge variant="secondary" className="text-xs">
                v1.0.0
              </Badge>
            </div>
            
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-600">
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {sidebarItems.find(item => item.href === location)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {sidebarItems.find(item => item.href === location)?.description || 'Admin paneline hoş geldiniz'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}