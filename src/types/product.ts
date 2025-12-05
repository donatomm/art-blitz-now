export interface ProductSize {
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
  deal_label_enabled: boolean;
  deal_label_text: string;
  created_at?: string;
  updated_at?: string;
}
