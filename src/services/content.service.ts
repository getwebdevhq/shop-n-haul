import { createClient } from "@/lib/supabase/server";

export interface ContentBlockInput {
  type: string;
  slug: string;
  title: string;
  content: any;
  status?: "published" | "draft";
  display_order?: number;
}

export class ContentService {
  /**
   * Fetch content blocks by type and status.
   */
  static async getContentBlocks(options?: { type?: string; status?: string }) {
    const supabase = await createClient();
    let query = supabase
      .from("content_blocks")
      .select("*")
      .is("deleted_at", null);

    if (options?.type) {
      query = query.eq("type", options.type);
    }

    if (options?.status) {
      query = query.eq("status", options.status);
    } else {
      query = query.eq("status", "published");
    }

    query = query.order("display_order", { ascending: true });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch content blocks: ${error.message}`);
    }
    return data || [];
  }

  /**
   * Fetch a single content block by its slug.
   */
  static async getContentBlockBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch content block: ${error.message}`);
    }
    return data;
  }

  /**
   * Create a new content block (e.g. adding a new section or policy page).
   */
  static async createContentBlock(block: ContentBlockInput) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .insert([block])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create content block: ${error.message}`);
    }
    return data;
  }

  /**
   * Update an existing content block.
   */
  static async updateContentBlock(id: string, block: Partial<ContentBlockInput>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .update({ ...block, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update content block: ${error.message}`);
    }
    return data;
  }

  /**
   * Soft-delete a content block.
   */
  static async deleteContentBlock(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("content_blocks")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete content block: ${error.message}`);
    }
    return true;
  }

  /**
   * Reorder content blocks in bulk.
   */
  static async reorderBlocks(orders: { id: string; display_order: number }[]) {
    const supabase = await createClient();
    
    for (const item of orders) {
      await supabase
        .from("content_blocks")
        .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
        .eq("id", item.id);
    }
    return true;
  }
}
