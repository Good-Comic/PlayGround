import {defineConfig} from 'vite';

export default defineConfig({
  appType: 'mpa',
  cacheDir: `/tmp/forge-vite-${process.env.FORGE_PREVIEW_PORT || 'unknown'}`,
  clearScreen: false,
  server: {
    allowedHosts: ['forge-studio', 'localhost', '127.0.0.1'],
    cors: false,
    fs: {strict: true},
    headers: {
      'Access-Control-Allow-Origin': 'null',
      'Cache-Control': 'no-store',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      'X-Content-Type-Options': 'nosniff'
    }
  }
});
