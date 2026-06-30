"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Category Actions
export async function createCategoryAction(data: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
}) {
  try {
    const supabase = await createClient();
    const { data: newCat, error } = await supabase
      .from("categories")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, data: newCat };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create category" };
  }
}

export async function updateCategoryAction(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    sort_order?: number;
  }
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("categories")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("categories")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete category" };
  }
}

// Collection Actions
export async function createCollectionAction(data: {
  title: string;
  slug: string;
  description?: string;
  banner_url?: string;
  featured?: boolean;
}) {
  try {
    const supabase = await createClient();
    const { data: newCol, error } = await supabase
      .from("collections")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, data: newCol };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create collection" };
  }
}

export async function updateCollectionAction(
  id: string,
  data: {
    title: string;
    slug: string;
    description?: string;
    banner_url?: string;
    featured?: boolean;
  }
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("collections")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update collection" };
  }
}

export async function deleteCollectionAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("collections")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete collection" };
  }
}
