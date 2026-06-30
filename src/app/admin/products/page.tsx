import { ProductService } from "@/services/product.service";
import ProductManager from "./ProductManager";

export const revalidate = 0; // Disable caching to ensure real-time product updates

export default async function AdminProductsPage() {
  // Fetch products including soft-deleted ones for full management
  const products = await ProductService.getProducts({
    status: "all",
    include_deleted: false, // Hide fully deleted, but show drafts/archived
  });

  const categories = await ProductService.getCategories();
  const collections = await ProductService.getCollections();

  return (
    <ProductManager
      initialProducts={products}
      categories={categories}
      collections={collections}
    />
  );
}
