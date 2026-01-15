import { defineConfig } from 'vite'

export default defineConfig({
  base: '/VFXReferenceIntegration/',
  optimizeDeps: {
    include: ['@mediapipe/hands'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /@mediapipe\/hands/],
    },
  },
})
