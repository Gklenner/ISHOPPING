import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shoppe",
    short_name: "Shoppe",
    description: "Sua loja de moda online",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#004cff",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}

