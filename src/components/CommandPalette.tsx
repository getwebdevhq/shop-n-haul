"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, FileText, ArrowRight, CornerDownLeft } from "lucide-react";

interface MenuItem {
  name: string;
  category: "Navigation" | "Products" | "Orders";
  href: string;
}

const STATIC_NAV: MenuItem[] = [
  { name: "Dashboard Home", category: "Navigation", href: "/admin" },
  { name: "Manage Products", category: "Navigation", href: "/admin/products" },
  { name: "Manage Categories & Collections", category: "Navigation", href: "/admin/categories" },
  { name: "Manage Orders", category: "Navigation", href: "/admin/orders" },
  { name: "Media Library", category: "Navigation", href: "/admin/media" },
  { name: "Homepage CMS", category: "Navigation", href: "/admin/homepage" },
  { name: "General Settings & Integrations", category: "Navigation", href: "/admin/settings" },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MenuItem[]>(STATIC_NAV);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Toggle palette on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Listen for click on the header search trigger
    const trigger = document.getElementById("cmd-palette-trigger");
    const handleTriggerClick = (e: MouseEvent) => {
      e.preventDefault();
      setIsOpen(true);
    };
    trigger?.addEventListener("click", handleTriggerClick as any);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      trigger?.removeEventListener("click", handleTriggerClick as any);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
      setResults(STATIC_NAV);
    }
  }, [isOpen]);

  // Handle dynamic search
  useEffect(() => {
    if (!query) {
      setResults(STATIC_NAV);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      const filteredNav = STATIC_NAV.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );

      try {
        // Search products in DB
        const { data: dbProducts } = await supabase
          .from("products")
          .select("id, name, slug")
          .ilike("name", `%${query}%`)
          .is("deleted_at", null)
          .limit(3);

        const productItems: MenuItem[] = (dbProducts || []).map((p) => ({
          name: p.name,
          category: "Products",
          href: `/admin/products?edit=${p.id}`,
        }));

        // Search orders in DB
        const { data: dbOrders } = await supabase
          .from("orders")
          .select("id, customer_details")
          .or(`id.eq.${query},customer_details->>name.ilike.%${query}%`)
          .limit(3);

        const orderItems: MenuItem[] = (dbOrders || []).map((o) => ({
          name: `Order #${o.id.slice(0, 8)} - ${(o.customer_details as any).name}`,
          category: "Orders",
          href: `/admin/orders?view=${o.id}`,
        }));

        setResults([...filteredNav, ...productItems, ...orderItems]);
      } catch (err) {
        console.error("Error in command palette search:", err);
      }
    }, 150);

    return () => clearTimeout(delayDebounce);
  }, [query, supabase]);

  // Navigate on enter
  const handleSelect = (item: MenuItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) setIsOpen(false);
      }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-start justify-center pt-24 px-4"
    >
      <div className="bg-[#161616] border border-stone/10 w-full max-w-2xl rounded-none shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-stone/10">
          <Search className="w-5 h-5 text-gold" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search products, or order IDs..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm text-ivory placeholder-stone/40"
          />
          <span className="text-[10px] bg-stone/5 px-2 py-1 border border-stone/20 text-stone/40">ESC</span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {results.length === 0 ? (
            <p className="text-center text-xs text-stone/40 py-8">No results found.</p>
          ) : (
            <div>
              {/* Grouped display */}
              {["Navigation", "Products", "Orders"].map((cat) => {
                const catItems = results.filter((item) => item.category === cat);
                if (catItems.length === 0) return null;
                
                return (
                  <div key={cat} className="mb-4 last:mb-0">
                    <h3 className="text-[9px] uppercase tracking-[0.25em] text-gold font-bold mb-2 px-3">
                      {cat}
                    </h3>
                    <div className="space-y-1">
                      {catItems.map((item) => {
                        const globalIndex = results.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={item.href + item.name}
                            onClick={() => handleSelect(item)}
                            className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected 
                                ? "bg-stone/10 text-ivory border-l-2 border-gold" 
                                : "text-stone/60 hover:bg-stone/5 hover:text-ivory"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <FileText className="w-3.5 h-3.5 text-stone/40" />
                              {item.name}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[9px] text-stone/40 uppercase">
                                Go <CornerDownLeft className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
