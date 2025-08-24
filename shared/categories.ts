// Unified category system for BilgiBite
// This file defines the main exam categories and their database mappings

export interface ExamCategory {
  id: string;
  name: string;
  description?: string;
  dbCategories: string[]; // Database category mappings
}

export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: 'yks',
    name: 'YKS (TYT/AYT)', 
    description: 'Yükseköğretime Geçiş Sınavı - Tüm TYT ve AYT konuları',
    dbCategories: ['tyt-turkce'] // Sadece aktif olan kategoriler
  },
  {
    id: 'kpss',
    name: 'KPSS',
    description: 'Kamu Personeli Seçme Sınavı',
    dbCategories: ['kpss']
  },
  {
    id: 'ehliyet',
    name: 'Ehliyet Sınavı',
    description: 'Sürücü Kursu Ehliyet Sınavı',
    dbCategories: ['ehliyet']
  },
  {
    id: 'ales',
    name: 'ALES',
    description: 'Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı',
    dbCategories: ['ales-sayisal', 'ales-sozel', 'ales-genel']
  },
  {
    id: 'dgs',
    name: 'DGS',
    description: 'Dikey Geçiş Sınavı',
    dbCategories: ['dgs-matematik', 'dgs-turkce', 'dgs-genel']
  },
  {
    id: 'src',
    name: 'SRC Sınavı',
    description: 'Sürücü Belgeleri ve Araç Muayene İstasyonu Sınav',
    dbCategories: ['src']
  },
  {
    id: 'meb-ogretmenlik',
    name: 'MEB Öğretmenlik',
    description: 'Millî Eğitim Bakanlığı Öğretmenlik Sınav',
    dbCategories: ['meb-ogretmenlik']
  }
];

// Get category by ID
export function getCategoryById(id: string): ExamCategory | undefined {
  return EXAM_CATEGORIES.find(cat => cat.id === id);
}

// Get all database categories for a given exam category
export function getDbCategoriesForExam(examCategoryId: string): string[] {
  const category = getCategoryById(examCategoryId);
  return category?.dbCategories || [examCategoryId];
}

// Get exam category by database category
export function getExamCategoryByDbCategory(dbCategory: string): ExamCategory | undefined {
  return EXAM_CATEGORIES.find(cat => cat.dbCategories.includes(dbCategory));
}