"use client";

import { useState } from "react";
import { saveGeneralSettingsAction, saveAppearanceSettingsAction, toggleIntegrationAction } from "@/actions/settings";
import { toast } from "sonner";
import { 
  Settings, 
  Palette, 
  Cpu, 
  Check, 
  Loader2, 
  Lock, 
  Sparkles,
  RefreshCw
} from "lucide-react";

interface SettingsManagerProps {
  generalSettings: any;
  appearanceSettings: any;
  integrations: any[];
}

export default function SettingsManager({ 
  generalSettings, 
  appearanceSettings, 
  integrations 
}: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "integrations">("general");
  const [loading, setLoading] = useState(false);

  // Form States
  const [general, setGeneral] = useState({
    business_name: generalSettings.business_name || "Stash & Haul",
    support_email: generalSettings.support_email || "support@stashandhaul.com",
    phone: generalSettings.phone || "+91 98765 43210",
    currency: generalSettings.currency || "INR",
    currency_symbol: generalSettings.currency_symbol || "₹",
    shipping_fee: generalSettings.shipping_fee || 0,
    tax_percentage: generalSettings.tax_percentage || 0,
  });

  const [appearance, setAppearance] = useState({
    font_pair: appearanceSettings.font_pair || "cormorant-inter",
    border_radius: appearanceSettings.border_radius || "0px",
    button_shape: appearanceSettings.button_shape || "square",
    card_style: appearanceSettings.card_style || "minimal",
    primary_color: appearanceSettings.primary_color || "#1A1A1A",
    accent_color: appearanceSettings.accent_color || "#C8B38B",
    spacing_scale: appearanceSettings.spacing_scale || "comfortable",
    animation_speed: appearanceSettings.animation_speed || "normal",
    announcement_bar: appearanceSettings.announcement_bar || "",
    maintenance_mode: appearanceSettings.maintenance_mode || false,
  });

  const [localIntegrations, setLocalIntegrations] = useState(integrations);

  // Save General
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Saving general settings...");
    
    const res = await saveGeneralSettingsAction(general);
    if (res.success) {
      toast.success("General settings saved successfully!", { id: toastId });
    } else {
      toast.error(res.error || "Failed to save settings", { id: toastId });
    }
    setLoading(false);
  };

  // Save Appearance
  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Saving theme appearance...");

    const res = await saveAppearanceSettingsAction(appearance);
    if (res.success) {
      toast.success("Theme appearance saved successfully!", { id: toastId });
      // Inject CSS variables locally to see the effect instantly in the admin panel
      const root = document.documentElement;
      root.style.setProperty("--color-charcoal", appearance.primary_color);
      root.style.setProperty("--color-gold", appearance.accent_color);
    } else {
      toast.error(res.error || "Failed to save appearance", { id: toastId });
    }
    setLoading(false);
  };

  // Toggle Integration
  const handleToggleIntegration = async (provider: string, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    
    // Update local state first (optimistic)
    setLocalIntegrations((prev) =>
      prev.map((i) => (i.provider === provider ? { ...i, enabled: nextEnabled } : i))
    );

    const res = await toggleIntegrationAction(provider, nextEnabled);
    if (res.success) {
      toast.success(`${provider.toUpperCase()} integration updated successfully!`);
    } else {
      toast.error(res.error || "Failed to toggle integration");
      // Revert local state
      setLocalIntegrations((prev) =>
        prev.map((i) => (i.provider === provider ? { ...i, enabled: currentEnabled } : i))
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-light tracking-wide">Settings</h1>
        <p className="text-stone/40 text-xs mt-1">Configure shop details, theme appearance, and integrations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone/10 pb-4">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-6 py-2.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer ${
            activeTab === "general"
              ? "text-gold border-b-2 border-gold"
              : "text-stone/40 hover:text-ivory"
          }`}
        >
          <span className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" />
            General Settings
          </span>
        </button>
        <button
          onClick={() => setActiveTab("appearance")}
          className={`px-6 py-2.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer ${
            activeTab === "appearance"
              ? "text-gold border-b-2 border-gold"
              : "text-stone/40 hover:text-ivory"
          }`}
        >
          <span className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            Appearance
          </span>
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`px-6 py-2.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer ${
            activeTab === "integrations"
              ? "text-gold border-b-2 border-gold"
              : "text-stone/40 hover:text-ivory"
          }`}
        >
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            Integrations
          </span>
        </button>
      </div>

      {/* Content Form Panels */}
      <div className="max-w-2xl bg-[#161616] border border-stone/10 p-8">
        
        {/* TAB 1: GENERAL SETTINGS */}
        {activeTab === "general" && (
          <form onSubmit={handleSaveGeneral} className="space-y-6">
            <h2 className="font-display text-2xl font-light tracking-wide border-b border-stone/10 pb-2 mb-4">
              General Shop Settings
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Business Name
                </label>
                <input
                  type="text"
                  value={general.business_name}
                  onChange={(e) => setGeneral((prev) => ({ ...prev, business_name: e.target.value }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Support Email
                </label>
                <input
                  type="email"
                  value={general.support_email}
                  onChange={(e) => setGeneral((prev) => ({ ...prev, support_email: e.target.value }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Support Phone
                </label>
                <input
                  type="text"
                  value={general.phone}
                  onChange={(e) => setGeneral((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={general.currency_symbol}
                  onChange={(e) => setGeneral((prev) => ({ ...prev, currency_symbol: e.target.value }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Currency Code
                </label>
                <input
                  type="text"
                  value={general.currency}
                  onChange={(e) => setGeneral((prev) => ({ ...prev, currency: e.target.value }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Shipping Fee (INR)
                </label>
                <input
                  type="number"
                  value={general.shipping_fee}
                  onChange={(e) => setGeneral((prev) => ({ ...prev, shipping_fee: Number(e.target.value) }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Tax Percentage (%)
                </label>
                <input
                  type="number"
                  value={general.tax_percentage}
                  onChange={(e) => setGeneral((prev) => ({ ...prev, tax_percentage: Number(e.target.value) }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 cursor-pointer mt-4"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save General Settings
            </button>
          </form>
        )}

        {/* TAB 2: THEME APPEARANCE CUSTOMIZER */}
        {activeTab === "appearance" && (
          <form onSubmit={handleSaveAppearance} className="space-y-6">
            <h2 className="font-display text-2xl font-light tracking-wide border-b border-stone/10 pb-2 mb-4">
              Appearance & Rebranding
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Primary Theme Color (Hex)
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={appearance.primary_color}
                    onChange={(e) => setAppearance((prev) => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-10 border border-stone/20 bg-charcoal cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.primary_color}
                    onChange={(e) => setAppearance((prev) => ({ ...prev, primary_color: e.target.value }))}
                    className="flex-1 bg-charcoal border border-stone/20 px-4 py-2 text-xs text-ivory focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Accent Theme Color (Hex)
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={appearance.accent_color}
                    onChange={(e) => setAppearance((prev) => ({ ...prev, accent_color: e.target.value }))}
                    className="w-12 h-10 border border-stone/20 bg-charcoal cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.accent_color}
                    onChange={(e) => setAppearance((prev) => ({ ...prev, accent_color: e.target.value }))}
                    className="flex-1 bg-charcoal border border-stone/20 px-4 py-2 text-xs text-ivory focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Font Pair
                </label>
                <select
                  value={appearance.font_pair}
                  onChange={(e) => setAppearance((prev) => ({ ...prev, font_pair: e.target.value }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-stone/85 focus:outline-none"
                >
                  <option value="cormorant-inter">Cormorant Garamond (Serif) + Inter (Sans)</option>
                  <option value="playfair-outfit">Playfair Display (Serif) + Outfit (Sans)</option>
                  <option value="sans-sans">Inter (Sans) + Inter (Sans)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Border Radius (UI theme)
                </label>
                <select
                  value={appearance.border_radius}
                  onChange={(e) => setAppearance((prev) => ({ ...prev, border_radius: e.target.value }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-stone/85 focus:outline-none"
                >
                  <option value="0px">None (Sharp borders - Square)</option>
                  <option value="4px">Small (Rounded - 4px)</option>
                  <option value="8px">Medium (Classic Rounded - 8px)</option>
                  <option value="16px">Large (Modern Rounded - 16px)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Button Style
                </label>
                <select
                  value={appearance.button_shape}
                  onChange={(e) => setAppearance((prev) => ({ ...prev, button_shape: e.target.value }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-stone/85 focus:outline-none"
                >
                  <option value="square">Square (Premium Editorial)</option>
                  <option value="rounded">Rounded Corners</option>
                  <option value="pill">Pill Shape</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Card Design Style
                </label>
                <select
                  value={appearance.card_style}
                  onChange={(e) => setAppearance((prev) => ({ ...prev, card_style: e.target.value }))}
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-stone/85 focus:outline-none"
                >
                  <option value="minimal">Minimal (Flat borderless - Editorial)</option>
                  <option value="boxed">Boxed (With thin borders)</option>
                  <option value="shadowed">Shadowed (Soft floating shadows)</option>
                </select>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone/75 font-medium block">
                  Announcement Bar Text
                </label>
                <input
                  type="text"
                  value={appearance.announcement_bar}
                  onChange={(e) => setAppearance((prev) => ({ ...prev, announcement_bar: e.target.value }))}
                  placeholder="Complimentary signature gift boxing on all orders this week."
                  className="w-full bg-charcoal border border-stone/20 px-4 py-3 text-xs text-ivory focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-6 mt-4 pt-2 border-t border-stone/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appearance.maintenance_mode}
                  onChange={(e) => setAppearance((prev) => ({ ...prev, maintenance_mode: e.target.checked }))}
                />
                <span className="text-[10px] uppercase tracking-wider text-stone/80">
                  Enable Maintenance Mode
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-gold text-charcoal hover:bg-ivory hover:text-charcoal font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2 cursor-pointer mt-4"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Theme Settings
            </button>
          </form>
        )}

        {/* TAB 3: THIRD-PARTY INTEGRATIONS */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-light tracking-wide border-b border-stone/10 pb-2 mb-4">
              Third-Party Integrations
            </h2>

            <div className="space-y-4">
              {localIntegrations.map((integration) => {
                const isRazorpay = integration.provider === "razorpay";
                
                return (
                  <div
                    key={integration.id}
                    className="bg-charcoal border border-stone/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-stone/95 capitalize">{integration.provider}</h3>
                        {!isRazorpay && (
                          <span className="px-1.5 py-0.5 bg-stone/20 text-stone/40 text-[8px] uppercase tracking-wider font-semibold">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone/50 max-w-sm">
                        {isRazorpay 
                          ? "Enables payment checkout on the storefront. Key ID & Key Secret are managed via Netlify Environment Variables for security."
                          : `Enables automated ${integration.provider} sync. Connect and sync settings for branding, triggers, and analytics.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {isRazorpay ? (
                        <>
                          <span className="text-[10px] text-stone/40 font-mono flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Env secured
                          </span>
                          <button
                            onClick={() => handleToggleIntegration(integration.provider, integration.enabled)}
                            className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                              integration.enabled
                                ? "bg-sage/10 text-sage border border-sage/35"
                                : "bg-stone/10 text-stone/65 border border-stone/20 hover:text-gold hover:border-gold"
                            }`}
                          >
                            {integration.enabled ? "Active" : "Enable"}
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-[#111111] text-stone/30 border border-stone/15 text-[10px] uppercase tracking-wider font-bold cursor-not-allowed"
                        >
                          Configure
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
