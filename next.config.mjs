/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite servidores de desarrollo en paralelo (revisión), cada uno con su carpeta.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  webpack: (config) => {
    // En el primer build (sin caché) webpack avisa de "cadenas grandes" de librerías de terceros
    // (gsap, supabase…). No es accionable: solo se dejan los errores.
    config.infrastructureLogging = { ...config.infrastructureLogging, level: "error" };
    return config;
  },
};

export default nextConfig;
