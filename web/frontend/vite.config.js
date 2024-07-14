import { defineConfig } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import react from "@vitejs/plugin-react";
import dotenv from 'dotenv'
dotenv.config()

console.log("process.env.npm_lifecycle_event ",process.env.npm_lifecycle_event);
console.log("process.env.SHOPIFY_API_KEY ",process.env.SHOPIFY_API_KEY);
console.log("process.env.CI ",process.env.CI);

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
  );
}

console.log("process.env.BACKEND_PORT ",process.env.BACKEND_PORT);

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

console.log("process.env.HOST ",process.env.HOST);
console.log("process.env.FRONTEND_PORT ",process.env.FRONTEND_PORT);
const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443,
  };
}


console.log("process.env.SHOPIFY_API_KEY ",process.env.SHOPIFY_API_KEY);
console.log("process.env.APP_EXTENSION_ID ",process.env.APP_EXTENSION_ID);

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
    "process.env.APP_EXTENSION_ID": JSON.stringify(process.env.APP_EXTENSION_ID)
  },
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    host: "localhost",
    port: process.env.FRONTEND_PORT,
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
    },
  },
});
