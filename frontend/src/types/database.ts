// frontend/src/types/database.ts

export interface DatabaseProduct {
  id: string; // UUID
  name: string;
  category: string;
  description?: string;
  images: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseVariant {
  id: string; // UUID
  product_id: string; // FK to products.id
  sku?: string;
  price: number;
  stock_qty: number;
  option_values: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}
