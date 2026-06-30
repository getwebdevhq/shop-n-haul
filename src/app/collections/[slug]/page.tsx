import { ProductService } from "@/services/product.service";
import { createClient } from "@/lib/supabase/server";
import CollectionClient from "./CollectionClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  // Try fetching collection
  const { data: col } = await supabase.from("collections").select("title, description").eq("slug", slug).is("deleted_at", null).maybeSingle();
  if (col) {
    return {
      title: `${col.title} | Stash & Haul`,
      description: col.description,
    };
  }

  // Try fetching category
  const { data: cat } = await supabase.from("categories").select("name, description").eq("slug", slug).is("deleted_at", null).maybeSingle();
  if (cat) {
    return {
      title: `${cat.name} | Stash & Haul`,
      description: cat.description,
    };
  }

  return {};
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  let title = "";
  let description = "";
  let bannerUrl = "";
  let products: any[] = [];

  // 1. Check if it's a collection
  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (collection) {
    title = collection.title;
    description = collection.description || "";
    bannerUrl = collection.banner_url || "";

    // Fetch products belonging to this collection
    const { data: pCols } = await supabase
      .from("product_collections")
      .select("product_id")
      .eq("collection_id", collection.id);

    const productIds = (pCols || []).map((pc) => pc.product_id);

    if (productIds.length > 0) {
      const { data: colProds } = await supabase
        .from("products")
        .select(`
          *,
          product_images (*),
          product_variants (*)
        `)
        .in("id", productIds)
        .eq("status", "published")
        .is("deleted_at", null);
      products = colProds || [];
    }
  } else {
    // 2. Check if it's a category
    const { data: category } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (category) {
      title = category.name;
      description = category.description || "";
      bannerUrl = category.image_url || "";

      // Fetch products belonging to this category
      const { data: catProds } = await supabase
        .from("products")
        .select(`
          *,
          product_images (*),
          product_variants (*)
        `)
        .eq("category_id", category.id)
        .eq("status", "published")
        .is("deleted_at", null);
      products = catProds || [];
    } else {
      // 3. Not found
      notFound();
    }
  }

  // Fetch all categories for sidebar navigation
  const categories = await ProductService.getCategories();

  return (
    <CollectionClient
      title={title}
      description={description}
      bannerUrl={bannerUrl}
      initialProducts={products}
      categories={categories}
    />
  );
}
