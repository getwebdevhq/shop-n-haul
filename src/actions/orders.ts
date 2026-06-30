"use server";

import { OrderService } from "@/services/order.service";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(id: string, status: string) {
  try {
    await OrderService.updateOrderStatus(id, status);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update order status" };
  }
}

export async function updateOrderPaymentStatusAction(id: string, paymentStatus: string, paymentId?: string) {
  try {
    await OrderService.updateOrderPaymentStatus(id, paymentStatus, paymentId);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update payment status" };
  }
}
