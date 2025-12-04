export interface ProductSize {
  label: string;
  dimensions: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  medium: string;
  image: string;
  sizes: ProductSize[];
  order: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Ocean Dreams",
    medium: "Print on Canvas",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
    sizes: [
      { label: "S", dimensions: "40x60", price: 125 },
      { label: "M", dimensions: "60x90", price: 175 },
      { label: "L", dimensions: "80x120", price: 245 },
    ],
    order: 0,
  },
  {
    id: "2",
    name: "Mountain Serenity",
    medium: "Print on Canvas",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    sizes: [
      { label: "S", dimensions: "40x60", price: 125 },
      { label: "M", dimensions: "60x90", price: 175 },
      { label: "L", dimensions: "80x120", price: 245 },
    ],
    order: 1,
  },
  {
    id: "3",
    name: "Abstract Flow",
    medium: "Giclée Print",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
    sizes: [
      { label: "S", dimensions: "30x40", price: 95 },
      { label: "M", dimensions: "50x70", price: 145 },
      { label: "L", dimensions: "70x100", price: 195 },
    ],
    order: 2,
  },
  {
    id: "4",
    name: "Forest Light",
    medium: "Print on Canvas",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    sizes: [
      { label: "S", dimensions: "40x60", price: 125 },
      { label: "M", dimensions: "60x90", price: 175 },
      { label: "L", dimensions: "80x120", price: 245 },
    ],
    order: 3,
  },
  {
    id: "5",
    name: "City Nights",
    medium: "Print on Aluminum",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80",
    sizes: [
      { label: "S", dimensions: "40x60", price: 165 },
      { label: "M", dimensions: "60x90", price: 225 },
      { label: "L", dimensions: "80x120", price: 295 },
    ],
    order: 4,
  },
  {
    id: "6",
    name: "Golden Hour",
    medium: "Print on Canvas",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    sizes: [
      { label: "S", dimensions: "40x60", price: 125 },
      { label: "M", dimensions: "60x90", price: 175 },
      { label: "L", dimensions: "80x120", price: 245 },
    ],
    order: 5,
  },
];
