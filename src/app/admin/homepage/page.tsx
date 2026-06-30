import { ContentService } from "@/services/content.service";
import HomepageManager from "./HomepageManager";

export const revalidate = 0; // Disable caching to ensure real-time updates

export default async function AdminHomepagePage() {
  const blocks = await ContentService.getContentBlocks({
    status: "published", // Load all published blocks
  });

  return <HomepageManager initialBlocks={blocks} />;
}
