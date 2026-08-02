import type { MetadataRoute } from "next";
import { business } from "@/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${business.siteUrl}/sitemap.xml`,
  };
}
