export interface ProductSize {
  dimensions: string;
  price: number;
  stripe_product_id?: string;
  deal_label_enabled?: boolean;
  deal_label_text?: string;
  deal_price?: number;
  mock_room_url?: string;
  mock_room_label?: string;
}

export interface MockRoom {
  url: string;
  label?: string;
}

export interface Product {
  id: string;
  name: string;
  medium: string;
  description: string;
  image_url: string;
  sizes: ProductSize[];
  display_order: number;
  deal_label_enabled: boolean;
  deal_label_text: string;
  mock_rooms?: MockRoom[]; // deprecated - kept for backward compatibility
  is_active: boolean;
  slug?: string;
  created_at?: string;
  updated_at?: string;
}
