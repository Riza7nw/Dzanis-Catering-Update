import type { MetadataRoute } from "next";

const SITE_URL = "https://dzaniskatering.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/rakit-snack-box`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
