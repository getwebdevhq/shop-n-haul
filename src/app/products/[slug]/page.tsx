import { ProductService } from "@/services/product.service";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductService.getProductBySlug(slug);
  
  if (!product) return {};

  return {
    title: `${product.seo_title || product.name} | Stash & Haul`,
    description: product.seo_description || product.description?.slice(0, 155),
    openGraph: {
      title: product.seo_title || product.name,
      description: product.seo_description || product.description?.slice(0, 155),
      images: product.product_images?.[0]?.image_url ? [{ url: product.product_images[0].image_url }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await ProductService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products (same category)
  const relatedProducts = await ProductService.getProducts({
    category_id: product.category_id,
    limit: 4,
  });

  // Filter out the current product from recommendations
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={filteredRelated}
    />
  );
}
