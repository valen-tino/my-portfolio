import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function resolveManualChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined;

  if (
    id.includes('/react/') ||
    id.includes('/react-dom/') ||
    id.includes('/react-router/') ||
    id.includes('/react-router-dom/') ||
    id.includes('/scheduler/')
  ) {
    return 'vendor-react';
  }

  if (id.includes('/gsap/')) {
    return 'vendor-gsap';
  }

  if (
    id.includes('/prosemirror-') ||
    id.includes('/orderedmap/') ||
    id.includes('/rope-sequence/') ||
    id.includes('/w3c-keyname/') ||
    id.includes('/crelt/')
  ) {
    return 'vendor-prosemirror';
  }

  if (id.includes('/@tiptap/') || id.includes('/linkifyjs/')) {
    return 'vendor-tiptap';
  }

  if (id.includes('/marked/') || id.includes('/axios/') || id.includes('/@vercel/analytics/')) {
    return 'vendor-utils';
  }

  return undefined;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: resolveManualChunk,
      },
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
