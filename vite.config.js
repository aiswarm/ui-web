import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue({
      template: {
        /*
         * Vue's SFC compiler will pick up the locally installed `pug` package
         * for <template lang="pug"> blocks.
         */
      }
    }),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  server: {
    port: 8080
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
