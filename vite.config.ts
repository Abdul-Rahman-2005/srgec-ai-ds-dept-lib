import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

<<<<<<< HEAD
export default defineConfig({
=======
export default defineConfig(() => ({
>>>>>>> 99ea502 (Fix Vite config and Tailwind import order)
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
