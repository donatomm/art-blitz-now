export interface ProductSize {
  label: string;
  dimensions: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  medium: string;
  image_url: string;
  sizes: ProductSize[];
  display_order: number;
  created_at?: string;
  updated_at?: string;
}