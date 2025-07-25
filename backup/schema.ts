export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
};

export type InsertUser = {
  username: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
};

export type InsertCategory = {
  name: string;
  slug: string;
  icon: string;
  description?: string | null;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  price: string;
  originalPrice: string | null;
  imageUrl?: string | null; // Made optional
  downloadUrl: string | null;
  rating: string;
  reviewCount: number;
  downloadCount: number;
  tags: string[];
  isFree: boolean;
  isActive: boolean;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertProduct = {
  title: string;
  description: string;
  price: string;
  originalPrice?: string | null;
  imageUrl?: string | null; // Made optional
  downloadUrl?: string | null;
  rating?: string;
  reviewCount?: number;
  downloadCount?: number;
  tags?: string[];
  isFree?: boolean;
  categoryId: number;
};

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
};

export type InsertCartItem = {
  userId: number;
  productId: number;
  quantity?: number;
};

export type Order = {
  id: number;
  userId: number;
  status: string;
  paymentMethod: string | null;
  createdAt: Date;
};

export type InsertOrder = {
  userId: number;
  status?: string;
  paymentMethod?: string | null;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
};

export type InsertOrderItem = {
  orderId: number;
  productId: number;
  quantity?: number;
};

export type ProductWithCategory = Product & {
  category: Category;
};

export type CartItemWithProduct = CartItem & {
  product: ProductWithCategory;
};

export type OrderWithItems = Order & {
  items: Array<OrderItem & { product: Product }>;
};