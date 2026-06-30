import { ProductService } from "@/services/product.service";
import { ContentService } from "@/services/content.service";
import HomeClient from "./HomeClient";

export const revalidate = 0; // Ensure real-time database content on render

export default async function HomePage() {
  // Fetch active products (including variants and images)
  const products = await ProductService.getProducts({
    status: "published",
    limit: 20,
  });

  // Fetch active categories and collections
  const categories = await ProductService.getCategories();
  const collections = await ProductService.getCollections();

  // Fetch homepage content blocks
  const heroBlock = await ContentService.getContentBlockBySlug("home-hero");
  const bannerBlock = await ContentService.getContentBlockBySlug("home-editorial-banner");
  const testimonialsBlock = await ContentService.getContentBlockBySlug("home-testimonials");
  const newsletterBlock = await ContentService.getContentBlockBySlug("home-newsletter");

  return (
    <HomeClient
      products={products}
      categories={categories}
      collections={collections}
      heroBlock={heroBlock}
      bannerBlock={bannerBlock}
      testimonialsBlock={testimonialsBlock}
      newsletterBlock={newsletterBlock}
    />
  );
}
