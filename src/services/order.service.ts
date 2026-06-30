import { createClient } from "@/lib/supabase/server";
import { exportOrdersToCsv } from "@/utils/csv";

export interface OrderInput {
  customer_details: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  shipping_charge: number;
  tax_amount: number;
  total_amount: number;
}

export interface OrderItemInput {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  price: number;
}

export class OrderService {
  /**
   * Create a new order, insert items, and adjust stock levels.
   */
  static async createOrder(order: OrderInput, items: OrderItemInput[], orderId?: string, paymentId?: string) {
    const supabase = await createClient();

    // 1. Insert order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_details: order.customer_details,
          shipping_charge: order.shipping_charge,
          tax_amount: order.tax_amount,
          total_amount: order.total_amount,
          status: "pending",
          payment_status: "pending",
          order_id: orderId || null,
          payment_id: paymentId || null,
        },
      ])
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    const createdOrderId = newOrder.id;

    // 2. Insert order items
    const itemsToInsert = items.map((item) => ({
      order_id: createdOrderId,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);
    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // 3. Update stock levels
    for (const item of items) {
      if (item.variant_id) {
        // Decrement variant stock
        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("id", item.variant_id)
          .single();
          
        if (variant) {
          await supabase
            .from("product_variants")
            .update({ stock: Math.max(0, variant.stock - item.quantity) })
            .eq("id", item.variant_id);
        }
      } else {
        // Decrement product stock
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();
          
        if (product) {
          await supabase
            .from("products")
            .update({ stock: Math.max(0, product.stock - item.quantity) })
            .eq("id", item.product_id);
        }
      }
    }

    return newOrder;
  }

  /**
   * Fetch orders with search and pagination.
   */
  static async getOrders(options?: {
    status?: string;
    payment_status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const supabase = await createClient();

    let query = supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (id, name, slug)
        )
      `);

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }

    if (options?.payment_status && options.payment_status !== "all") {
      query = query.eq("payment_status", options.payment_status);
    }

    if (options?.search) {
      query = query.or(`payment_id.ilike.%${options.search}%,order_id.ilike.%${options.search}%,customer_details->>name.ilike.%${options.search}%,customer_details->>email.ilike.%${options.search}%`);
    }

    query = query.order("created_at", { ascending: false });

    if (options?.offset !== undefined) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    } else if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Fetch a single order by its ID.
   */
  static async getOrderById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (id, name, slug, image_url:product_images(image_url)),
          product_variants (*)
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return data;
  }

  /**
   * Update the status of an order.
   */
  static async updateOrderStatus(id: string, status: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
    return true;
  }

  /**
   * Update the payment status of an order.
   */
  static async updateOrderPaymentStatus(id: string, paymentStatus: string, paymentId?: string) {
    const supabase = await createClient();
    const updateData: any = { payment_status: paymentStatus };
    if (paymentId) {
      updateData.payment_id = paymentId;
    }
    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update order payment status: ${error.message}`);
    }
    return true;
  }

  /**
   * Export orders list to CSV.
   */
  static exportOrdersToCsv(orders: any[]): string {
    return exportOrdersToCsv(orders);
  }

  /**
   * Get metrics for the dashboard home.
   */
  static async getDashboardStats() {
    const supabase = await createClient();
    const todayStr = new Date().toISOString().split("T")[0];

    // Today's orders
    const { count: todayOrdersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${todayStr}T00:00:00Z`);

    // Out of stock count
    const { count: outOfStockCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("stock", 0)
      .is("deleted_at", null);

    // Pending orders count
    const { count: pendingOrdersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Revenue calculations (paid orders)
    const { data: allPaidOrders } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .eq("payment_status", "paid");

    let revenueToday = 0;
    let revenueMonth = 0;
    const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

    if (allPaidOrders) {
      allPaidOrders.forEach((order) => {
        const orderDateStr = order.created_at.split("T")[0];
        const orderAmt = Number(order.total_amount);
        if (orderDateStr === todayStr) {
          revenueToday += orderAmt;
        }
        if (orderDateStr.startsWith(currentMonthStr)) {
          revenueMonth += orderAmt;
        }
      });
    }

    // Top selling products (simple query on order_items)
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity, products(name, price)");

    const productSales: Record<string, { name: string; price: number; quantity: number; revenue: number }> = {};
    if (items) {
      items.forEach((item) => {
        if (!item.product_id || !item.products) return;
        const prodId = item.product_id;
        const prodName = (item.products as any).name;
        const prodPrice = Number((item.products as any).price);
        const qty = item.quantity;
        
        if (!productSales[prodId]) {
          productSales[prodId] = { name: prodName, price: prodPrice, quantity: 0, revenue: 0 };
        }
        productSales[prodId].quantity += qty;
        productSales[prodId].revenue += qty * prodPrice;
      });
    }

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Recent activity (latest orders)
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("id, customer_details, total_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      todayOrders: todayOrdersCount || 0,
      revenueToday,
      revenueMonth,
      outOfStock: outOfStockCount || 0,
      pendingOrders: pendingOrdersCount || 0,
      bestSellers,
      recentActivity: recentOrders || [],
    };
  }
}
