"use server";

import { StorageService } from "@/services/storage.service";
import { revalidatePath } from "next/cache";

export async function uploadMediaAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "misc";

    if (!file || file.size === 0) {
      throw new Error("No file uploaded");
    }

    const publicUrl = await StorageService.uploadFile(file, folder);
    revalidatePath("/admin/media");
    return { success: true, url: publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || "Upload failed" };
  }
}

export async function deleteMediaAction(url: string) {
  try {
    if (!url) {
      throw new Error("No URL provided");
    }
    await StorageService.deleteFile(url);
    revalidatePath("/admin/media");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Deletion failed" };
  }
}

export async function listMediaAction(folder: string) {
  try {
    const files = await StorageService.listFiles(folder);
    return { success: true, files };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to list files" };
  }
}
