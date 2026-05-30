import { defineConfig } from 'vite';

export default defineConfig({
  // Enforce relative paths for assets so that the built portfolio deploys perfectly
  // on any sub-path (such as GitHub Pages repository name: /portfolioroom/)
  base: './'
});
