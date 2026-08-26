// ==========================================================
// HUNDEGODT.NO — COMPLETE TYPESCRIPT DATA MODEL (COMMERCE OS)
// ==========================================================

export type DogSize = 'mini' | 'small' | 'medium' | 'large' | 'giant';
export type DogLifeStage = 'puppy' | 'adult' | 'senior' | 'all';
export type ActivityLevel = 'low' | 'normal' | 'high' | 'working';

export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string; // YYYY-MM-DD
  weightKg: number;
  size: DogSize;
  lifeStage: DogLifeStage;
  activityLevel: ActivityLevel;
  allergies: string[]; // e.g. ["Kylling", "Korn / Hvete"]
  sensitivities: string[]; // e.g. ["Sensitiv mage", "Leddproblemer"]
  favoriteFlavors: string[]; // e.g. ["Storfe", "Laks"]
  avatarUrl?: string;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  type: 'shipping' | 'billing';
  fullName: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  addresses: UserAddress[];
  dogs: DogProfile[];
  totalSpendNok: number;
  orderCount: number;
  acceptsMarketing: boolean;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  countryOfOrigin: string;
  isFeatured: boolean;
  productCount?: number;
}

export interface Category {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  iconName?: string;
  sortOrder: number;
  isActive: boolean;
  subcategories?: Category[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string; // e.g. "12 kg" or "Medium / Brun"
  sku: string;
  barcode: string;
  size?: string;
  color?: string;
  flavor?: string;
  weightGrams?: number;
  priceNok: number;
  compareAtPriceNok?: number;
  costPriceNok: number;
  inventoryQuantity: number;
  lowStockThreshold: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface NutritionalInfo {
  crudeProteinPercent?: number;
  crudeFatPercent?: number;
  crudeFiberPercent?: number;
  crudeAshPercent?: number;
  calciumPercent?: number;
  omega3Percent?: number;
  omega6Percent?: number;
  metabolizableEnergyKcalPerKg?: number;
  dailyFeedingGuide?: { weightKg: number; gramsPerDay: number }[];
}

export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  basePriceNok: number;
  compareAtPriceNok?: number;
  costPriceNok: number;
  vatRate: number; // 0.25
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  tags: string[]; // e.g. ["Kornfri", "Tannpleie", "Naturlig"]
  dogSizes: DogSize[];
  dogLifeStages: DogLifeStage[];
  ingredients?: string;
  nutritionalInfo?: NutritionalInfo;
  usageGuide?: string;
  allergens?: string[]; // ingredients to warn about
  rating: number; // 1-5
  reviewCount: number;
  viewsCount: number;
  cartAddsCount: number;
  purchaseCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantTitle: string;
  brandName: string;
  imageUrl: string;
  priceNok: number;
  compareAtPriceNok?: number;
  quantity: number;
  maxInventory: number;
  slug: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentProvider = 'vipps' | 'klarna' | 'card';
export type ShippingCarrier = 'bring' | 'postnord' | 'helthjem';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantTitle: string;
  sku: string;
  unitPriceNok: number;
  quantity: number;
  totalPriceNok: number;
  imageUrl: string;
  vatAmountNok: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "HG-10482"
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: UserAddress;
  billingAddress?: UserAddress;
  items: OrderItem[];
  subtotalNok: number;
  discountNok: number;
  shippingNok: number;
  vatNok: number;
  totalNok: number;
  status: OrderStatus;
  paymentProvider: PaymentProvider;
  paymentStatus: 'authorized' | 'captured' | 'refunded' | 'failed';
  shippingCarrier: ShippingCarrier;
  shippingMethodName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  discountCode?: string;
  campaignApplied?: string;
  customerNotes?: string;
  internalNotes?: string;
  dogId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'bogo_3_for_2' | 'free_shipping';
  value: number; // e.g. 20 (for 20%) or 100 (for 100kr)
  minOrderAmountNok?: number;
  appliesTo: 'all' | 'category' | 'products' | 'brand';
  targetIds?: string[]; // categoryIds, productIds, or brandIds
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerHeadline?: string;
  bannerSubline?: string;
  bannerImageUrl?: string;
  bannerCtaText?: string;
  bannerCtaLink?: string;
  priority: number;
  timesUsed: number;
  revenueGeneratedNok: number;
}

export interface DiscountCode {
  id: string;
  code: string; // e.g. "VELKOMMEN15"
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minOrderAmountNok?: number;
  maxUses?: number;
  currentUses: number;
  onlyNewCustomers?: boolean;
  oncePerCustomer?: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalDiscountGivenNok: number;
  totalOrderValueGeneratedNok: number;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  dogName?: string;
  dogBreed?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  adminResponse?: string;
  createdAt: string;
}

export interface CmsHeroBlock {
  id: string;
  badgeText: string;
  heading: string;
  subheading: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  imageUrl: string;
  backgroundColorHex?: string;
  isActive: boolean;
}

export interface CmsSectionBlock {
  id: string;
  type:
    | 'hero'
    | 'popular_now'
    | 'bestsellers'
    | 'news'
    | 'weekly_offers'
    | 'puppy_focus'
    | 'senior_focus'
    | 'activity_and_play'
    | 'snacks_and_treats'
    | 'customer_reviews'
    | 'featured_brands'
    | 'dog_guides'
    | 'instagram_feed'
    | 'newsletter_signup';
  title: string;
  subtitle?: string;
  sortOrder: number;
  isEnabled: boolean;
  customSettings?: Record<string, any>;
}

export interface AbandonedCart {
  id: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  items: CartItem[];
  totalValueNok: number;
  stepReached: 'cart' | 'address' | 'shipping' | 'payment';
  isRecovered: boolean;
  recoveredOrderId?: string;
  reminderSent: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: string;
  entityType: 'product' | 'order' | 'inventory' | 'campaign' | 'discount' | 'cms' | 'setting' | 'review';
  entityId: string;
  entityName: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export type AdminRole =
  | 'owner'
  | 'administrator'
  | 'warehouse'
  | 'support'
  | 'marketing'
  | 'analyst';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  lastLoginAt: string;
}

export interface AnalyticsSummary {
  todayRevenueNok: number;
  weekRevenueNok: number;
  monthRevenueNok: number;
  revenueChangePercentVsLastMonth: number;
  totalOrdersCount: number;
  averageOrderValueNok: number;
  totalCustomersCount: number;
  newCustomersThisMonth: number;
  conversionRatePercent: number;
  conversionRateChangePercent: number;
  abandonedCartsCount: number;
  itemsSoldTotal: number;
  returnRatePercent: number;
  lowStockItemsCount: number;
  pendingOrdersCount: number;
}
