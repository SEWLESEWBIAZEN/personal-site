import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

// Rendered per request so the sitemap URL reflects runtime AUTH_URL, not build-time env.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
