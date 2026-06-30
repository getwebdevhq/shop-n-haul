import { createClient } from "@/lib/supabase/server";

export class IntegrationService {
  /**
   * Fetch a settings object by its key.
   */
  static async getSettings(key: string): Promise<any> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch settings for ${key}: ${error.message}`);
    }

    return data?.value || {};
  }

  /**
   * Save settings.
   */
  static async saveSettings(key: string, value: any): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("settings")
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) {
      throw new Error(`Failed to save settings for ${key}: ${error.message}`);
    }
  }

  /**
   * Get all integrations.
   */
  static async getIntegrations(): Promise<any[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .order("provider", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch integrations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Toggle an integration's enabled status.
   */
  static async updateIntegrationToggle(provider: string, enabled: boolean): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("integrations")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("provider", provider);

    if (error) {
      throw new Error(`Failed to toggle integration ${provider}: ${error.message}`);
    }
  }

  /**
   * Update public config of an integration.
   */
  static async updateIntegrationConfig(provider: string, config: any): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("integrations")
      .update({ config, updated_at: new Date().toISOString() })
      .eq("provider", provider);

    if (error) {
      throw new Error(`Failed to update config for ${provider}: ${error.message}`);
    }
  }
}
