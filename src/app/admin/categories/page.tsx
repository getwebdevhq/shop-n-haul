import { ProductService } from "@/services/product.service";
import CategoryManager from "./CategoryManager";

export const revalidate = 0; // Disable caching to ensure real-time updates

export default async function AdminCategoriesPage() {
  const categories = await ProductService.getCategories();
  const collections = await ProductService.getCollections();

  return (
    <CategoryManager
      categories={categories}
      collections={collections}
    />
  );
}
