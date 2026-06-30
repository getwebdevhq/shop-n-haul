"use server";

import { ProductService, ProductInput, VariantInput, ProductImageInput } from "@/services/product.service";
import { revalidatePath } from "next/cache";

export async function createProductAction(
  product: ProductInput,
  images: ProductImageInput[],
  variants: VariantInput[],
  collectionIds: string[] = []
) {
  try {
    const data = await ProductService.createProduct(product, images, variants, collectionIds);
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create product" };
  }
}

export async function updateProductAction(
  id: string,
  product: Partial<ProductInput>,
  images: ProductImageInput[],
  variants: VariantInput[],
  collectionIds: string[] = []
) {
  try {
    await ProductService.updateProduct(id, product, images, variants, collectionIds);
    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug || ""}`);
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update product" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await ProductService.softDeleteProduct(id);
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete product" };
  }
}

export async function bulkUpdateProductStatusAction(ids: string[], status: "draft" | "published" | "archived") {
  try {
    await ProductService.bulkUpdateStatus(ids, status);
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Bulk status update failed" };
  }
}

export async function bulkDeleteProductsAction(ids: string[]) {
  try {
    await ProductService.bulkDelete(ids);
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Bulk delete failed" };
  }
}

export async function importProductsAction(csvText: string) {
  try {
    const count = await ProductService.importProductsFromCsv(csvText);
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, count };
  } catch (err: any) {
    return { success: false, error: err.message || "CSV Import failed" };
  }
}
