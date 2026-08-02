import type { MetadataRoute } from "next";
import { business } from "@/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: business.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
