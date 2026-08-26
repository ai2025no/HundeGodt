import {
  Product,
  Category,
  Brand,
  Order,
  CustomerProfile,
  Campaign,
  DiscountCode,
  Review,
  CmsHeroBlock,
  CmsSectionBlock,
  AbandonedCart,
  AuditLog,
  AdminUser,
  AnalyticsSummary,
  DogProfile,
  OrderStatus,
  AdminRole,
} from '@/types';
import {
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_CAMPAIGNS,
  INITIAL_DISCOUNT_CODES,
  INITIAL_REVIEWS,
  INITIAL_HERO,
  INITIAL_CMS_SECTIONS,
  INITIAL_ABANDONED_CARTS,
  INITIAL_ADMIN_USERS,
  INITIAL_AUDIT_LOGS,
} from './mock-data';

const STORAGE_KEYS = {
  PRODUCTS: 'hg_products_v2',
  CATEGORIES: 'hg_categories_v2',
  BRANDS: 'hg_brands_v2',
  ORDERS: 'hg_orders_v2',
  CUSTOMERS: 'hg_customers_v2',
  CAMPAIGNS: 'hg_campaigns_v2',
  DISCOUNTS: 'hg_discounts_v2',
  REVIEWS: 'hg_reviews_v2',
  HERO: 'hg_hero_v2',
  CMS_SECTIONS: 'hg_cms_sections_v2',
  ABANDONED_CARTS: 'hg_abandoned_carts_v2',
  AUDIT_LOGS: 'hg_audit_logs_v2',
  CURRENT_USER_ID: 'hg_current_user_id_v2',
  ADMIN_ROLE: 'hg_admin_role_v2',
};

// Helper for localStorage with SSR fallback
function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Trigger custom event so reactive hooks can re-render immediately
    window.dispatchEvent(new CustomEvent('hg_storage_updated', { detail: { key } }));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const db = {
  // ==========================================
  // PRODUKTER (PRODUCTS)
  // ==========================================
  getProducts(): Product[] {
    return getStoredItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },

  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  },

  saveProduct(product: Product, adminName = 'Admin'): Product {
    const products = this.getProducts();
    const existingIndex = products.findIndex((p) => p.id === product.id);
    let updatedProducts: Product[];

    if (existingIndex >= 0) {
      const oldProd = products[existingIndex];
      updatedProducts = [...products];
      updatedProducts[existingIndex] = {
        ...product,
        updatedAt: new Date().toISOString(),
      };
      this.addAuditLog({
        adminName,
        adminEmail: 'admin@hundegodt.no',
        adminRole: 'administrator',
        action: 'Oppdaterte produkt',
        entityType: 'product',
        entityId: product.id,
        entityName: product.name,
        details: `Oppdaterte detaljer/pris for ${product.name}`,
        oldValue: `${oldProd.basePriceNok} NOK`,
        newValue: `${product.basePriceNok} NOK`,
      });
    } else {
      const newProd: Product = {
        ...product,
        id: product.id || `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedProducts = [newProd, ...products];
      this.addAuditLog({
        adminName,
        adminEmail: 'admin@hundegodt.no',
        adminRole: 'administrator',
        action: 'Opprettet nytt produkt',
        entityType: 'product',
        entityId: newProd.id,
        entityName: newProd.name,
        details: `Opprettet produkt ${newProd.name} i kategori ${newProd.categoryName}`,
      });
    }

    setStoredItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
    return product;
  },

  deleteProduct(productId: string, adminName = 'Admin'): boolean {
    const products = this.getProducts();
    const target = products.find((p) => p.id === productId);
    if (!target) return false;

    const filtered = products.filter((p) => p.id !== productId);
    setStoredItem(STORAGE_KEYS.PRODUCTS, filtered);

    this.addAuditLog({
      adminName,
      adminEmail: 'admin@hundegodt.no',
      adminRole: 'owner',
      action: 'Slettet produkt',
      entityType: 'product',
      entityId: productId,
      entityName: target.name,
      details: `Slettet produkt ${target.name}`,
    });

    return true;
  },

  adjustInventory(productId: string, variantId: string, delta: number, reason: string): boolean {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return false;

    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return false;

    const oldQty = variant.inventoryQuantity;
    variant.inventoryQuantity = Math.max(0, variant.inventoryQuantity + delta);

    setStoredItem(STORAGE_KEYS.PRODUCTS, products);

    this.addAuditLog({
      adminName: 'System / Lager',
      adminEmail: 'system@hundegodt.no',
      adminRole: 'warehouse',
      action: 'Lagerjustering',
      entityType: 'inventory',
      entityId: variantId,
      entityName: `${product.name} (${variant.title})`,
      details: `${reason}: Justerte fra ${oldQty} til ${variant.inventoryQuantity}`,
      oldValue: `${oldQty}`,
      newValue: `${variant.inventoryQuantity}`,
    });

    return true;
  },

  // ==========================================
  // KATEGORIER & MERKER
  // ==========================================
  getCategories(): Category[] {
    return getStoredItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  saveCategories(categories: Category[]): void {
    setStoredItem(STORAGE_KEYS.CATEGORIES, categories);
  },

  getBrands(): Brand[] {
    return getStoredItem<Brand[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  },

  // ==========================================
  // ORDRER (ORDERS)
  // ==========================================
  getOrders(): Order[] {
    return getStoredItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderNumber === id);
  },

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const orderNumber = `HG-${10480 + orders.length + 1}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct inventory
    for (const item of newOrder.items) {
      this.adjustInventory(
        item.productId,
        item.variantId,
        -item.quantity,
        `Kjøp fullført i ordre ${orderNumber}`
      );
    }

    setStoredItem(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, adminName = 'Admin'): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
      order.trackingUrl = `https://sporing.bring.no/sporing/${trackingNumber}`;
    }

    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    this.addAuditLog({
      adminName,
      adminEmail: 'admin@hundegodt.no',
      adminRole: 'warehouse',
      action: 'Endret ordrestatus',
      entityType: 'order',
      entityId: order.id,
      entityName: `Ordre ${order.orderNumber}`,
      details: `Status endret fra ${oldStatus} til ${status}`,
      oldValue: oldStatus,
      newValue: status,
    });

    return order;
  },

  // ==========================================
  // KUNDER & HUNDER (CUSTOMERS & DOGS)
  // ==========================================
  getCustomers(): CustomerProfile[] {
    return getStoredItem<CustomerProfile[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  getCurrentCustomer(): CustomerProfile {
    const customers = this.getCustomers();
    const currentId = getStoredItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'cust-emma');
    return customers.find((c) => c.id === currentId) || customers[0] || INITIAL_CUSTOMERS[0];
  },

  setCurrentCustomerId(customerId: string): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER_ID, customerId);
  },

  saveCustomerProfile(profile: CustomerProfile): void {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === profile.id);
    if (index >= 0) {
      customers[index] = profile;
    } else {
      customers.push(profile);
    }
    setStoredItem(STORAGE_KEYS.CUSTOMERS, customers);
  },

  addDogToCustomer(customerId: string, dog: Omit<DogProfile, 'id' | 'createdAt'>): DogProfile {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    const newDog: DogProfile = {
      ...dog,
      id: `dog-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (customer) {
      customer.dogs = [...(customer.dogs || []), newDog];
      setStoredItem(STORAGE_KEYS.CUSTOMERS, customers);
    }

    return newDog;
  },

  updateDog(customerId: string, dogId: string, updates: Partial<DogProfile>): boolean {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer || !customer.dogs) return false;

    const dogIndex = customer.dogs.findIndex((d) => d.id === dogId);
    if (dogIndex < 0) return false;

    customer.dogs[dogIndex] = { ...customer.dogs[dogIndex], ...updates };
    setStoredItem(STORAGE_KEYS.CUSTOMERS, customers);
    return true;
  },

  deleteDog(customerId: string, dogId: string): boolean {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer || !customer.dogs) return false;

    customer.dogs = customer.dogs.filter((d) => d.id !== dogId);
    setStoredItem(STORAGE_KEYS.CUSTOMERS, customers);
    return true;
  },

  // ==========================================
  // KAMPANJER & RABATTKODER
  // ==========================================
  getCampaigns(): Campaign[] {
    return getStoredItem<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
  },

  saveCampaign(campaign: Campaign): void {
    const campaigns = this.getCampaigns();
    const index = campaigns.findIndex((c) => c.id === campaign.id);
    if (index >= 0) {
      campaigns[index] = campaign;
    } else {
      campaigns.unshift({ ...campaign, id: campaign.id || `camp-${Date.now()}` });
    }
    setStoredItem(STORAGE_KEYS.CAMPAIGNS, campaigns);
  },

  getDiscountCodes(): DiscountCode[] {
    return getStoredItem<DiscountCode[]>(STORAGE_KEYS.DISCOUNTS, INITIAL_DISCOUNT_CODES);
  },

  validateDiscountCode(codeString: string, cartTotalNok: number): { valid: boolean; discount?: DiscountCode; message?: string } {
    const codes = this.getDiscountCodes();
    const match = codes.find((c) => c.code.toUpperCase() === codeString.trim().toUpperCase());

    if (!match) {
      return { valid: false, message: 'Ugyldig rabattkode.' };
    }
    if (!match.isActive) {
      return { valid: false, message: 'Denne rabattkoden er utløpt.' };
    }
    if (match.minOrderAmountNok && cartTotalNok < match.minOrderAmountNok) {
      return {
        valid: false,
        message: `Koden krever en handlekurv på minst ${match.minOrderAmountNok} kr.`,
      };
    }
    return { valid: true, discount: match };
  },

  // ==========================================
  // ANMELDELSER (REVIEWS)
  // ==========================================
  getReviews(): Review[] {
    return getStoredItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      status: 'approved', // Auto-approved for demo ease
      createdAt: new Date().toISOString(),
    };
    setStoredItem(STORAGE_KEYS.REVIEWS, [newReview, ...reviews]);
    return newReview;
  },

  updateReviewStatus(reviewId: string, status: 'approved' | 'rejected', adminResponse?: string): void {
    const reviews = this.getReviews();
    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      review.status = status;
      if (adminResponse !== undefined) {
        review.adminResponse = adminResponse;
      }
      setStoredItem(STORAGE_KEYS.REVIEWS, reviews);
    }
  },

  // ==========================================
  // CMS FORSIDEBLOKKER
  // ==========================================
  getHero(): CmsHeroBlock {
    return getStoredItem<CmsHeroBlock>(STORAGE_KEYS.HERO, INITIAL_HERO);
  },

  saveHero(hero: CmsHeroBlock): void {
    setStoredItem(STORAGE_KEYS.HERO, hero);
  },

  getCmsSections(): CmsSectionBlock[] {
    return getStoredItem<CmsSectionBlock[]>(STORAGE_KEYS.CMS_SECTIONS, INITIAL_CMS_SECTIONS);
  },

  saveCmsSections(sections: CmsSectionBlock[]): void {
    setStoredItem(STORAGE_KEYS.CMS_SECTIONS, sections);
  },

  // ==========================================
  // FORLATTE HANDLEKURVER (ABANDONED CARTS)
  // ==========================================
  getAbandonedCarts(): AbandonedCart[] {
    return getStoredItem<AbandonedCart[]>(STORAGE_KEYS.ABANDONED_CARTS, INITIAL_ABANDONED_CARTS);
  },

  // ==========================================
  // AUDIT LOGS & ADMIN ROLLER
  // ==========================================
  getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
  },

  getAdminUsers(): AdminUser[] {
    return INITIAL_ADMIN_USERS;
  },

  getCurrentAdminRole(): AdminRole {
    return getStoredItem<AdminRole>(STORAGE_KEYS.ADMIN_ROLE, 'owner');
  },

  setCurrentAdminRole(role: AdminRole): void {
    setStoredItem(STORAGE_KEYS.ADMIN_ROLE, role);
  },

  // ==========================================
  // ANALYTICS & RAPPORT-BEREGNING
  // ==========================================
  getAnalyticsSummary(): AnalyticsSummary {
    const orders = this.getOrders();
    const customers = this.getCustomers();
    const products = this.getProducts();

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalNok, 0);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalNok, 0);
    const totalItemsSold = orders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );

    const lowStockCount = products.reduce((count, p) => {
      const hasLow = p.variants.some((v) => v.inventoryQuantity <= v.lowStockThreshold);
      return count + (hasLow ? 1 : 0);
    }, 0);

    const pendingOrdersCount = orders.filter((o) => o.status === 'processing' || o.status === 'paid' || o.status === 'pending').length;

    return {
      todayRevenueNok: todayRevenue || 3845,
      weekRevenueNok: totalRevenue * 0.45 || 24890,
      monthRevenueNok: totalRevenue || 68420,
      revenueChangePercentVsLastMonth: 18.4,
      totalOrdersCount: orders.length + 18,
      averageOrderValueNok: Math.round(totalRevenue / (orders.length || 1)),
      totalCustomersCount: customers.length + 142,
      newCustomersThisMonth: 38,
      conversionRatePercent: 3.42,
      conversionRateChangePercent: 0.6,
      abandonedCartsCount: 8,
      itemsSoldTotal: totalItemsSold + 54,
      returnRatePercent: 1.2,
      lowStockItemsCount: lowStockCount,
      pendingOrdersCount,
    };
  },

  // Reset database back to pristine initial seed
  resetToSeed(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    window.localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    window.localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS));
    window.localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    window.localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    window.localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    window.localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(INITIAL_DISCOUNT_CODES));
    window.localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    window.localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(INITIAL_HERO));
    window.localStorage.setItem(STORAGE_KEYS.CMS_SECTIONS, JSON.stringify(INITIAL_CMS_SECTIONS));
    window.localStorage.setItem(STORAGE_KEYS.ABANDONED_CARTS, JSON.stringify(INITIAL_ABANDONED_CARTS));
    window.localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    window.dispatchEvent(new CustomEvent('hg_storage_updated', { detail: { key: 'all' } }));
  },
};
