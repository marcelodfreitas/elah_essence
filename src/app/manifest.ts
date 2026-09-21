import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ELAH",
    short_name: "ELAH",
    description: "Joias para momentos que permanecem.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f6f2",
    theme_color: "#f8f6f2",
    orientation: "portrait",
    lang: "pt-BR",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}