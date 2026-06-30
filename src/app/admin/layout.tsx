import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "sonner";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  Receipt, 
  Image as ImageIcon, 
  Home as HomeIcon, 
  Settings as SettingsIcon, 
  LogOut,
  Search,
  User
} from "lucide-react";
import AdminLogoutButton from "./AdminLogoutButton";
import CommandPalette from "@/components/CommandPalette";

export const metadata: Metadata = {
  title: "LuxeCommerce Admin Panel",
  description: "Manage your premium e-commerce store.",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let adminName = "Administrator";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (profile?.full_name) {
      adminName = profile.full_name;
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Orders", href: "/admin/orders", icon: Receipt },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "Homepage CMS", href: "/admin/homepage", icon: HomeIcon },
    { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-ivory flex font-sans">
      <Toaster position="top-right" theme="dark" />
      <CommandPalette />

      {/* Sidebar */}
      <aside className="w-64 bg-[#161616] border-r border-stone/10 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Brand Logo */}
          <div className="p-8 border-b border-stone/10">
            <Link href="/" className="font-display text-lg font-semibold tracking-[0.25em] text-ivory block">
              LUXECOMMERCE
            </Link>
            <span className="text-[9px] uppercase tracking-widest text-gold font-bold mt-1 block">
              Agency Starter
            </span>
          </div>

          {/* Navigation links */}
          <nav className="p-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-[0.15em] text-stone/60 hover:text-gold hover:bg-stone/5 transition-all duration-300 font-medium"
                >
                  <Icon className="w-4 h-4 text-gold" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-6 border-t border-stone/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone/20 flex items-center justify-center text-gold">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate max-w-[120px]">
              <p className="text-[10px] uppercase tracking-wider text-ivory font-semibold truncate">
                {adminName}
              </p>
              <span className="text-[8px] text-stone/40 uppercase tracking-widest block">
                Admin
              </span>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-[#161616] border-b border-stone/10 px-8 flex items-center justify-between">
          {/* Command Palette trigger hint */}
          <button
            className="flex items-center gap-3 text-stone/40 hover:text-stone/20 transition-colors text-xs py-2 px-4 bg-stone/5 border border-stone/10 max-w-xs w-full text-left rounded-none cursor-pointer"
            id="cmd-palette-trigger"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="ml-auto text-[9px] bg-[#111111] px-1.5 py-0.5 border border-stone/20 text-stone/45 uppercase">
              Ctrl+K
            </kbd>
          </button>

          {/* External links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              target="_blank"
              className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-ivory transition-colors font-medium"
            >
              View Storefront →
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#111111]">
          {children}
        </main>
      </div>
    </div>
  );
}
