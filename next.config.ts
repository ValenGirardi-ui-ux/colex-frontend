import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/carrito", destination: "/mensajes", permanent: false },
      { source: "/configuracion", destination: "/ajustes", permanent: false },
      { source: "/settings", destination: "/ajustes", permanent: false },
      { source: "/ajustes/configuracion", destination: "/ajustes", permanent: false },
    ];
  },
};

export default nextConfig;
