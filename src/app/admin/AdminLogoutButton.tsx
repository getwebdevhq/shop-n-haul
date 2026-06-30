"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      router.push("/admin/login");
      router.refresh();
    } catch (err: any) {
      toast.error("Logout failed: " + err.message);
    }
  };

  return (
    <button
      onClick={handleLogout}
      title="Logout"
      className="p-2 text-stone/40 hover:text-gold transition-colors hover:bg-stone/5 rounded-none cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
