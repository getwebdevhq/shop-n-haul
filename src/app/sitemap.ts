import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://stashandhaul.vercel.app";

  // Define static/hash sections of the editorial homepage
  const sections = ["", "#fashion", "#beauty", "#home", "#electronics", "#lifestyle", "#collections", "#best-sellers"];

  return sections.map((section) => ({
    url: `${baseUrl}/${section}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: section === "" ? 1.0 : 0.8,
  }));
}
