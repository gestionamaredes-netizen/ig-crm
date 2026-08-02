import type { MetadataRoute } from "next";
import { businessConfig } from "@/config/business";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = businessConfig.siteUrl;
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
