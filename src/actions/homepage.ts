"use server";

import { ContentService, ContentBlockInput } from "@/services/content.service";
import { revalidatePath } from "next/cache";

export async function updateContentBlockAction(id: string, block: Partial<ContentBlockInput>) {
  try {
    await ContentService.updateContentBlock(id, block);
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update content block" };
  }
}

export async function reorderContentBlocksAction(orders: { id: string; display_order: number }[]) {
  try {
    await ContentService.reorderBlocks(orders);
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reorder blocks" };
  }
}
