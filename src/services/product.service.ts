import { createClient } from "@/lib/supabase/server";

export interface ProductInput {
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number | null;
  sku?: string | null;
  stock: number;
  low_stock_threshold: number;
  category_id?: string | null;
  status: "draft" | "published" | "archived";
  tags?: string[];
  weight?: number | null;
  dimensions?: string | null;
  material?: string | null;
  care_instructions?: string | null;
  availability: boolean;
  featured: boolean;
  bestseller: boolean;
  new_arrival: boolean;
  sale_end_date?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface VariantInput {
  id?: string;
  name: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  sku?: string | null;
  image_url?: string | null;
  option_values?: Record<string, string>;
}

export interface ProductImageInput {
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
}

export class ProductService {
  /**
   * Fetch products with extensive filtering, sorting, and search.
   */
  static async getProducts(options?: {
    status?: "draft" | "published" | "archived" | "all";
    category_id?: string;
    category_slug?: string;
    collection_id?: string;
    collection_slug?: string;
    featured?: boolean;
    bestseller?: boolean;
    new_arrival?: boolean;
    limit?: number;
    offset?: number;
    sort?: "price_asc" | "price_desc" | "created_at_desc" | "name_asc";
    search?: string;
    include_deleted?: boolean;
  }) {
    const supabase = await createClient();
    
    let query = supabase
      .from("products")
      .select(`
        *,
        categories (id, name, slug),
        product_images (*),
        product_variants (*)
      `);

    // Handle soft deletion
    if (!options?.include_deleted) {
      query = query.is("deleted_at", null);
    }

    // Status filtering
    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    } else if (!options?.status) {
      query = query.eq("status", "published");
    }

    // Featured/Bestseller/New Arrival
    if (options?.featured !== undefined) {
      query = query.eq("featured", options.featured);
    }
    if (options?.bestseller !== undefined) {
      query = query.eq("bestseller", options.bestseller);
    }
    if (options?.new_arrival !== undefined) {
      query = query.eq("new_arrival", options.new_arrival);
    }

    // Category filtering
    if (options?.category_id) {
      query = query.eq("category_id", options.category_id);
    }

    // Text search (simple ILIKE)
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    // Execute query to apply sorting and pagination
    if (options?.sort) {
      switch (options.sort) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "name_asc":
          query = query.order("name", { ascending: true });
          break;
        case "created_at_desc":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }
    } else {
      query = query.order("created_at", { ascending: false });
    }

    if (options?.offset !== undefined) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    } else if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }

    let { data: products, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Category slug filtering (done post-query or via join)
    if (options?.category_slug && products) {
      products = products.filter((p: any) => p.categories?.slug === options.category_slug);
    }

    // Collection filtering (requires joining product_collections)
    if ((options?.collection_id || options?.collection_slug) && products) {
      const colQuery = supabase.from("product_collections").select("product_id, collections!inner(id, slug)");
      let colFilter = colQuery;
      
      if (options.collection_id) {
        colFilter = colFilter.eq("collection_id", options.collection_id);
      }
      if (options.collection_slug) {
        colFilter = colFilter.eq("collections.slug", options.collection_slug);
      }

      const { data: pCols } = await colFilter;
      const allowedProductIds = new Set((pCols || []).map((pc) => pc.product_id));
      products = products.filter((p) => allowedProductIds.has(p.id));
    }

    return products || [];
  }

  /**
   * Fetch a single product by its slug.
   */
  static async getProductBySlug(slug: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (*),
        product_images (*),
        product_variants (*)
      `)
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  }

  /**
   * Fetch a single product by its ID.
   */
  static async getProductById(id: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (*),
        product_variants (*),
        product_collections (collection_id)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new product along with its images, variants, and collection associations.
   */
  static async createProduct(
    product: ProductInput,
    images: ProductImageInput[],
    variants: VariantInput[],
    collectionIds: string[] = []
  ) {
    const supabase = await createClient();

    // 1. Insert product
    const { data: newProduct, error: prodError } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (prodError) {
      throw new Error(`Failed to create product: ${prodError.message}`);
    }

    const productId = newProduct.id;

    // 2. Insert images
    if (images.length > 0) {
      const imagesToInsert = images.map((img) => ({
        product_id: productId,
        image_url: img.image_url,
        alt_text: img.alt_text || product.name,
        sort_order: img.sort_order,
      }));
      const { error: imgError } = await supabase.from("product_images").insert(imagesToInsert);
      if (imgError) throw new Error(`Failed to add product images: ${imgError.message}`);
    }

    // 3. Insert variants
    if (variants.length > 0) {
      const variantsToInsert = variants.map((v) => ({
        product_id: productId,
        name: v.name,
        price: v.price,
        sale_price: v.sale_price,
        stock: v.stock,
        sku: v.sku || `${product.sku}-${v.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
        image_url: v.image_url,
        option_values: v.option_values || {},
      }));
      const { error: varError } = await supabase.from("product_variants").insert(variantsToInsert);
      if (varError) throw new Error(`Failed to add product variants: ${varError.message}`);
    }

    // 4. Associate with collections
    if (collectionIds.length > 0) {
      const colToInsert = collectionIds.map((colId) => ({
        product_id: productId,
        collection_id: colId,
      }));
      const { error: colError } = await supabase.from("product_collections").insert(colToInsert);
      if (colError) throw new Error(`Failed to add product to collections: ${colError.message}`);
    }

    return newProduct;
  }

  /**
   * Update an existing product.
   */
  static async updateProduct(
    id: string,
    product: Partial<ProductInput>,
    images: ProductImageInput[],
    variants: VariantInput[],
    collectionIds: string[] = []
  ) {
    const supabase = await createClient();

    // 1. Update product main fields
    const { error: prodError } = await supabase
      .from("products")
      .update(product)
      .eq("id", id);

    if (prodError) {
      throw new Error(`Failed to update product: ${prodError.message}`);
    }

    // 2. Sync images (Delete existing and insert new)
    const { error: delImgError } = await supabase.from("product_images").delete().eq("product_id", id);
    if (delImgError) throw new Error(`Failed to clean old images: ${delImgError.message}`);

    if (images.length > 0) {
      const imagesToInsert = images.map((img) => ({
        product_id: id,
        image_url: img.image_url,
        alt_text: img.alt_text || product.name,
        sort_order: img.sort_order,
      }));
      const { error: imgError } = await supabase.from("product_images").insert(imagesToInsert);
      if (imgError) throw new Error(`Failed to update product images: ${imgError.message}`);
    }

    // 3. Sync variants (Delete existing and insert new)
    const { error: delVarError } = await supabase.from("product_variants").delete().eq("product_id", id);
    if (delVarError) throw new Error(`Failed to clean old variants: ${delVarError.message}`);

    if (variants.length > 0) {
      const variantsToInsert = variants.map((v) => ({
        product_id: id,
        name: v.name,
        price: v.price,
        sale_price: v.sale_price,
        stock: v.stock,
        sku: v.sku || `${product.sku || 'VAR'}-${v.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
        image_url: v.image_url,
        option_values: v.option_values || {},
      }));
      const { error: varError } = await supabase.from("product_variants").insert(variantsToInsert);
      if (varError) throw new Error(`Failed to update product variants: ${varError.message}`);
    }

    // 4. Sync collections
    const { error: delColError } = await supabase.from("product_collections").delete().eq("product_id", id);
    if (delColError) throw new Error(`Failed to clean old collections: ${delColError.message}`);

    if (collectionIds.length > 0) {
      const colToInsert = collectionIds.map((colId) => ({
        product_id: id,
        collection_id: colId,
      }));
      const { error: colError } = await supabase.from("product_collections").insert(colToInsert);
      if (colError) throw new Error(`Failed to update product collections: ${colError.message}`);
    }

    return true;
  }

  /**
   * Soft-delete a product.
   */
  static async softDeleteProduct(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
    return true;
  }

  /**
   * Restore a soft-deleted product.
   */
  static async restoreProduct(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: null })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to restore product: ${error.message}`);
    }
    return true;
  }

  /**
   * Bulk update status for multiple products.
   */
  static async bulkUpdateStatus(ids: string[], status: "draft" | "published" | "archived") {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ status })
      .in("id", ids);

    if (error) {
      throw new Error(`Failed bulk status update: ${error.message}`);
    }
    return true;
  }

  /**
   * Bulk soft delete.
   */
  static async bulkDelete(ids: string[]) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      throw new Error(`Failed bulk delete: ${error.message}`);
    }
    return true;
  }

  /**
   * Parse a CSV file and bulk create products.
   */
  static async importProductsFromCsv(csvText: string): Promise<number> {
    const lines = csvText.split(/\r?\n/);
    if (lines.length <= 1) return 0;

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const productsToInsert: ProductInput[] = [];

    // Simple CSV parser
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse values respecting quotes (basic regex)
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
      const values = matches.map((val) => val.trim().replace(/^["']|["']$/g, ""));

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      if (!row.name || !row.price) continue;

      const slug = row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      productsToInsert.push({
        name: row.name,
        slug,
        description: row.description || "",
        price: parseFloat(row.price),
        sale_price: row.sale_price ? parseFloat(row.sale_price) : null,
        sku: row.sku || null,
        stock: row.stock ? parseInt(row.stock, 10) : 0,
        low_stock_threshold: row.low_stock_threshold ? parseInt(row.low_stock_threshold, 10) : 5,
        status: (row.status as any) || "draft",
        tags: row.tags ? row.tags.split(";").map((t: string) => t.trim()) : [],
        weight: row.weight ? parseFloat(row.weight) : null,
        dimensions: row.dimensions || null,
        material: row.material || null,
        care_instructions: row.care_instructions || null,
        availability: row.availability !== "false",
        featured: row.featured === "true",
        bestseller: row.bestseller === "true",
        new_arrival: row.new_arrival === "true",
        seo_title: row.seo_title || row.name,
        seo_description: row.seo_description || "",
      });
    }

    if (productsToInsert.length === 0) return 0;

    const supabase = await createClient();
    const { data, error } = await supabase.from("products").insert(productsToInsert).select();

    if (error) {
      throw new Error(`CSV Import failed: ${error.message}`);
    }

    return data ? data.length : 0;
  }

  /**
   * Fetch all categories.
   */
  static async getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
    return data || [];
  }

  /**
   * Fetch all collections.
   */
  static async getCollections() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch collections: ${error.message}`);
    }
    return data || [];
  }
}
