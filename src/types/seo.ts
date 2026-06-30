export interface SEOBreadcrumb {
  name: string;
  url: string | null;
}

export interface SEOFAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface SEOProduct {
  id: string;
  name: string;
  slug: string;
  min_selling_price: string;
  max_selling_price: string;
  retail_price: string;
  average_rating: string;
  total_reviews: number;
  total_stock: number;
  moq: number;
  is_featured: boolean;
  image: string;
  category_name: string;
  brand_name: string;
  seller_name: string;
}

export interface SEOSeller {
  id: string;
  company_name: string;
  logo: string;
  rating: string;
  total_ratings: number;
  is_verified: boolean;
  city: string;
}

export interface SEORelatedCategory {
  name: string;
  slug: string;
  image: string;
}

export interface SEOPageData {
  id: string;
  page_type: string;
  slug: string;
  title: string;
  h1_heading: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  city: string;
  state: string;
  country: string;
  intro_text: string;
  buying_guide: string;
  why_choose_us: string;
  faq_json: Array<{ question: string; answer: string }>;
  related_searches: string[];
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  schema_json: Record<string, unknown>;
  views_count: number;
  category_name: string;
  category_slug: string;
  category_image: string;
  brand_name: string;
  brand_slug: string;
  brand_logo: string;
  faqs: SEOFAQ[];
  products: SEOProduct[];
  sellers: SEOSeller[];
  breadcrumbs: SEOBreadcrumb[];
  related_categories: SEORelatedCategory[];
}
