"use client";

import { useState } from "react";
import { 
  createCategoryAction, 
  updateCategoryAction, 
  deleteCategoryAction,
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction
} from "@/actions/categories";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Folder, Sparkles, Loader2, Check, X } from "lucide-react";

interface CategoryManagerProps {
  categories: any[];
  collections: any[];
}

export default function CategoryManager({ categories, collections }: CategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "collections">("categories");
  
  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [catForm, setCatForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    sort_order: 0,
  });

  const [colForm, setColForm] = useState({
    title: "",
    slug: "",
    description: "",
    banner_url: "",
    featured: false,
  });

  // Handle name/title change for automatic slugging
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    if (activeTab === "categories") {
      setCatForm((prev) => ({ ...prev, name, slug }));
    } else {
      setColForm((prev) => ({ ...prev, title: name, slug }));
    }
  };

  // Open modal for create
  const handleCreateOpen = () => {
    setEditingItem(null);
    if (activeTab === "categories") {
      setCatForm({ name: "", slug: "", description: "", image_url: "", sort_order: categories.length + 1 });
    } else {
      setColForm({ title: "", slug: "", description: "", banner_url: "", featured: false });
    }
    setIsOpen(true);
  };

  // Open modal for edit
  const handleEditOpen = (item: any) => {
    setEditingItem(item);
    if (activeTab === "categories") {
      setCatForm({
        name: item.name,
        slug: item.slug,
        description: item.description || "",
        image_url: item.image_url || "",
        sort_order: item.sort_order,
      });
    } else {
      setColForm({
        title: item.title,
        slug: item.slug,
        description: item.description || "",
        banner_url: item.banner_url || "",
        featured: item.featured,
      });
    }
    setIsOpen(true);
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Saving item...");

    try {
      let res;
      if (activeTab === "categories") {
        if (!catForm.name || !catForm.slug) {
          toast.error("Name and Slug are required", { id: toastId });
          setLoading(false);
          return;
        }
        if (editingItem) {
          res = await updateCategoryAction(editingItem.id, catForm);
        } else {
          res = await createCategoryAction(catForm);
        }
      } else {
        if (!colForm.title || !colForm.slug) {
          toast.error("Title and Slug are required", { id: toastId });
          setLoading(false);
          return;
        }
        if (editingItem) {
          res = await updateCollectionAction(editingItem.id, colForm);
        } else {
          res = await createCollectionAction(colForm);
        }
      }

      if (res.success) {
        toast.success(editingItem ? "Updated successfully" : "Created successfully", { id: toastId });
        setIsOpen(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Save failed", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    const itemName = activeTab === "categories" ? "category" : "collection";
    if (!confirm(`Are you sure you want to archive this ${itemName}?`)) return;

    const toastId = toast.loading(`Archiving ${itemName}...`);
    let res;
    if (activeTab === "categories") {
      res = await deleteCategoryAction(id);
    } else {
      res = await deleteCollectionAction(id);
    }

    if (res.success) {
      toast.success(`${activeTab === "categories" ? "Category" : "Collection"} archived successfully`, { id: toastId });
      window.location.reload();
    } else {
      toast.error(res.error || "Archive failed", { id: toastId });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl font-light tracking-wide">
            Categories & Collections
          </h1>
          <p className="text-stone/40 text-xs mt-1">
            Group products into taxonomy categories and marketing collections.
          </p>
        </div>

        <button
          onClick={handleCreateOpen}
          className="px-6 py-3.5 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] transition-colors duration-500 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === "categories" ? "Category" : "Collection"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone/10 pb-4">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-6 py-2.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer ${
            activeTab === "categories"
              ? "text-gold border-b-2 border-gold"
              : "text-stone/40 hover:text-ivory"
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className={`px-6 py-2.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer ${
            activeTab === "collections"
              ? "text-gold border-b-2 border-gold"
              : "text-stone/40 hover:text-ivory"
          }`}
        >
          Collections ({collections.length})
        </button>
      </div>

      {/* List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "categories" ? (
          categories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-stone/40 text-xs">
              No categories found.
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#161616] border border-stone/10 p-6 flex flex-col justify-between h-48"
              >
                <div className="flex gap-4">
                  {cat.image_url && (
                    <div className="w-12 h-16 relative bg-stone/20 shrink-0">
                      <img src={cat.image_url} alt={cat.name} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="font-medium text-stone/90">{cat.name}</h3>
                    <p className="text-[10px] text-stone/40 font-mono">slug: {cat.slug}</p>
                    <p className="text-[11px] text-stone/50 line-clamp-2">{cat.description || "No description."}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-stone/5 pt-4 mt-4">
                  <span className="text-[10px] text-stone/40">Sort Order: {cat.sort_order}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditOpen(cat)}
                      className="p-2 text-stone/40 hover:text-gold transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-stone/40 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          collections.length === 0 ? (
            <div className="col-span-full text-center py-12 text-stone/40 text-xs">
              No collections found.
            </div>
          ) : (
            collections.map((col) => (
              <div
                key={col.id}
                className="bg-[#161616] border border-stone/10 p-6 flex flex-col justify-between h-48"
              >
                <div className="flex gap-4">
                  {col.banner_url && (
                    <div className="w-12 h-16 relative bg-stone/20 shrink-0">
                      <img src={col.banner_url} alt={col.title} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-stone/90">{col.title}</h3>
                      {col.featured && (
                        <span className="px-1.5 py-0.5 bg-gold/10 text-gold text-[8px] font-semibold uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone/40 font-mono">slug: {col.slug}</p>
                    <p className="text-[11px] text-stone/50 line-clamp-2">{col.description || "No description."}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end border-t border-stone/5 pt-4 mt-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditOpen(col)}
                      className="p-2 text-stone/40 hover:text-gold transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(col.id)}
                      className="p-2 text-stone/40 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setIsOpen(false)} />

          <div className="bg-[#161616] border border-stone/10 w-full max-w-md p-8 rounded-none shadow-2xl relative z-10">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone/40 hover:text-gold transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-2xl font-light tracking-wide mb-6">
              {editingItem ? "Edit" : "Add"}{" "}
              {activeTab === "categories" ? "Category" : "Collection"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              {activeTab === "categories" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={catForm.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Necklaces"
                      className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={catForm.slug}
                      onChange={(e) => setCatForm((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g. necklaces"
                      className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Description
                    </label>
                    <textarea
                      value={catForm.description}
                      onChange={(e) => setCatForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter a brief description..."
                      rows={3}
                      className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={catForm.image_url}
                      onChange={(e) => setCatForm((prev) => ({ ...prev, image_url: e.target.value }))}
                      placeholder="e.g. /images/necklaces_close.png"
                      className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={catForm.sort_order}
                      onChange={(e) => setCatForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                      className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Collection Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={colForm.title}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Wedding Collection"
                      className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={colForm.slug}
                      onChange={(e) => setColForm((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g. wedding-collection"
                      className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Description
                    </label>
                    <textarea
                      value={colForm.description}
                      onChange={(e) => setColForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter a brief description..."
                      rows={3}
                      className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                      Banner Image URL
                    </label>
                    <input
                      type="text"
                      value={colForm.banner_url}
                      onChange={(e) => setColForm((prev) => ({ ...prev, banner_url: e.target.value }))}
                      placeholder="e.g. /images/hero_jewellery.png"
                      className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={colForm.featured}
                      onChange={(e) => setColForm((prev) => ({ ...prev, featured: e.target.checked }))}
                    />
                    <span className="text-[10px] uppercase tracking-wider text-stone/80">
                      Featured Collection (Show on Homepage)
                    </span>
                  </label>
                </>
              )}

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-[#1c1c1c] border border-stone/10 text-stone/60 hover:text-ivory text-xs font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-350 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
