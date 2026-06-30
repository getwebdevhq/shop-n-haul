"use server";

import { IntegrationService } from "@/services/integration.service";
import { revalidatePath } from "next/cache";

export async function saveGeneralSettingsAction(settings: any) {
  try {
    await IntegrationService.saveSettings("general", settings);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save general settings" };
  }
}

export async function saveAppearanceSettingsAction(settings: any) {
  try {
    await IntegrationService.saveSettings("appearance", settings);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save appearance settings" };
  }
}

export async function toggleIntegrationAction(provider: string, enabled: boolean) {
  try {
    await IntegrationService.updateIntegrationToggle(provider, enabled);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update integration" };
  }
}
