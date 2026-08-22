/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El manifest.json y el service worker viven en /public y se registran
  // manualmente desde app/layout.tsx (ver PwaRegister). Esto evita depender
  // de un paquete de terceros que requiera resolverse en tiempo de build.
};

module.exports = nextConfig;
