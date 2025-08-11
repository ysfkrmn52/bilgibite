import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Menu, X, GraduationCap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user?: {
    username: string;
    level: number;
    streakDays: number;
    initials: string;
  };
}

export default function Header({ user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GraduationCap className="text-white text-lg" />
            </motion.div>
            <h1 className="text-2xl font-bold text-text-dark">BilgiBite</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-text-dark hover:text-primary transition-colors font-medium" data-testid="nav-home">
              Ana Sayfa
            </Link>
            <a href="#exams" className="text-text-dark hover:text-primary transition-colors font-medium" data-testid="nav-exams">
              Sınavlar
            </a>
            <a href="#stats" className="text-text-dark hover:text-primary transition-colors font-medium" data-testid="nav-stats">
              İstatistikler
            </a>
            <a href="#profile" className="text-text-dark hover:text-primary transition-colors font-medium" data-testid="nav-profile">
              Profil
            </a>
          </nav>

          {/* User Profile & Stats */}
          <div className="flex items-center space-x-4">
            {/* Streak Counter */}
            {user && (
              <motion.div 
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-accent/10 to-accent/20 rounded-full px-3 py-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                data-testid="streak-counter"
              >
                <Flame className="text-accent streak-fire w-4 h-4" />
                <span className="text-accent font-bold text-sm">{user.streakDays}</span>
                <span className="text-accent/80 text-xs">gün</span>
              </motion.div>
            )}
            
            {/* User Avatar */}
            {user && (
              <motion.div 
                className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.1 }}
                data-testid="user-avatar"
              >
                <span className="text-white font-bold text-sm">{user.initials}</span>
              </motion.div>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="text-xl" />
              ) : (
                <Menu className="text-xl" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 py-4 border-t border-gray-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            data-testid="mobile-menu"
          >
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-text-dark hover:text-primary transition-colors font-medium py-2" 
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-home"
              >
                Ana Sayfa
              </Link>
              <a 
                href="#exams" 
                className="text-text-dark hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-exams"
              >
                Sınavlar
              </a>
              <a 
                href="#stats" 
                className="text-text-dark hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-stats"
              >
                İstatistikler
              </a>
              <a 
                href="#profile" 
                className="text-text-dark hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-nav-profile"
              >
                Profil
              </a>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}
