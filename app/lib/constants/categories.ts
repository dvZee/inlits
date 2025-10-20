// Centralized category definitions for the entire application
export const CATEGORIES = [
  'Business',
  'Finance & Investing',
  'Self-Help',
  'Psychology',
  'Career Growth',
  'Entrepreneurship',
  'Productivity',
  'Philosophy',
  'History',
  'Politics',
  'Science Fiction',
  'Technology',
  'Biographies',
  'Religion',
  'Spirituality',
  'Travel',
  'Mathematics',
  'Science',
  'Health'
];

// Category options for UI components (includes "All" option)
export const CATEGORY_OPTIONS = [
  { id: "1", name: "All", slug: "all" },
  ...CATEGORIES.map((category, index) => ({
    id: (index + 2).toString(),
    name: category,
    slug: category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')
  }))
];

// Helper function to get category slug from name
export function getCategorySlug(categoryName: string): string {
  return categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
}

// Helper function to get category name from slug
export function getCategoryName(slug: string): string {
  if (slug === 'all') return 'All';
  
  const category = CATEGORIES.find(cat => 
    getCategorySlug(cat) === slug
  );
  
  return category || slug;
}