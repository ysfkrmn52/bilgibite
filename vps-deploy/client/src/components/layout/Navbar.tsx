import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  User, 
  Settings, 
  BookOpen, 
  GraduationCap,
  Trophy, 
  Brain, 
  Users, 
  BarChart3, 
  CreditCard,
  ChevronLeft,
  LogOut,
  Bell,
  CheckCheck,
  Trash2,
  Crown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { currentUser: firebaseUser } = useAuth();
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Yeni rozet kazandınız!",
      description: '"Kararlı Öğrenci" rozetini aldınız',
      type: 'achievement',
      isRead: false,
      color: 'bg-blue-50',
      borderColor: 'border-blue-100',
      dotColor: 'bg-blue-500'
    },
    {
      id: 2,
      title: "Quiz tamamlandı",
      description: "YKS Matematik - %85 başarı",
      type: 'quiz',
      isRead: false,
      color: 'bg-green-50',
      borderColor: 'border-green-100',
      dotColor: 'bg-green-500'
    },
    {
      id: 3,
      title: "Arkadaş isteği",
      description: "Ahmet Yılmaz seni arkadaş olarak ekledi",
      type: 'friend',
      isRead: false,
      color: 'bg-orange-50',
      borderColor: 'border-orange-100',
      dotColor: 'bg-orange-500'
    }
  ]);
  
  // Get user display info from Firebase Auth
  const getUserDisplayName = () => {
    if (!firebaseUser) return 'Kullanıcı';
    return firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanıcı';
  };

  const getUserInitials = () => {
    if (!firebaseUser) return 'KB';
    const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'KB';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };
  
  const navigationItems = [
    { path: "/", label: "Ana Sayfa", icon: Home },
    { path: "/exams", label: "Sınavlar", icon: GraduationCap },
    { path: "/ai-education", label: "AI Eğitim", icon: Brain },
    { path: "/badges", label: "Rozetler", icon: Trophy },
    { path: "/social", label: "Sosyal", icon: Users },
    { path: "/analytics", label: "İstatistikler", icon: BarChart3 },
    { path: "/subscription", label: "Abonelik", icon: CreditCard }
  ];

  const isActivePath = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const canGoBack = location !== "/" && location !== "/dashboard";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* Sol Taraf - Logo ve Navigasyon */}
        <div className="flex items-center space-x-6">
          {/* Geri Butonu */}
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Geri
            </Button>
          )}
          
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
                  BB
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BilgiBite
              </span>
            </div>
          </Link>

          {/* Desktop Navigasyon */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActivePath(item.path) ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center gap-2 transition-all ${
                      isActivePath(item.path) 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                        : "hover:bg-accent/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sağ Taraf - Kullanıcı İşlemleri */}
        <div className="flex items-center space-x-4">
          
          {/* Bildirimler */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
                  >
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-white/95 backdrop-blur-sm border shadow-lg" align="end">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">Bildirimler</h3>
                  <div className="flex items-center gap-2">
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                          toast({ title: "Başarılı", description: "Tüm bildirimler okundu olarak işaretlendi" });
                        }}
                        className="text-xs h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        data-testid="button-mark-all-read"
                      >
                        <CheckCheck className="w-3 h-3 mr-1" />
                        Tümünü Okundu
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNotifications([]);
                        toast({ title: "Başarılı", description: "Tüm bildirimler temizlendi" });
                      }}
                      className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid="button-clear-notifications"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Temizle
                    </Button>
                  </div>
                </div>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Henüz bildiriminiz yok</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`flex items-start gap-3 p-2 rounded-lg ${notification.color} border ${notification.borderColor} transition-opacity ${
                          notification.isRead ? 'opacity-60' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 ${notification.dotColor} rounded-full mt-2 ${notification.isRead ? 'opacity-50' : ''}`}></div>
                        <div className="flex-1">
                          <p className={`text-sm ${notification.isRead ? 'font-normal text-gray-600' : 'font-medium'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600">{notification.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Kullanıcı Menüsü */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={firebaseUser?.photoURL || "/avatars/user.png"} alt="Profil" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 bg-white/95 backdrop-blur-sm border shadow-xl rounded-xl" align="end" forceMount>
              {/* Profil Header */}
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-16 rounded-t-xl"></div>
                <div className="absolute -bottom-6 left-6">
                  <Avatar className="h-12 w-12 border-4 border-white shadow-lg">
                    <AvatarImage src={firebaseUser?.photoURL || "/avatars/user.png"} alt="Profil" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              {/* Kullanıcı Bilgileri */}
              <div className="pt-8 pb-4 px-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {getUserDisplayName()}
                  </h3>
                  {firebaseUser?.email === 'ysfkrmn.5239@gmail.com' && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {firebaseUser?.email || 'kullanici@bilgibite.com'}
                </p>
                
                {/* İstatistik Kartları */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">12</div>
                      <div className="text-xs text-gray-600">Tamamlanan Quiz</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">1250</div>
                      <div className="text-xs text-gray-600">Toplam Puan</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Menu Öğeleri */}
              <div className="px-2 pb-2">
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer rounded-lg mb-1 py-2 px-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border hover:border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Profilim</div>
                        <div className="text-xs text-gray-600">Profil ayarlarını düzenle</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer rounded-lg mb-1 py-2 px-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border hover:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Ayarlar</div>
                        <div className="text-xs text-gray-600">Uygulama tercihleri</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem 
                  className="cursor-pointer rounded-lg py-2 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border hover:border-red-100"
                  onClick={() => {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('isAuthenticated');
                    window.location.href = '/auth';
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-red-600">Çıkış Yap</div>
                      <div className="text-xs text-red-500">Oturumu sonlandır</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobil Navigasyon */}
      <div className="lg:hidden border-t border-border/40 bg-background/95">
        <div className="container px-4 py-2">
          <div className="flex items-center justify-between">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex flex-col items-center gap-1 h-auto p-2 ${
                      isActivePath(item.path) ? "text-blue-600" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}