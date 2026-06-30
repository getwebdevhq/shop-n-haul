import { createClient } from "@/lib/supabase/server";

export class ActivityService {
  /**
   * Log an admin action.
   */
  static async logActivity(
    adminId: string | null,
    action: string,
    entity: string,
    entityId?: string
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("activity_logs")
      .insert([
        {
          admin_id: adminId || null,
          action,
          entity,
          entity_id: entityId || null,
        },
      ]);

    if (error) {
      console.error(`Failed to log activity: ${error.message}`);
    }
  }

  /**
   * Fetch the latest activity logs.
   */
  static async getActivityLogs(limit: number = 20) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select(`
        *,
        profiles (
          full_name,
          role
        )
      `)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch activity logs: ${error.message}`);
    }

    return data || [];
  }
}
