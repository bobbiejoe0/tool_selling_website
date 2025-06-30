export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: Date;
}

export interface Product {
  id: number;
  title: string;
  price: string;
  description: string;
  categoryId: number;
  tags?: string[];
  isFree?: boolean;
  rating?: string;
  reviewCount?: number;
  downloadUrl?: string | null;
  originalPrice?: string | null;
  downloadCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
  description?: string | null;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt?: Date;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  paymentMethod?: string | null;
  createdAt?: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface CartItemWithProduct extends CartItem {
  product: ProductWithCategory;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface InsertUser {
  username: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface InsertProduct {
  title: string;
  price: string;
  description: string;
  categoryId: number;
  tags?: string[];
  isFree?: boolean;
  originalPrice?: string | null;
  downloadUrl?: string | null;
  rating?: string;
  reviewCount?: number;
  downloadCount?: number;
}

export interface InsertCategory {
  name: string;
  slug?: string;
  icon?: string;
  description?: string | null;
}

export interface InsertCartItem {
  userId: number;
  productId: number;
  quantity?: number;
}

export interface InsertOrder {
  userId: number;
  status?: string;
  paymentMethod?: string | null;
}

export interface InsertOrderItem {
  orderId: number;
  productId: number;
  quantity?: number;
}