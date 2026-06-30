import { IntegrationService } from "@/services/integration.service";
import SettingsManager from "./SettingsManager";

export const revalidate = 0; // Disable caching to ensure real-time settings updates

export default async function AdminSettingsPage() {
  const generalSettings = await IntegrationService.getSettings("general");
  const appearanceSettings = await IntegrationService.getSettings("appearance");
  const integrations = await IntegrationService.getIntegrations();

  return (
    <SettingsManager
      generalSettings={generalSettings}
      appearanceSettings={appearanceSettings}
      integrations={integrations}
    />
  );
}
