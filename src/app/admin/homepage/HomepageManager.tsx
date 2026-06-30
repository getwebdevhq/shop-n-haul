"use client";

import { useState } from "react";
import { updateContentBlockAction } from "@/actions/homepage";
import { toast } from "sonner";
import { 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Eye,
  Loader2,
  HelpCircle,
  Instagram
} from "lucide-react";
import Image from "next/image";

interface HomepageManagerProps {
  initialBlocks: any[];
}

export default function HomepageManager({ initialBlocks }: HomepageManagerProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState(initialBlocks[0]?.id || "");
  const [loading, setLoading] = useState(false);

  // Find active block
  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  // Update field in active block's content JSON
  const handleFieldChange = (key: string, value: any) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === activeBlockId) {
          return {
            ...block,
            content: {
              ...block.content,
              [key]: value,
            },
          };
        }
        return block;
      })
    );
  };

  // Update title of active block
  const handleTitleChange = (title: string) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === activeBlockId) {
          return { ...block, title };
        }
        return block;
      })
    );
  };

  // Handle Testimonials list updates (specific to testimonials block type)
  const handleTestimonialChange = (idx: number, key: string, value: any) => {
    if (!activeBlock || activeBlock.type !== "testimonials") return;
    const list = [...(activeBlock.content || [])];
    list[idx] = { ...list[idx], [key]: value };
    
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === activeBlockId) {
          return { ...block, content: list };
        }
        return block;
      })
    );
  };

  const addTestimonial = () => {
    if (!activeBlock || activeBlock.type !== "testimonials") return;
    const list = [...(activeBlock.content || [])];
    list.push({
      name: "New Muse",
      role: "Collector",
      content: "Enter feedback here.",
      rating: 5,
    });
    
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === activeBlockId) {
          return { ...block, content: list };
        }
        return block;
      })
    );
  };

  const removeTestimonial = (idx: number) => {
    if (!activeBlock || activeBlock.type !== "testimonials") return;
    const list = (activeBlock.content || []).filter((_: any, i: number) => i !== idx);
    
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === activeBlockId) {
          return { ...block, content: list };
        }
        return block;
      })
    );
  };

  // Save Block Changes to DB
  const handleSaveBlock = async () => {
    if (!activeBlock) return;
    setLoading(true);
    const toastId = toast.loading(`Saving ${activeBlock.title}...`);

    try {
      const res = await updateContentBlockAction(activeBlock.id, {
        title: activeBlock.title,
        content: activeBlock.content,
      });

      if (res.success) {
        toast.success("Homepage section saved successfully!", { id: toastId });
      } else {
        toast.error(res.error || "Failed to save changes", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-light tracking-wide">Homepage CMS</h1>
        <p className="text-stone/40 text-xs mt-1">
          Configure visual content blocks and see branding updates in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sidebar & Form Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section Selector */}
          <div className="bg-[#161616] border border-stone/10 p-4">
            <label className="text-[10px] uppercase tracking-wider text-stone/40 font-bold block mb-2">
              Select Page Section
            </label>
            <select
              value={activeBlockId}
              onChange={(e) => setActiveBlockId(e.target.value)}
              className="w-full bg-charcoal border border-stone/20 px-3 py-2 text-xs text-stone/85 focus:outline-none focus:border-gold"
            >
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.title} ({block.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Active Block Form */}
          {activeBlock && (
            <div className="bg-[#161616] border border-stone/10 p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-stone/10 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-light tracking-wide">
                    Edit {activeBlock.title}
                  </h2>
                  <p className="text-[9px] text-stone/40 uppercase tracking-widest mt-0.5">
                    Type: {activeBlock.type}
                  </p>
                </div>
                <button
                  onClick={handleSaveBlock}
                  disabled={loading}
                  className="px-4 py-2 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Section
                </button>
              </div>

              {/* DYNAMIC FORM FIELDS */}
              <div className="space-y-6">
                {/* Block Title */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                    Section Display Title
                  </label>
                  <input
                    type="text"
                    value={activeBlock.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                  />
                </div>

                {/* HERO BLOCK FIELDS */}
                {activeBlock.type === "hero" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={activeBlock.content.subtitle || ""}
                        onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                        Background Image URL
                      </label>
                      <input
                        type="text"
                        value={activeBlock.content.image_url || ""}
                        onChange={(e) => handleFieldChange("image_url", e.target.value)}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={activeBlock.content.button_text || ""}
                          onChange={(e) => handleFieldChange("button_text", e.target.value)}
                          className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                          Button Link
                        </label>
                        <input
                          type="text"
                          value={activeBlock.content.button_link || ""}
                          onChange={(e) => handleFieldChange("button_link", e.target.value)}
                          className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* EDITORIAL BANNER FIELDS */}
                {activeBlock.type === "banner" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={activeBlock.content.subtitle || ""}
                        onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={activeBlock.content.image_url || ""}
                        onChange={(e) => handleFieldChange("image_url", e.target.value)}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                        Description
                      </label>
                      <textarea
                        value={activeBlock.content.description || ""}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        rows={4}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={activeBlock.content.button_text || ""}
                          onChange={(e) => handleFieldChange("button_text", e.target.value)}
                          className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                          Button Link
                        </label>
                        <input
                          type="text"
                          value={activeBlock.content.button_link || ""}
                          onChange={(e) => handleFieldChange("button_link", e.target.value)}
                          className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* TESTIMONIALS FIELDS */}
                {activeBlock.type === "testimonials" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-stone/20 pb-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone/40 font-semibold">
                        Reviews List
                      </span>
                      <button
                        type="button"
                        onClick={addTestimonial}
                        className="text-[9px] uppercase tracking-wider text-gold hover:text-ivory transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Review
                      </button>
                    </div>

                    <div className="space-y-4">
                      {((activeBlock.content as any[]) || []).map((t, idx) => (
                        <div key={idx} className="bg-charcoal border border-stone/20 p-4 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => removeTestimonial(idx)}
                            className="absolute top-2 right-2 text-stone/40 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[8px] uppercase tracking-wider text-stone/45">Name</label>
                              <input
                                type="text"
                                value={t.name}
                                onChange={(e) => handleTestimonialChange(idx, "name", e.target.value)}
                                className="w-full bg-[#161616] border border-stone/15 px-2 py-1 text-xs text-ivory"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] uppercase tracking-wider text-stone/45">Role</label>
                              <input
                                type="text"
                                value={t.role}
                                onChange={(e) => handleTestimonialChange(idx, "role", e.target.value)}
                                className="w-full bg-[#161616] border border-stone/15 px-2 py-1 text-xs text-ivory"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-wider text-stone/45">Feedback</label>
                            <textarea
                              value={t.content}
                              onChange={(e) => handleTestimonialChange(idx, "content", e.target.value)}
                              rows={2}
                              className="w-full bg-[#161616] border border-stone/15 px-2 py-1 text-xs text-ivory resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NEWSLETTER FIELDS */}
                {activeBlock.type === "newsletter" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                        Heading
                      </label>
                      <input
                        type="text"
                        value={activeBlock.content.heading || ""}
                        onChange={(e) => handleFieldChange("heading", e.target.value)}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] text-stone/75 font-medium block">
                        Description
                      </label>
                      <textarea
                        value={activeBlock.content.description || ""}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        rows={3}
                        className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none resize-none"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live View Mockup (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-stone/40 text-xs px-2">
            <Eye className="w-4 h-4" />
            <span className="uppercase tracking-widest text-[10px]">Live Storefront Preview</span>
          </div>

          <div className="border border-stone/10 bg-charcoal w-full h-[600px] flex flex-col overflow-hidden relative select-none">
            {/* Browser frame header */}
            <div className="bg-[#191919] px-4 py-3 border-b border-stone/10 flex items-center gap-2 shrink-0">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-stone/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-stone/20" />
              </div>
              <div className="mx-auto bg-[#111111] border border-stone/15 text-[10px] text-stone/50 px-10 py-1 max-w-sm w-full text-center truncate font-mono">
                localhost:3000
              </div>
            </div>

            {/* Scrollable preview viewport */}
            <div className="flex-grow overflow-y-auto bg-ivory text-charcoal flex flex-col">
              {activeBlock && (
                <>
                  {/* PREVIEW HERO */}
                  {activeBlock.type === "hero" && (
                    <div className="relative h-96 w-full flex items-center justify-center bg-charcoal text-center p-8 overflow-hidden">
                      {activeBlock.content.image_url && (
                        <div className="absolute inset-0 opacity-80">
                          <img
                            src={activeBlock.content.image_url}
                            alt="Hero Preview"
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black/30" />
                        </div>
                      )}
                      <div className="relative z-10 space-y-4 max-w-md">
                        <p className="text-stone/90 text-[8px] tracking-[0.4em] uppercase">
                          {activeBlock.content.subtitle || "Subheading"}
                        </p>
                        <h1 className="font-display text-4xl font-bold text-ivory tracking-wide leading-tight">
                          {activeBlock.title || "TIMELESS JEWELLERY"}
                        </h1>
                        <button className="px-6 py-2.5 bg-ivory text-charcoal hover:bg-gold text-[9px] uppercase tracking-widest font-semibold mt-4">
                          {activeBlock.content.button_text || "Shop"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PREVIEW EDITORIAL BANNER */}
                  {activeBlock.type === "banner" && (
                    <div className="py-16 px-8 max-w-3xl mx-auto">
                      <div className="grid grid-cols-2 gap-8 items-center">
                        <div className="space-y-4 text-left">
                          <span className="text-[9px] tracking-widest uppercase text-gold font-bold">
                            {activeBlock.content.subtitle || "Featured"}
                          </span>
                          <h2 className="font-display text-3xl font-light tracking-wide leading-snug">
                            {activeBlock.title || "Designed to be worn every day."}
                          </h2>
                          <p className="text-charcoal/70 text-xs leading-relaxed">
                            {activeBlock.content.description || "Minimal everyday jewelry."}
                          </p>
                          <button className="px-6 py-3 bg-charcoal text-ivory text-[9px] uppercase tracking-widest font-semibold mt-2">
                            {activeBlock.content.button_text || "Explore"}
                          </button>
                        </div>
                        {activeBlock.content.image_url && (
                          <div className="relative aspect-[3/4] bg-stone/20 overflow-hidden">
                            <img src={activeBlock.content.image_url} alt="Banner" className="object-cover w-full h-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PREVIEW TESTIMONIALS */}
                  {activeBlock.type === "testimonials" && (
                    <div className="py-16 bg-stone/10 border-t border-b border-stone/25 text-center px-8">
                      <span className="text-[9px] tracking-widest uppercase text-gold font-bold mb-3 block">
                        Community Reviews
                      </span>
                      <h2 className="font-display text-3xl font-medium tracking-wide mb-8">
                        {activeBlock.title || "Worn By Real Muses"}
                      </h2>
                      
                      <div className="grid grid-cols-3 gap-6">
                        {((activeBlock.content as any[]) || []).map((t, idx) => (
                          <div key={idx} className="bg-ivory border border-stone/15 p-5 text-left space-y-3">
                            <div className="flex gap-0.5 text-gold text-sm">
                              {"★".repeat(t.rating)}
                            </div>
                            <p className="text-[11px] text-charcoal/75 leading-relaxed italic">
                              &ldquo;{t.content}&rdquo;
                            </p>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider font-semibold">{t.name}</p>
                              <span className="text-[8px] text-stone/50 uppercase tracking-widest">{t.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PREVIEW NEWSLETTER */}
                  {activeBlock.type === "newsletter" && (
                    <div className="py-16 bg-[#161616] text-ivory text-center px-8">
                      <div className="max-w-md mx-auto space-y-4">
                        <h2 className="font-display text-3xl font-light tracking-wide text-gold">
                          {activeBlock.content.heading || "Join the Club"}
                        </h2>
                        <p className="text-stone/40 text-xs leading-relaxed max-w-sm mx-auto">
                          {activeBlock.content.description || "Subscribe for early updates."}
                        </p>
                        <div className="flex gap-2 max-w-xs mx-auto pt-2">
                          <input
                            disabled
                            type="email"
                            placeholder="Enter your email"
                            className="bg-charcoal border border-stone/25 px-3 py-2 text-xs text-ivory flex-grow"
                          />
                          <button className="px-4 py-2 bg-gold text-charcoal text-[9px] uppercase tracking-wider font-semibold">
                            Subscribe
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
