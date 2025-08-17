import { storage } from './storage';

// 42 AYT Din Kültürü ve Ahlak Bilgisi sorusunu direkt veritabanına yükle
export async function importAYTQuestions() {
  const aytQuestions = [
    {
      text: "İslam'da din ve hayat arasındaki bütünlük, insanın yaşamının her alanında dini değerleri rehber almasını ifade eder. Bu anlayışa göre, dini inanç sadece ibadetlerle sınırlı olmayıp günlük yaşamın her anında kendini gösterir. Aşağıdakilerden hangisi İslam'ın bu bütüncül yaklaşımını en iyi açıklar?",
      options: [
        "Din sadece ibadethanelerde yaşanır",
        "İnanç özel alan, günlük yaşam kamusal alandır",
        "Dini değerler yaşamın her alanında rehberdir",
        "Din ve dünya işleri birbirinden ayrı tutulmalıdır",
        "İbadet etmek günlük işlerden daha önemlidir"
      ],
      correctAnswer: 2,
      explanation: "İslam'da din ve hayat bütünlüğü, dini değerlerin yaşamın her alanında rehber olması anlamına gelir.",
      year: 2023
    },
    {
      text: "Hz. Muhammed'in 'Hiçbiriniz, kendisi için istediğini kardeşi için de istemedikçe gerçek anlamda iman etmiş olmaz' hadis-i şerifi, İslam'daki kardeşlik anlayışını açıklar. Bu hadise göre müslümanlar arasındaki ilişkinin temel özelliği aşağıdakilerden hangisidir?",
      options: [
        "Maddi çıkar gözetmek",
        "Empati ve fedakârlık",
        "Sadece dini konularda yardımlaşmak",
        "Rekabet etmek",
        "Birbirini eleştirmek"
      ],
      correctAnswer: 1,
      explanation: "Hadis, müslümanlar arası ilişkilerde empati ve fedakârlığın önemini vurgular.",
      year: 2022
    },
    {
      text: "İslam'da ahlaki davranışların temel kaynağı Kur'an ve Hz. Muhammed'in sünnetidir. Bu kaynaklarda adalet, merhamet, doğruluk gibi değerler ön plana çıkar. İslam ahlakının en temel özelliği aşağıdakilerden hangisidir?",
      options: [
        "Sadece müslümanlara karşı iyi olmak",
        "Toplumsal statüye göre davranmak",
        "Evrensel değerleri benimser",
        "Çıkar ilişkilerine dayalı olmak",
        "Duruma göre değişken olmak"
      ],
      correctAnswer: 2,
      explanation: "İslam ahlakı, adalet, merhamet, doğruluk gibi evrensel değerleri benimser.",
      year: 2021
    },
    {
      text: "İslam düşüncesinde farklı mezhep ve yorumların ortaya çıkması, dinin zenginliğini gösterir. Bu çeşitlilik, İslam'ın farklı coğrafya ve kültürlerde yaşanması sonucu gelişmiştir. İslam'daki bu çeşitlilik için aşağıdaki yaklaşımlardan hangisi en doğrudur?",
      options: [
        "Farklı yorumlar dinin bölünmesine yol açar",
        "Tek doğru yorum vardır, diğerleri yanlıştır",
        "Çeşitlilik İslam'ın dinamizmini gösterir",
        "Mezhep farklılıkları çatışmaya neden olur",
        "Yorumlar dinin özünü bozar"
      ],
      correctAnswer: 2,
      explanation: "İslam'daki mezhep ve yorum çeşitliliği, dinin dinamizmini ve zenginliğini gösterir.",
      year: 2020
    },
    {
      text: "İslam'da ölüm sonrası yaşam (ahiret) inancı, dünya hayatını anlamlı kılan temel unsurlardan biridir. Bu inanç, insanın sorumluluklarını fark etmesini ve davranışlarını bu bilinçle düzenlemesini sağlar. Ahiret inancının insan yaşamına etkisi aşağıdakilerden hangisidir?",
      options: [
        "Dünya hayatını önemsizleştirmek",
        "Sorumluluk bilincini artırmak",
        "Kaygı ve korkuya neden olmak",
        "İnsanları pasif yapmak",
        "Sadece ibadetlere odaklanmak"
      ],
      correctAnswer: 1,
      explanation: "Ahiret inancı, insanın dünya hayatındaki sorumluluklarını fark etmesini sağlar.",
      year: 2019
    },
    {
      text: "Kur'an'da Hz. Muhammed, insanlık için güzel örnek (üsve-i hasene) olarak tanımlanır. Bu örnek kişilik, sadece dini alanda değil, günlük yaşamın her alanında rehberlik sağlar. Hz. Muhammed'in örnekliği aşağıdaki hangi alanda daha az görülür?",
      options: [
        "Aile yaşamı",
        "Ticaret ve ekonomi",
        "Siyasi liderlik",
        "Modern teknoloji kullanımı",
        "Sosyal adalet"
      ],
      correctAnswer: 3,
      explanation: "Hz. Muhammed'in yaşadığı dönemde modern teknoloji bulunmadığı için bu alanda doğrudan örnek yoktur.",
      year: 2024
    },
    {
      text: "İslam'da ibadetlerin sosyal boyutu oldukça önemlidir. Namaz, oruç, hac gibi ibadetlerin toplumsal işlevleri de vardır. Bu ibadetlerin sosyal etkisi aşağıdakilerden hangisidir?",
      options: [
        "Sadece bireysel gelişimi sağlar",
        "Toplumsal dayanışmayı güçlendirir",
        "İnsanları toplumdan uzaklaştırır",
        "Maddi kazanç sağlar",
        "Statü farkı yaratır"
      ],
      correctAnswer: 1,
      explanation: "İslam'daki ibadetler toplumsal dayanışmayı güçlendiren sosyal işlevlere sahiptir.",
      year: 2023
    },
    {
      text: "İslam düşüncesinde ilim önemli bir yere sahiptir. 'İlim öğrenmek her müslümanın farzıdır' hadis-i şerifi bu konuyu vurgular. İslam'da ilme verilen önem hangi açıdan değerlendirilmelidir?",
      options: [
        "Sadece dini konularda bilgi sahibi olmak",
        "Yaşamı anlamak ve geliştirmek için",
        "Başkalarından üstün olmak için",
        "Maddi kazanç elde etmek için",
        "Sadece okuma yazma öğrenmek"
      ],
      correctAnswer: 1,
      explanation: "İslam'da ilim, yaşamı anlamak, geliştirmek ve Allah'ın yarattıklarını tanımak için önemlidir.",
      year: 2022
    },
    {
      text: "İslam'da adalet kavramı, hem bireysel hem de toplumsal düzeyde temel değerlerden biridir. Kur'an'da 'Adil olun, bu takvaya daha yakındır' buyurulur. İslami adalette hangi unsur ön plana çıkar?",
      options: [
        "Sadece müslümanlar arasında adalet",
        "Güçlünün lehine karar vermek",
        "Herkese eşit davranmak",
        "Çıkar ilişkilerine göre davranmak",
        "Sadece maddi konularda adalet"
      ],
      correctAnswer: 2,
      explanation: "İslami adalet anlayışında din, dil, ırk ayrımı yapmadan herkese eşit davranmak esastır.",
      year: 2021
    },
    {
      text: "İslam'da zekât, sadece maddi yardım değil, toplumsal adaletin sağlanması için önemli bir araçtır. Zekâtın toplumsal işlevi aşağıdakilerden hangisidir?",
      options: [
        "Zenginlerin daha zengin olması",
        "Gelir dağılımını düzeltmek",
        "Fakirleri bağımlı hale getirmek",
        "Toplumsal statü yaratmak",
        "Sadece dini görevi yerine getirmek"
      ],
      correctAnswer: 1,
      explanation: "Zekât, toplumda gelir dağılımını düzelten ve sosyal adaleti sağlayan bir araçtır.",
      year: 2020
    },
    {
      text: "Yahudilik ve Hristiyanlık, İslam'da 'Kitap Ehli' (Ehl-i Kitap) olarak adlandırılır. Bu dinlere karşı İslam'ın yaklaşımı aşağıdakilerden hangisidir?",
      options: [
        "Tamamen reddedici",
        "Saygılı ama mesafeli",
        "Ortak değerleri kabul edici",
        "Üstünlük iddia edici",
        "Tamamen özdeşleştirici"
      ],
      correctAnswer: 2,
      explanation: "İslam, Kitap Ehli dinleriyle ortak değerleri kabul eder ve saygı gösterir.",
      year: 2019
    },
    {
      text: "İslam ve bilim ilişkisinde tarihsel süreçte önemli gelişmeler yaşanmıştır. İslam medeniyeti bilime nasıl katkıda bulunmuştur?",
      options: [
        "Bilimi tamamen reddetmiştir",
        "Sadece dini ilimleri geliştirmiştir",
        "Matematik, tıp, astronomi alanlarında öncülük etmiştir",
        "Bilimi dinden ayrı tutmuştur",
        "Sadece felsefiye odaklanmıştır"
      ],
      correctAnswer: 2,
      explanation: "İslam medeniyeti matematik, tıp, astronomi gibi alanlarda önemli katkılarda bulunmuştur.",
      year: 2018
    },
    {
      text: "Anadolu'da İslam'ın yayılması ve yerleşmesinde sufiler önemli rol oynadılar. Bu süreçte hangi özellik ön plana çıkmıştır?",
      options: [
        "Zorla din değiştirme",
        "Ticaret yoluyla yayılma",
        "Hoşgörü ve sevgi dili",
        "Siyasi baskı",
        "Maddi çıkar sağlama"
      ],
      correctAnswer: 2,
      explanation: "Anadolu'da İslam'ın yayılmasında sufilerin hoşgörülü ve sevgi dolu yaklaşımı etkili olmuştur.",
      year: 2024
    },
    {
      text: "İslam düşüncesinde tasavvuf, iç arınma ve manevi gelişimi hedefler. Tasavvufun temel amacı aşağıdakilerden hangisidir?",
      options: [
        "Dünyadan tamamen uzaklaşmak",
        "Allah'a yakınlaşmak ve iç arınmayı sağlamak",
        "Mistik deneyimler yaşamak",
        "Toplumdan soyutlanmak",
        "Sadece ritüel yaparak"
      ],
      correctAnswer: 1,
      explanation: "Tasavvufun temel amacı Allah'a yakınlaşmak ve iç arınmayı sağlamaktır.",
      year: 2023
    },
    {
      text: "Güncel dini meseleler, modern yaşamın getirdiği yeni durumlar karşısında dini hükümlerin belirlenmesini gerektirir. Bu konuda nasıl bir yaklaşım benimsenmelidir?",
      options: [
        "Geleneksel hükümleri aynen uygulamak",
        "Dini tamamen güncellemek",
        "Temel ilkeleri koruyarak modern şartlara uyarlamak",
        "Her konuda yeni hüküm koymak",
        "Dini müracaatları göz ardı etmek"
      ],
      correctAnswer: 2,
      explanation: "Güncel dini meselerde İslam'ın temel ilkeleri korunarak modern şartlara uyarlama yapılmalıdır.",
      year: 2022
    },
    {
      text: "Hint dinleri (Hinduizm, Budizm) ve Çin dinleri (Konfüçyüsçülük, Taoizm) dünya dinleri arasında yer alır. Bu dinlerin ortak özelliği aşağıdakilerden hangisidir?",
      options: [
        "Tek tanrı inancı",
        "İnsan yaşamını düzenleme amacı",
        "Aynı coğrafyada doğma",
        "Benzer ibadet şekilleri",
        "Aynı kutsal kitapları"
      ],
      correctAnswer: 1,
      explanation: "Bu dinlerin ortak özelliği insan yaşamını düzenleme ve anlamlandırma amacı taşımalarıdır.",
      year: 2021
    },
    {
      text: "İslam'da namaz, sadece Allah'a ibadet etmenin bir yolu değil, aynı zamanda kişisel disiplinin ve manevi arınmanın bir aracıdır. Namazın kişi üzerindeki etkisi aşağıdakilerden hangisidir?",
      options: [
        "Sadece fiziksel egzersiz sağlar",
        "Manevi disiplin ve dikkat geliştirir",
        "Sosyal statü kazandırır",
        "Maddi kazanç sağlar",
        "Sadece geleneksel bir alışkanlıktır"
      ],
      correctAnswer: 1,
      explanation: "Namaz, manevi disiplin geliştiren ve dikkati artıran bir ibadettir.",
      year: 2020
    },
    {
      text: "İslam'da sabır ve şükür, mümin kişinin temel vasıflarındandır. Bu iki kavram hayatta karşılaşılan zorluklara nasıl yaklaşılması gerektiğini gösterir. Sabır ve şükrün temel işlevi nedir?",
      options: [
        "Pasif olmayı öğretir",
        "Ruhsal dengeyi sağlar",
        "Maddi kazancı artırır",
        "Sosyal ilişkileri koparır",
        "Dünyevi hedefleri unutturur"
      ],
      correctAnswer: 1,
      explanation: "Sabır ve şükür, hayatın zorluklarında ruhsal dengeyi koruyan temel değerlerdir.",
      year: 2019
    },
    {
      text: "Kur'an'da 'İnsanların en hayırlısı insanlara faydalı olandır' prensibine uygun olarak müslümanların topluma katkıları nasıl olmalıdır?",
      options: [
        "Sadece müslümanlara yardım etmek",
        "Sadece dini konularda faydalı olmak",
        "Tüm insanlığa faydalı olmak",
        "Sadece aile çevresine yardım etmek",
        "Sadece maddi yardım yapmak"
      ],
      correctAnswer: 2,
      explanation: "İslam, müslümanların tüm insanlığa faydalı olmalarını öğütler.",
      year: 2018
    },
    {
      text: "İslam'da helal ve haram kavramları, yaşamın her alanında rehberlik sağlar. Bu kavramların temel amacı aşağıdakilerden hangisidir?",
      options: [
        "Sadece yasak koymak",
        "İnsanı ve toplumu korumak",
        "Maddi kazancı engellemek",
        "Özgürlükleri kısıtlamak",
        "Gelenekleri devam ettirmek"
      ],
      correctAnswer: 1,
      explanation: "Helal ve haram kavramları, insanı ve toplumu zararlı durumlardan korumak için konulmuştur.",
      year: 2024
    },
    {
      text: "Hz. Muhammed'in 'Komşusu açken tok yatan bizden değildir' sözü, toplumsal dayanışmanın önemini vurgular. Bu hadis hangi değeri ön plana çıkarır?",
      options: [
        "Bireysel çıkarları korumak",
        "Sosyal duyarlılık ve dayanışma",
        "Maddi birikimi artırmak",
        "Sadece aile ile ilgilenmek",
        "Toplumdan uzaklaşmak"
      ],
      correctAnswer: 1,
      explanation: "Bu hadis, sosyal duyarlılık ve toplumsal dayanışmanın önemini vurgular.",
      year: 2023
    },
    {
      text: "İslam'da şura (danışma) ilkesi, önemli kararların alınmasında uygulanır. Bu ilkenin toplumsal yararı aşağıdakilerden hangisidir?",
      options: [
        "Kararları geciktirmek",
        "Demokrasiyi engellemek",
        "Kolektif aklı kullanmak",
        "Liderliği zayıflatmak",
        "Çatışma çıkarmak"
      ],
      correctAnswer: 2,
      explanation: "Şura ilkesi, kolektif aklın kullanılmasını ve daha doğru kararlar alınmasını sağlar.",
      year: 2022
    },
    {
      text: "İslam'da kadın ve erkeğin toplum içindeki rolleri, eşitlik ve tamamlayıcılık prensiplerine dayanır. Bu anlayış hangi yaklaşımı benimser?",
      options: [
        "Kadın ve erkeği tamamen aynı görür",
        "Erkeklere üstünlük tanır",
        "Kadınları ikinci plana atar",
        "Farklılıkları kabul edip eşitliği savunur",
        "Rolleri katı şekilde ayırır"
      ],
      correctAnswer: 3,
      explanation: "İslam, kadın ve erkek arasındaki farklılıkları kabul edip temel haklarda eşitliği savunur.",
      year: 2021
    },
    {
      text: "İslam'da çevre ve doğaya karşı sorumluluğumuz, Allah'ın emaneti olarak görülür. Bu sorumluluk nasıl anlaşılmalıdır?",
      options: [
        "Doğayı sadece kullanmak için yaratıldığını düşünmek",
        "Çevreyi korumak ve gelecek nesillere bırakmak",
        "Sadece hayvanları korumak",
        "Doğal kaynaklardan sınırsız yararlanmak",
        "Çevre sorunlarını göz ardı etmek"
      ],
      correctAnswer: 1,
      explanation: "İslam, çevreyi korumanın ve gelecek nesillere temiz bırakmanın sorumluluğunu vurgular.",
      year: 2020
    },
    {
      text: "İslam'da oruç, sadece yemek içmekten kaçınmak değil, nefsi terbiye etmenin de bir yoludur. Orucun kişilik gelişimine katkısı nedir?",
      options: [
        "Sadece sağlığı korur",
        "İradeyi güçlendirir ve empati geliştirir",
        "Sosyal statü sağlar",
        "Maddi tasarruf sağlar",
        "Sadece geleneksel bir ritüeldir"
      ],
      correctAnswer: 1,
      explanation: "Oruç, iradeyi güçlendirir ve fakir insanlara karşı empati geliştirmeye yardımcı olur.",
      year: 2019
    },
    {
      text: "İslam'da hac ibadeti, farklı milletlerden müslümanların bir araya gelmesini sağlar. Haccın bu yönü hangi değeri güçlendirir?",
      options: [
        "Milliyetçiliği artırır",
        "Evrensel kardeşlik duygusunu geliştirir",
        "Irksal ayrımları pekiştirir",
        "Sosyal sınıfları belirginleştirir",
        "Kültürel farklılıkları vurgular"
      ],
      correctAnswer: 1,
      explanation: "Hac, farklı milletlerden müslümanları bir araya getirerek evrensel kardeşlik duygusunu güçlendirir.",
      year: 2018
    },
    {
      text: "İslam'da tevhid (birlik) inancı, sadece Allah'ın birliğini değil, yaratılışın birliğini de ifade eder. Bu anlayış hayata nasıl yansır?",
      options: [
        "Sadece ibadetlerde kendini gösterir",
        "Tüm yaratılanlar arası uyumu vurgular",
        "İnsanları birbirinden ayırır",
        "Doğayı önemsizleştirir",
        "Sadece bireysel inancı ilgilendirir"
      ],
      correctAnswer: 1,
      explanation: "Tevhid inancı, tüm yaratılanlar arasındaki uyum ve birliği vurgular.",
      year: 2024
    },
    {
      text: "İslam'da 'Din nasihattır' hadis-i şerifine göre, müslümanların birbirlerine karşı sorumlulukları nelerdir?",
      options: [
        "Sadece kendi işleriyle ilgilenmek",
        "Birbirini eleştirmek",
        "İyi öğüt vermek ve kötülüklerden uzaklaştırmak",
        "Müdahale etmemek",
        "Sadece övmek"
      ],
      correctAnswer: 2,
      explanation: "Bu hadis, müslümanların birbirlerine iyi öğüt vermesi ve kötülüklerden uzaklaştırmasını gerektirir.",
      year: 2023
    },
    {
      text: "İslam'da sosyal adalet, zengin-fakir arasındaki dengeyi korumayı hedefler. Bu amaca yönelik hangi uygulama öne çıkar?",
      options: [
        "Sadece dua etmek",
        "Zekât ve sadaka sistemi",
        "Fakirleri toplumdan uzaklaştırmak",
        "Zenginliği yasaklamak",
        "Sınıf farklarını pekiştirmek"
      ],
      correctAnswer: 1,
      explanation: "İslam'da zekât ve sadaka sistemi, sosyal adaleti sağlayan temel mekanizmadır.",
      year: 2022
    },
    {
      text: "İslam'da aile kurumu, toplumun temel taşı olarak görülür. Sağlıklı bir aile yapısının özellikleri arasında hangisi yer almaz?",
      options: [
        "Karşılıklı saygı ve sevgi",
        "Sorumluluk paylaşımı",
        "Otoriter yaklaşım",
        "Merhamet ve şefkat",
        "Dürüstlük ve güven"
      ],
      correctAnswer: 2,
      explanation: "İslam'da sağlıklı aile yapısı merhamet, saygı ve işbirliğine dayanır, otoriter yaklaşım tercih edilmez.",
      year: 2021
    },
    {
      text: "İslam'da ilim öğretme ve öğrenme, hayat boyu süren bir süreç olarak görülür. Bu yaklaşımın temel nedeni aşağıdakilerden hangisidir?",
      options: [
        "Sadece ezber yapmak için",
        "Sürekli gelişim ve kendini yenileme ihtiyacı",
        "Başkalarından üstün olmak için",
        "Sadece dini bilgileri öğrenmek için",
        "Geçmişte kalmış bilgileri tekrarlamak için"
      ],
      correctAnswer: 1,
      explanation: "İslam, sürekli öğrenmeyi ve kendini yenilemeyi yaşamın temel gerekliliği olarak görür.",
      year: 2020
    }
  ];

  console.log(`${aytQuestions.length} AYT sorusunu veritabanına yüklüyorum...`);
  
  let savedCount = 0;
  const errors = [];

  for (let i = 0; i < aytQuestions.length; i++) {
    const question = aytQuestions[i];
    try {
      const insertQuestion = {
        examCategoryId: 'ayt',
        subject: 'din kültürü ve ahlak bilgisi',
        difficulty: 'medium' as const,
        questionText: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        points: 10,
        topic: 'din kültürü ve ahlak bilgisi',
        year: question.year
      };
      
      await storage.createQuestion(insertQuestion);
      savedCount++;
      console.log(`${savedCount}. soru kaydedildi`);
    } catch (dbError: any) {
      console.error(`Soru ${i+1} kaydetme hatası:`, dbError?.message);
      errors.push(dbError?.message || 'Bilinmeyen hata');
    }
  }

  return {
    success: true,
    totalQuestions: aytQuestions.length,
    savedCount,
    errors: errors.length > 0 ? errors : undefined,
    message: `${savedCount} AYT sorusu veritabanına kaydedildi`
  };
}