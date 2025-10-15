// Virtual Currency and Gem Store System
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Heart, 
  Shield, 
  Zap, 
  Eye,
  Clock,
  Shuffle,
  RefreshCw,
  ShoppingCart,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GemEconomy } from '@/lib/gamification';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  cost: number;
  category: 'powerups' | 'cosmetics' | 'boosters';
  rarity: 'common' | 'rare' | 'epic';
  effect?: string;
  duration?: string;
}

interface GemStoreProps {
  userGems: number;
  userItems: string[];
  onPurchase: (item: StoreItem) => void;
  onUseItem?: (itemId: string) => void;
}

const STORE_ITEMS: StoreItem[] = [
  // Power-ups
  {
    id: 'extra_lives',
    name: 'Ekstra Can',
    description: 'Quiz sırasında 2 ekstra can kazanırsın',
    icon: Heart,
    cost: 5,
    category: 'powerups',
    rarity: 'common',
    effect: '+2 Can'
  },
  {
    id: 'streak_freeze',
    name: 'Seri Dondurucu',
    description: 'Serinin bir gün korunmasını sağlar',
    icon: Shield,
    cost: 10,
    category: 'powerups',
    rarity: 'common',
    effect: '1 Gün Koruma'
  },
  {
    id: 'hint_power',
    name: 'İpucu Gücü',
    description: 'Zor sorularda ipucu alabilirsin',
    icon: Eye,
    cost: 3,
    category: 'powerups',
    rarity: 'common',
    effect: '1 İpucu'
  },
  {
    id: 'time_freeze',
    name: 'Zaman Dondurma',
    description: 'Quiz sırasında zamanı 30 saniye durdur',
    icon: Clock,
    cost: 8,
    category: 'powerups',
    rarity: 'rare',
    effect: '+30 Saniye',
    duration: '1 Kullanım'
  },
  {
    id: 'skip_question',
    name: 'Soru Atla',
    description: 'Zor soruları cezasız atlayabilirsin',
    icon: Shuffle,
    cost: 12,
    category: 'powerups',
    rarity: 'rare',
    effect: '1 Soru Atlama'
  },

  // Boosters
  {
    id: 'double_xp',
    name: 'Çift XP',
    description: '1 saat boyunca çift XP kazanırsın',
    icon: Zap,
    cost: 25,
    category: 'boosters',
    rarity: 'epic',
    effect: '2x XP',
    duration: '1 Saat'
  },
  {
    id: 'gem_multiplier',
    name: 'Gem Çarpanı',
    description: '2 saat boyunca %50 daha fazla gem kazanırsın',
    icon: Star,
    cost: 35,
    category: 'boosters',
    rarity: 'epic',
    effect: '+50% Gem',
    duration: '2 Saat'
  },
  {
    id: 'streak_guardian',
    name: 'Seri Koruyucusu',
    description: '7 gün boyunca serin otomatik korunur',
    icon: Shield,
    cost: 75,
    category: 'boosters',
    rarity: 'epic',
    effect: '7 Gün Koruma',
    duration: '1 Hafta'
  }
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'border-gray-300 bg-gray-50 dark:bg-gray-900';
    case 'rare': return 'border-blue-300 bg-blue-50 dark:bg-blue-950';
    case 'epic': return 'border-purple-300 bg-purple-50 dark:bg-purple-950';
    default: return 'border-gray-300 bg-gray-50';
  }
};

const getRarityBadge = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-800';
    case 'rare': return 'bg-blue-100 text-blue-800';
    case 'epic': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function GemStore({ userGems, userItems, onPurchase, onUseItem }: GemStoreProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('powerups');
  const [purchaseConfirm, setPurchaseConfirm] = useState<string | null>(null);
  const [recentPurchase, setRecentPurchase] = useState<StoreItem | null>(null);

  const handlePurchase = (item: StoreItem) => {
    if (!GemEconomy.canAfford(userGems, item.cost)) {
      return;
    }

    onPurchase(item);
    setRecentPurchase(item);
    setPurchaseConfirm(null);
    
    // Hide success animation after 3 seconds
    setTimeout(() => setRecentPurchase(null), 3000);
  };

  const filteredItems = STORE_ITEMS.filter(item => item.category === selectedCategory);
  const hasItem = (itemId: string) => userItems.includes(itemId);

  return (
    <div className="space-y-6">
      {/* Gem Balance */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              <Star className="w-8 h-8 text-yellow-500" />
            </motion.div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {userGems.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Gem Bakiyesi
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="powerups" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Güçlendirici
          </TabsTrigger>
          <TabsTrigger value="boosters" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Artırıcı
          </TabsTrigger>
          <TabsTrigger value="cosmetics" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Kozmetik
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="wait">
              {filteredItems.map((item) => {
                const IconComponent = item.icon;
                const canAfford = GemEconomy.canAfford(userGems, item.cost);
                const owned = hasItem(item.id);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`transition-all duration-300 hover:shadow-lg ${
                      getRarityColor(item.rarity)
                    } ${!canAfford && !owned ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        {/* Item Header */}
                        <div className="flex items-center justify-between mb-3">
                          <motion.div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              owned ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-800'
                            } shadow-md`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <IconComponent className={`w-6 h-6 ${
                              owned ? 'text-green-600' : 'text-gray-600'
                            }`} />
                          </motion.div>
                          
                          <Badge className={getRarityBadge(item.rarity)}>
                            {item.rarity === 'common' && 'Sıradan'}
                            {item.rarity === 'rare' && 'Nadir'}
                            {item.rarity === 'epic' && 'Destansı'}
                          </Badge>
                        </div>

                        {/* Item Details */}
                        <div className="space-y-2 mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                          
                          {/* Effect Badge */}
                          {item.effect && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.effect}
                              </Badge>
                              {item.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {item.duration}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Purchase/Use Button */}
                        <div className="space-y-2">
                          {owned ? (
                            <div className="space-y-2">
                              <Button
                                onClick={() => onUseItem?.(item.id)}
                                className="w-full bg-green-500 hover:bg-green-600"
                                size="sm"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Kullan
                              </Button>
                              <p className="text-xs text-center text-green-600 dark:text-green-400">
                                Sahip olduğun
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Button
                                onClick={() => setPurchaseConfirm(item.id)}
                                disabled={!canAfford}
                                className="w-full"
                                variant={canAfford ? 'default' : 'secondary'}
                                size="sm"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                <Star className="w-4 h-4 mr-1" />
                                {item.cost}
                              </Button>
                              
                              {!canAfford && (
                                <p className="text-xs text-center text-red-500">
                                  Yetersiz gem
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </Tabs>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {purchaseConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-2xl max-w-sm mx-4"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              {(() => {
                const item = STORE_ITEMS.find(i => i.id === purchaseConfirm);
                if (!item) return null;
                const IconComponent = item.icon;
                
                return (
                  <>
                    <IconComponent className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-2xl font-bold">{item.cost}</span>
                      <span className="text-gray-500">gem</span>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handlePurchase(item)}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Satın Al
                      </Button>
                      <Button
                        onClick={() => setPurchaseConfirm(null)}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        İptal
                      </Button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Success Animation */}
      <AnimatePresence>
        {recentPurchase && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
          >
            <Card className="bg-green-500 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 1 }}
                  >
                    <Check className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <div className="font-semibold">Satın Alındı!</div>
                    <div className="text-sm opacity-90">{recentPurchase.name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Store Tips */}
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Mağaza İpuçları
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Günlük görevleri tamamlayarak ücretsiz gem kazan</li>
            <li>• Güçlendiricileri zor quizlerde stratejik olarak kullan</li>
            <li>• Artırıcılar uzun vadeli gelişim için idealdir</li>
            <li>• Seri dondurucu tatil planlarında işe yarar</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}