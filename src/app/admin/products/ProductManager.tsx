"use client";

import { useState, useEffect, useRef } from "react";
import { 
  createProductAction, 
  updateProductAction, 
  deleteProductAction, 
  bulkUpdateProductStatusAction, 
  bulkDeleteProductsAction,
  importProductsAction
} from "@/actions/products";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  PlusCircle, 
  MinusCircle, 
  Check, 
  X,
  Sparkles,
  Loader2
} from "lucide-react";
import Fuse from "fuse.js";
import RichTextEditor from "@/components/RichTextEditor";

interface ProductManagerProps {
  initialProducts: any[];
  categories: any[];
  collections: any[];
}

export default function ProductManager({ initialProducts, categories, collections }: ProductManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filters and Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  
  // Modal / Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    sale_price: "",
    sku: "",
    stock: 0,
    low_stock_threshold: 5,
    category_id: "",
    status: "draft" as "draft" | "published" | "archived",
    tags: "",
    weight: "",
    dimensions: "",
    material: "",
    care_instructions: "",
    availability: true,
    featured: false,
    bestseller: false,
    new_arrival: false,
    seo_title: "",
    seo_description: "",
  });

  // Images state
  const [images, setImages] = useState<string[]>([""]);

  // Variants Builder state
  const [variantOptions, setVariantOptions] = useState<{ name: string; values: string }[]>([]);
  const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);

  // CSV Import
  const csvInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fuse.js fuzzy search setup
  useEffect(() => {
    let result = products;

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category_id === categoryFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchQuery) {
      const fuse = new Fuse(result, {
        keys: ["name", "sku", "tags"],
        threshold: 0.3,
      });
      result = fuse.search(searchQuery).map((res) => res.item);
    }

    setFilteredProducts(result);
  }, [searchQuery, categoryFilter, statusFilter, products]);

  // Keyboard Shortcuts: '/' to focus search, 'Esc' to clear, 'Ctrl+S' to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current && !isDrawerOpen) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "s" && (e.ctrlKey || e.metaKey) && isDrawerOpen) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, formData, images, generatedVariants]);

  // Sync slug on name change
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  // Open Drawer for Create
  const handleCreateOpen = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 0,
      sale_price: "",
      sku: "",
      stock: 0,
      low_stock_threshold: 5,
      category_id: categories[0]?.id || "",
      status: "draft",
      tags: "",
      weight: "",
      dimensions: "",
      material: "",
      care_instructions: "",
      availability: true,
      featured: false,
      bestseller: false,
      new_arrival: false,
      seo_title: "",
      seo_description: "",
    });
    setImages([""]);
    setVariantOptions([]);
    setGeneratedVariants([]);
    setIsDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleEditOpen = async (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: Number(product.price),
      sale_price: product.sale_price ? String(product.sale_price) : "",
      sku: product.sku || "",
      stock: product.stock,
      low_stock_threshold: product.low_stock_threshold,
      category_id: product.category_id || "",
      status: product.status,
      tags: product.tags ? product.tags.join(", ") : "",
      weight: product.weight ? String(product.weight) : "",
      dimensions: product.dimensions || "",
      material: product.material || "",
      care_instructions: product.care_instructions || "",
      availability: product.availability,
      featured: product.featured,
      bestseller: product.bestseller,
      new_arrival: product.new_arrival,
      seo_title: product.seo_title || "",
      seo_description: product.seo_description || "",
    });
    
    // Set images
    const prodImages = product.product_images || [];
    setImages(prodImages.length > 0 ? prodImages.map((img: any) => img.image_url) : [""]);

    // Set variants
    const prodVariants = product.product_variants || [];
    setGeneratedVariants(prodVariants.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      sale_price: v.sale_price ? String(v.sale_price) : "",
      stock: v.stock,
      sku: v.sku || "",
      option_values: v.option_values || {},
    })));

    setIsDrawerOpen(true);
  };

  // Save Product (Create or Edit)
  const handleSave = async () => {
    if (!formData.name || !formData.slug || formData.price <= 0) {
      toast.error("Please fill in all required fields (Name, Slug, Price)");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving product...");

    try {
      const parsedTags = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
        
      const productInput: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        sku: formData.sku || null,
        stock: formData.stock,
        low_stock_threshold: formData.low_stock_threshold,
        category_id: formData.category_id || null,
        status: formData.status,
        tags: parsedTags,
        weight: formData.weight ? Number(formData.weight) : null,
        dimensions: formData.dimensions || null,
        material: formData.material || null,
        care_instructions: formData.care_instructions || null,
        availability: formData.availability,
        featured: formData.featured,
        bestseller: formData.bestseller,
        new_arrival: formData.new_arrival,
        seo_title: formData.seo_title || formData.name,
        seo_description: formData.seo_description || "",
      };

      const imagesInput = images
        .filter(Boolean)
        .map((url, idx) => ({
          image_url: url,
          alt_text: formData.name,
          sort_order: idx,
        }));

      const variantsInput = generatedVariants.map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        sale_price: v.sale_price ? Number(v.sale_price) : null,
        stock: v.stock,
        sku: v.sku || null,
        option_values: v.option_values,
      }));

      // Find selected collections (link if they match tags or custom)
      const selectedCollections = collections
        .filter((col) => parsedTags.some((tag) => tag.toLowerCase() === col.title.toLowerCase()))
        .map((col) => col.id);

      let res;
      if (editingProduct) {
        res = await updateProductAction(editingProduct.id, productInput, imagesInput, variantsInput, selectedCollections);
      } else {
        res = await createProductAction(productInput, imagesInput, variantsInput, selectedCollections);
      }

      if (res.success) {
        toast.success(editingProduct ? "Product updated successfully" : "Product created successfully", { id: toastId });
        setIsDrawerOpen(false);
        // Reload products (normally Server Component handles this but since we are client, we update local state)
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to save product", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Soft delete a single product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to archive this product?")) return;

    const toastId = toast.loading("Archiving product...");
    const res = await deleteProductAction(id);
    if (res.success) {
      toast.success("Product archived successfully", { id: toastId });
      window.location.reload();
    } else {
      toast.error(res.error || "Archiving failed", { id: toastId });
    }
  };

  // Bulk actions
  const handleBulkStatus = async (status: "draft" | "published" | "archived") => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(`Updating ${selectedIds.length} products...`);
    const res = await bulkUpdateProductStatusAction(selectedIds, status);
    if (res.success) {
      toast.success("Products updated successfully", { id: toastId });
      setSelectedIds([]);
      window.location.reload();
    } else {
      toast.error(res.error || "Bulk update failed", { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to archive ${selectedIds.length} products?`)) return;
    
    const toastId = toast.loading(`Archiving ${selectedIds.length} products...`);
    const res = await bulkDeleteProductsAction(selectedIds);
    if (res.success) {
      toast.success("Products archived successfully", { id: toastId });
      setSelectedIds([]);
      window.location.reload();
    } else {
      toast.error(res.error || "Bulk archive failed", { id: toastId });
    }
  };

  // CSV Import
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const toastId = toast.loading("Importing CSV products...");
      const res = await importProductsAction(text);
      if (res.success) {
        toast.success(`Successfully imported ${res.count} products!`, { id: toastId });
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to import CSV", { id: toastId });
      }
    };
    reader.readAsText(file);
  };

  // Variant generator logic
  const addVariantOption = () => {
    setVariantOptions((prev) => [...prev, { name: "", values: "" }]);
  };

  const removeVariantOption = (idx: number) => {
    setVariantOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateVariantOption = (idx: number, field: "name" | "values", val: string) => {
    setVariantOptions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const generateVariants = () => {
    const filledOptions = variantOptions.filter((opt) => opt.name && opt.values);
    if (filledOptions.length === 0) {
      toast.error("Please add option names and comma-separated values first.");
      return;
    }

    const optionsList = filledOptions.map((opt) => {
      const values = opt.values.split(",").map((v) => v.trim()).filter(Boolean);
      return { name: opt.name, values };
    });

    // Cartesian product helper
    const cartesian = (lists: any[][]) => {
      return lists.reduce(
        (a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())),
        [[]]
      );
    };

    const combinations = cartesian(optionsList.map((o) => o.values));

    const newVariants = combinations.map((combo) => {
      const optionValues: Record<string, string> = {};
      optionsList.forEach((opt, idx) => {
        optionValues[opt.name] = combo[idx];
      });

      const variantName = Object.entries(optionValues)
        .map(([k, v]) => v)
        .join(" / ");

      return {
        name: variantName,
        price: formData.price,
        sale_price: "",
        stock: 0,
        sku: `${formData.sku || "VAR"}-${variantName.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
        option_values: optionValues,
      };
    });

    setGeneratedVariants(newVariants);
    toast.success(`Generated ${newVariants.length} variants!`);
  };

  // Format currencies
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl font-light tracking-wide">Products</h1>
          <p className="text-stone/40 text-xs mt-1">Manage catalog details, inventory levels, and SEO tags.</p>
        </div>

        <div className="flex gap-4">
          {/* CSV Import */}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            className="hidden"
          />
          <button
            onClick={() => csvInputRef.current?.click()}
            className="px-4 py-3 bg-[#1c1c1c] border border-stone/10 hover:border-gold text-stone/80 hover:text-gold text-xs font-semibold uppercase tracking-[0.15em] flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>

          <button
            onClick={handleCreateOpen}
            className="px-6 py-3.5 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#161616] p-4 border border-stone/10">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products (press '/' to focus)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-charcoal border border-stone/10 pl-10 pr-4 py-2.5 text-xs text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-charcoal border border-stone/10 px-4 py-2.5 text-xs text-stone/85 focus:outline-none focus:border-gold"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-charcoal border border-stone/10 px-4 py-2.5 text-xs text-stone/85 focus:outline-none focus:border-gold"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Bulk actions panel */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-gold/10 border border-gold/25 p-4 text-xs">
          <span className="text-gold font-semibold tracking-wider uppercase">
            {selectedIds.length} Products Selected
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBulkStatus("published")}
              className="px-3 py-1.5 bg-[#161616] text-ivory hover:text-gold border border-stone/10 text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkStatus("draft")}
              className="px-3 py-1.5 bg-[#161616] text-ivory hover:text-gold border border-stone/10 text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              Draft
            </button>
            <button
              onClick={() => handleBulkStatus("archived")}
              className="px-3 py-1.5 bg-[#161616] text-ivory hover:text-gold border border-stone/10 text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              Archive
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-950 text-red-200 hover:bg-red-900 border border-red-850 text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Product List Table */}
      <div className="bg-[#161616] border border-stone/10 rounded-none overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone/10 text-stone/40 text-[9px] uppercase tracking-[0.2em] font-bold">
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(filteredProducts.map((p) => p.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
              <th className="p-4">Product Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tags</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone/5">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-xs text-stone/40">
                  No products found. Add a product or import a CSV.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.low_stock_threshold;
                const isOutOfStock = product.stock === 0;

                return (
                  <tr key={product.id} className="text-xs hover:bg-stone/5 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, product.id]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== product.id));
                          }
                        }}
                      />
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      {product.product_images?.[0]?.image_url && (
                        <div className="w-10 h-10 relative bg-stone/20">
                          <img
                            src={product.product_images[0].image_url}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone/85">{product.name}</p>
                        <span className="text-[9px] text-stone/40 uppercase tracking-wider">
                          {product.categories?.name || "No Category"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-stone/50">{product.sku || "N/A"}</td>
                    <td className="p-4">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 bg-red-950 text-red-200 text-[9px] font-semibold uppercase tracking-wider">
                          Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 bg-orange-950 text-orange-200 text-[9px] font-semibold uppercase tracking-wider">
                          Low Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="text-stone/75">{product.stock} in stock</span>
                      )}
                    </td>
                    <td className="p-4">{formatCurrency(product.price)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-semibold ${
                          product.status === "published"
                            ? "bg-sage/10 text-sage"
                            : product.status === "draft"
                            ? "bg-gold/10 text-gold"
                            : "bg-stone/10 text-stone"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {product.tags?.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="px-1.5 py-0.5 bg-stone/10 text-stone/45 text-[8px]">
                            {tag}
                          </span>
                        ))}
                        {product.tags?.length > 2 && (
                          <span className="text-[8px] text-stone/40">+{product.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditOpen(product)}
                        className="p-2 bg-stone/5 hover:bg-stone/10 text-stone/60 hover:text-gold transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-stone/5 hover:bg-stone/10 text-stone/60 hover:text-red-400 transition-colors cursor-pointer"
                        title="Archive Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Drawer (Slide-Over) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity" onClick={() => setIsDrawerOpen(false)} />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-3xl bg-[#161616] border-l border-stone/10 flex flex-col justify-between shadow-2xl">
              
              {/* Drawer Header */}
              <div className="px-8 py-6 border-b border-stone/10 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-light tracking-wide">
                    {editingProduct ? "Edit Product" : "New Product"}
                  </h2>
                  <p className="text-[10px] text-stone/40 uppercase tracking-widest mt-1">
                    {editingProduct ? `ID: ${editingProduct.id.slice(0, 8)}` : "Create white-label luxury listing"}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-stone/40 hover:text-gold transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Body (Scrollable Form) */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                
                {/* Section 1: General Info */}
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-semibold border-b border-stone/10 pb-2">
                    General Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Aura Gold Pendant"
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="e.g. aura-gold-pendant"
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                        placeholder="e.g. NL-AUR-GLD"
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Description (Rich Text)
                    </label>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
                    />
                  </div>
                </div>

                {/* Section 2: Pricing & Inventory */}
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-semibold border-b border-stone/10 pb-2">
                    Pricing & Inventory
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Base Price (INR) *
                      </label>
                      <input
                        type="number"
                        value={formData.price || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="8500"
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Sale Price (INR)
                      </label>
                      <input
                        type="number"
                        value={formData.sale_price}
                        onChange={(e) => setFormData((prev) => ({ ...prev, sale_price: e.target.value }))}
                        placeholder="7500"
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Low Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        value={formData.low_stock_threshold}
                        onChange={(e) => setFormData((prev) => ({ ...prev, low_stock_threshold: Number(e.target.value) }))}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Organization & Details */}
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-semibold border-b border-stone/10 pb-2">
                    Organization & Attributes
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Category
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-stone/85 focus:outline-none focus:border-gold"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-stone/85 focus:outline-none focus:border-gold"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                        placeholder="Minimal, Gold, Best Seller, Collection Title"
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Material
                      </label>
                      <input
                        type="text"
                        value={formData.material}
                        onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
                        placeholder="18ct Gold Vermeil"
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        value={formData.dimensions}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dimensions: e.target.value }))}
                        placeholder="45cm chain, 1.2cm pendant"
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                      />
                      <span className="text-[10px] uppercase tracking-wider text-stone/80">Featured</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.bestseller}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bestseller: e.target.checked }))}
                      />
                      <span className="text-[10px] uppercase tracking-wider text-stone/80">Bestseller</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.new_arrival}
                        onChange={(e) => setFormData((prev) => ({ ...prev, new_arrival: e.target.checked }))}
                      />
                      <span className="text-[10px] uppercase tracking-wider text-stone/80">New Arrival</span>
                    </label>
                  </div>
                </div>

                {/* Section 4: Images */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-stone/10 pb-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
                      Product Images
                    </h3>
                    <button
                      type="button"
                      onClick={() => setImages((prev) => [...prev, ""])}
                      className="text-[10px] uppercase tracking-wider text-gold hover:text-ivory transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Image URL
                    </button>
                  </div>

                  <div className="space-y-4">
                    {images.map((url, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) =>
                            setImages((prev) => prev.map((img, i) => (i === idx ? e.target.value : img)))
                          }
                          placeholder="Paste image URL (e.g. /images/necklaces_close.png or CDN url)"
                          className="flex-1 bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                        />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-3 bg-stone/5 hover:bg-red-950 text-stone/40 hover:text-red-200 border border-stone/15 cursor-pointer"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: Variants Builder */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-stone/10 pb-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
                      Product Variants
                    </h3>
                    <button
                      type="button"
                      onClick={addVariantOption}
                      className="text-[10px] uppercase tracking-wider text-gold hover:text-ivory transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Option
                    </button>
                  </div>

                  {/* Option inputs */}
                  {variantOptions.map((opt, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 items-end bg-stone/5 p-4 border border-stone/10">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-stone/50">Option Name</label>
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => updateVariantOption(idx, "name", e.target.value)}
                          placeholder="e.g. Size or Metal"
                          className="w-full bg-charcoal border border-stone/20 px-3 py-2 text-xs text-ivory focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2 col-span-2 flex gap-3 items-center">
                        <div className="flex-1 space-y-2">
                          <label className="text-[9px] uppercase tracking-wider text-stone/50">Values (comma separated)</label>
                          <input
                            type="text"
                            value={opt.values}
                            onChange={(e) => updateVariantOption(idx, "values", e.target.value)}
                            placeholder="e.g. 6, 7, 8"
                            className="w-full bg-charcoal border border-stone/20 px-3 py-2 text-xs text-ivory focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariantOption(idx)}
                          className="p-2 text-stone/40 hover:text-red-400 mt-6"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {variantOptions.length > 0 && (
                    <button
                      type="button"
                      onClick={generateVariants}
                      className="w-full py-2.5 bg-stone/10 border border-stone/20 text-gold hover:bg-gold hover:text-charcoal text-[10px] uppercase tracking-wider font-semibold cursor-pointer transition-colors"
                    >
                      Generate Variants Matrix
                    </button>
                  )}

                  {/* Variants rows */}
                  {generatedVariants.length > 0 && (
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Variants Options Grid
                      </label>
                      
                      <div className="space-y-3">
                        {generatedVariants.map((v, idx) => (
                          <div key={idx} className="grid grid-cols-4 gap-4 p-4 bg-charcoal border border-stone/10 text-xs items-center">
                            <div className="col-span-1">
                              <span className="font-semibold text-stone/80">{v.name}</span>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] uppercase tracking-wider text-stone/40">Price (INR)</label>
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) =>
                                  setGeneratedVariants((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, price: Number(e.target.value) } : item))
                                  )
                                }
                                className="w-full bg-[#161616] border border-stone/15 px-2 py-1.5 text-xs text-ivory"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] uppercase tracking-wider text-stone/40">Stock</label>
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) =>
                                  setGeneratedVariants((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, stock: Number(e.target.value) } : item))
                                  )
                                }
                                className="w-full bg-[#161616] border border-stone/15 px-2 py-1.5 text-xs text-ivory"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] uppercase tracking-wider text-stone/40">SKU</label>
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) =>
                                  setGeneratedVariants((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, sku: e.target.value } : item))
                                  )
                                }
                                className="w-full bg-[#161616] border border-stone/15 px-2 py-1.5 text-xs text-ivory"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 6: SEO */}
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-semibold border-b border-stone/10 pb-2">
                    SEO Metadata
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.seo_title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value }))}
                        placeholder="e.g. Aura Gold Pendant - 18ct Gold Vermeil | Shop N Haul"
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                        Meta Description
                      </label>
                      <textarea
                        value={formData.seo_description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, seo_description: e.target.value }))}
                        placeholder="Enter a brief SEO description..."
                        rows={3}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold resize-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="px-8 py-6 border-t border-stone/10 bg-[#141414] flex gap-4 justify-end">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-6 py-3 bg-[#1c1c1c] border border-stone/10 text-stone/60 hover:text-ivory text-xs font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-350 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {loading ? "Saving..." : "Save Product (Ctrl+S)"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
