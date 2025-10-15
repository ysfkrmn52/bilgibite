// SEO Optimization Utilities
interface SEOMetaTags {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any;
}

export class SEOManager {
  private static instance: SEOManager;

  static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  updateMetaTags(meta: SEOMetaTags) {
    if (typeof document === 'undefined') return;

    // Update title
    document.title = meta.title;

    // Update meta description
    this.updateMetaTag('description', meta.description);

    // Update keywords if provided
    if (meta.keywords) {
      this.updateMetaTag('keywords', meta.keywords);
    }

    // Update canonical URL
    if (meta.canonical) {
      this.updateLinkTag('canonical', meta.canonical);
    }

    // Update Open Graph tags
    this.updateMetaTag('og:title', meta.ogTitle || meta.title);
    this.updateMetaTag('og:description', meta.ogDescription || meta.description);
    this.updateMetaTag('og:type', meta.ogType || 'website');
    this.updateMetaTag('og:url', meta.canonical || window.location.href);
    
    if (meta.ogImage) {
      this.updateMetaTag('og:image', meta.ogImage);
      this.updateMetaTag('og:image:width', '1200');
      this.updateMetaTag('og:image:height', '630');
    }

    // Update Twitter Card tags
    this.updateMetaTag('twitter:card', meta.twitterCard || 'summary_large_image');
    this.updateMetaTag('twitter:title', meta.twitterTitle || meta.title);
    this.updateMetaTag('twitter:description', meta.twitterDescription || meta.description);
    
    if (meta.twitterImage || meta.ogImage) {
      this.updateMetaTag('twitter:image', meta.twitterImage || meta.ogImage || '');
    }

    // Add structured data
    if (meta.structuredData) {
      this.addStructuredData(meta.structuredData);
    }
  }

  private updateMetaTag(property: string, content: string) {
    const isOg = property.startsWith('og:');
    const isTwitter = property.startsWith('twitter:');
    
    let selector: string;
    if (isOg) {
      selector = `meta[property="${property}"]`;
    } else if (isTwitter) {
      selector = `meta[name="${property}"]`;
    } else {
      selector = `meta[name="${property}"]`;
    }

    let element = document.querySelector(selector) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      if (isOg) {
        element.setAttribute('property', property);
      } else {
        element.setAttribute('name', property);
      }
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  }

  private updateLinkTag(rel: string, href: string) {
    let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    
    element.setAttribute('href', href);
  }

  private addStructuredData(data: any) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": breadcrumb.name,
        "item": breadcrumb.url
      }))
    };
  }

  generateWebsiteStructuredData() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "BilgiBite",
      "description": "AI destekli Türk sınav hazırlık platformu - YKS, KPSS, Ehliyet sınavlarına hazırlanın",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };
  }

  generateEducationStructuredData() {
    return {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "BilgiBite",
      "description": "AI destekli Turkish exam hazırlık platformu",
      "url": window.location.origin,
      "sameAs": [
        // Add social media URLs when available
      ],
      "offers": {
        "@type": "Offer",
        "category": "Educational Services",
        "priceCurrency": "TRY",
        "price": "80.00",
        "description": "Premium abonelik planı"
      }
    };
  }

  preloadCriticalResources() {
    const criticalResources = [
      { href: '/icons/icon-192x192.png', as: 'image' },
      { href: '/api/exam-categories', as: 'fetch', crossorigin: 'anonymous' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }
      document.head.appendChild(link);
    });
  }

  addHrefLangTags(languages: Array<{ lang: string; url: string }>) {
    languages.forEach(({ lang, url }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hrefLang = lang;
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

// Page-specific SEO configurations
export const seoConfigs = {
  dashboard: {
    title: 'Dashboard - BilgiBite | Turkish Exam Preparation',
    description: 'Your personal learning dashboard. Track progress, view analytics, and continue your Turkish exam preparation journey.',
    keywords: 'dashboard, progress tracking, Turkish exams, learning analytics'
  },
  
  pricing: {
    title: 'Fiyatlar - BilgiBite Premium Planları | YKS KPSS Hazırlık',
    description: 'BilgiBite Premium abonelik planları. AI öğretmen, sınırsız quiz ve gelişmiş analiz özellikleri. 7 gün ücretsiz deneme.',
    keywords: 'fiyat, premium, abonelik, AI öğretmen, Turkish exam, YKS, KPSS'
  },

  turkishExams: {
    title: 'Türk Sınavları - YKS, KPSS, Ehliyet | BilgiBite',
    description: 'YKS, KPSS ve ehliyet sınavlarına hazırlanın. Gerçek sınav ortamında mock testler ve AI destekli özel çalışma planları.',
    keywords: 'YKS, KPSS, ehliyet sınavı, mock test, Turkish exam preparation'
  },

  aiLearning: {
    title: 'AI Öğretmen - Kişisel Öğrenme Asistanı | BilgiBite',
    description: 'AI destekli kişisel öğretmen ile zayıf yönlerinizi keşfedin, özel sorular çözün ve performansınızı artırın.',
    keywords: 'AI öğretmen, kişisel asistan, adaptive learning, Turkish AI education'
  }
};

export default SEOManager;