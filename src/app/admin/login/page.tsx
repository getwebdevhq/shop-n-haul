"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast, Toaster } from "sonner";
import { Lock, Mail, ArrowRight, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow (First user becomes admin automatically via DB trigger)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;
        
        toast.success("Account created! Logging you in...");
        
        // Auto sign in after sign up
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        
        router.push("/admin");
        router.refresh();
      } else {
        // Login flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if profile exists and is admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError || !profile || profile.role !== "admin") {
          // If not admin, sign out and show error
          await supabase.auth.signOut();
          throw new Error("Unauthorized. Only administrators can access this panel.");
        }

        toast.success("Welcome back! Redirecting...");
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4 selection:bg-gold selection:text-charcoal font-sans">
      <Toaster position="top-right" theme="dark" />
      
      <div className="w-full max-w-md bg-stone/5 border border-stone/10 p-8 md:p-10 rounded-none shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Subtle decorative gold circle */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center space-y-3 mb-8">
          <span className="text-[10px] tracking-[0.4em] uppercase text-gold font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3" /> LuxeCommerce Framework
          </span>
          <h1 className="font-display text-4xl font-light text-ivory tracking-wide">
            {isSignUp ? "Register Admin" : "Admin Portal"}
          </h1>
          <p className="text-stone/60 text-xs tracking-wide">
            {isSignUp 
              ? "Create the first admin account for this store." 
              : "Enter your credentials to manage your store."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-stone/80 font-medium block">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexandra Sterling"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3.5 text-sm text-ivory rounded-none focus:outline-none focus:border-gold transition-colors duration-300"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.25em] text-stone/80 font-medium block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone/40">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="admin@luxecommerce.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-charcoal border border-stone/20 pl-11 pr-4 py-3.5 text-sm text-ivory rounded-none focus:outline-none focus:border-gold transition-colors duration-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.25em] text-stone/80 font-medium block">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone/40">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-charcoal border border-stone/20 pl-11 pr-4 py-3.5 text-sm text-ivory rounded-none focus:outline-none focus:border-gold transition-colors duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal transition-colors duration-500 font-semibold text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : isSignUp ? "Create Admin Account" : "Sign In"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone/10 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-ivory transition-colors duration-300 cursor-pointer"
          >
            {isSignUp ? "Back to Login" : "Register First Admin Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
