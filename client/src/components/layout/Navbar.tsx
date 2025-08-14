import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
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
  Trophy, 
  Brain, 
  Users, 
  BarChart3, 
  CreditCard,
  ChevronLeft,
  LogOut,
  Bell
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [location] = useLocation();
  
  const navigationItems = [
    { path: "/", label: "Anasayfa", icon: Home },
    { path: "/turkish-exams", label: "Türk Sınavları", icon: BookOpen },
    { path: "/ai-learning", label: "AI Öğrenme", icon: Brain },
    { path: "/gamification", label: "Rozetler", icon: Trophy },
    { path: "/social", label: "Sosyal", icon: Users },
    { path: "/analytics", label: "İstatistikler", icon: BarChart3 },
    { path: "/pricing", label: "Fiyatlar", icon: CreditCard }
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
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
            >
              3
            </Badge>
          </Button>

          {/* Tema Değiştirici */}
          <ModeToggle />

          {/* Kullanıcı Menüsü */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user.png" alt="Profil" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    KB
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">Kullanıcı Adı</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    kullanici@bilgibite.com
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
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