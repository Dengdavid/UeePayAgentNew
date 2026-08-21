import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";
import { activeApiTarget } from "./system.config.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/",
  server: {
    open: true, // 是否设置开启自动打开浏览器
    host: "0.0.0.0",
    port: 5174,
    proxy: {
      "/ipapi": {
        target: "https://ipapi.co",
        changeOrigin: true,
      },
      "/api": {
        target: activeApiTarget,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".vue", ".json", ".less", ".css"],
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always",
        javascriptEnabled: true,
      },
    },
  },
  define: {
    API_URL: JSON.stringify(process.env.API_URL || ""),
  },
  build: {
    // 启用 terser 压缩
    minify: "terser",
    terserOptions: {
      compress: {
        // ✅ 安全做法：仅移除 log / info / debug，保留 error / warn
        pure_funcs: [
          "console.log",
          "console.warn",
          "console.error",
          "console.info",
          "console.debug",
          "console.assert",
          "console.group",
          "console.groupEnd",
        ],
      },
      // 可选：进一步压缩（不影响 console）
      mangle: true,
      keep_classnames: false,
      keep_fnames: false,
    },
  },
});
