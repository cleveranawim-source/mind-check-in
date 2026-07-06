import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages: https://cleveranawim-source.github.io/mind-check-in/
export default defineConfig({
  base: "/mind-check-in/",
  plugins: [react()],
});
