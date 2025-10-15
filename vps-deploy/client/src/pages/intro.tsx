import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  Users, 
  Sparkles,
  ChevronRight,
  Check,
  Brain,
  Target,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

export default function IntroPage() {
  const features = [
    {
      icon: GraduationCap,
      title: "Türkiye'nin En Kapsamlı Sınav Platformu",
      description: "YKS, KPSS, Ehliyet, SRC ve daha fazlası için binlerce soru",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Brain,
      title: "Yapay Zeka Destekli Öğrenme",
      description: "Kişiselleştirilmiş öğrenme yolu ve akıllı soru önerileri",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Target,
      title: "Gerçek Sınav Deneyimi",
      description: "Zamanlayıcı, puan sistemi ve gerçek sınav formatı",
      color: "from-pink-500 to-red-600"
    },
    {
      icon: Trophy,
      title: "Oyunlaştırılmış Öğrenme",
      description: "Puanlar, rozetler ve liderlik tablosu ile motive olun",
      color: "from-orange-500 to-yellow-600"
    },
    {
      icon: Users,
      title: "Sosyal Öğrenme",
      description: "Arkadaşlarınla yarış ve birlikte öğren",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Award,
      title: "Detaylı Performans Analizi",
      description: "Güçlü ve zayıf yönlerini keşfet, hedeflerine ulaş",
      color: "from-teal-500 to-cyan-600"
    }
  ];

  const benefits = [
    "7/24 erişilebilir öğrenme platformu",
    "Güncel sınav soruları ve müfredatlar",
    "Mobil uyumlu tasarım",
    "Kapsamlı performans raporları",
    "Sınırsız pratik yapma imkanı"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">BB</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BilgiBite
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="ghost" data-testid="button-login">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/auth?signup=true">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" data-testid="button-signup">
                Hemen Başla
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Türkiye'nin #1 Sınav Hazırlık Platformu</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Hedeflerine Ulaşmanın En Eğlenceli Yolu
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Yapay zeka destekli öğrenme, oyunlaştırılmış quiz'ler ve gerçek sınav deneyimi ile başarıya giden yolda yanındayız.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href="/auth?signup=true">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8" data-testid="button-start-learning">
                <BookOpen className="w-5 h-5 mr-2" />
                Öğrenmeye Başla
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 border-2 hover:bg-purple-50" data-testid="button-login-hero">
                Giriş Yap
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <Card className="p-4 text-center border-2 border-blue-100 bg-white/80 backdrop-blur-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">10K+</div>
              <div className="text-sm text-gray-600 mt-1">Aktif Kullanıcı</div>
            </Card>
            <Card className="p-4 text-center border-2 border-purple-100 bg-white/80 backdrop-blur-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">50K+</div>
              <div className="text-sm text-gray-600 mt-1">Soru Bankası</div>
            </Card>
            <Card className="p-4 text-center border-2 border-pink-100 bg-white/80 backdrop-blur-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">100K+</div>
              <div className="text-sm text-gray-600 mt-1">Çözülen Quiz</div>
            </Card>
            <Card className="p-4 text-center border-2 border-green-100 bg-white/80 backdrop-blur-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">98%</div>
              <div className="text-sm text-gray-600 mt-1">Memnuniyet</div>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Neden BilgiBite?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sınav hazırlığını oyun gibi eğlenceli hale getiren özelliklerle donatılmış modern öğrenme platformu
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-xl transition-shadow border-2 border-gray-100">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Platformumuzun Avantajları</h3>
              <p className="text-gray-600">
                BilgiBite ile öğrenmenin keyfini çıkarın
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-blue-100"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold mb-4">Başarı Yolculuğuna Hemen Başla!</h3>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Ücretsiz hesap oluştur ve hemen quiz çözmeye başla
            </p>
            <Link href="/auth?signup=true">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8" data-testid="button-signup-cta">
                <Sparkles className="w-5 h-5 mr-2" />
                Ücretsiz Kayıt Ol
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">BB</span>
            </div>
            <span className="text-xl font-bold text-white">BilgiBite</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2024 BilgiBite. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
