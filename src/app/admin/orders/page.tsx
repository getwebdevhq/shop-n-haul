import { OrderService } from "@/services/order.service";
import OrderManager from "./OrderManager";

export const revalidate = 0; // Disable caching to ensure real-time orders list

export default async function AdminOrdersPage() {
  const orders = await OrderService.getOrders({
    limit: 100, // Fetch the latest 100 orders
  });

  return <OrderManager initialOrders={orders} />;
}
