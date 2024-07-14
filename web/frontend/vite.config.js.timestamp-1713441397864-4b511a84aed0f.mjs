// vite.config.js
import { defineConfig } from "file:///home/dipeshgaur/Documents/ER-Non-Plus-CLI-3/node_modules/vite/dist/node/index.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "file:///home/dipeshgaur/Documents/ER-Non-Plus-CLI-3/node_modules/@vitejs/plugin-react/dist/index.js";
import dotenv from "file:///home/dipeshgaur/Documents/ER-Non-Plus-CLI-3/node_modules/dotenv/lib/main.js";
var __vite_injected_original_import_meta_url = "file:///home/dipeshgaur/Documents/ER-Non-Plus-CLI-3/web/frontend/vite.config.js";
dotenv.config();
if (process.env.npm_lifecycle_event === "build" && !process.env.CI && !process.env.SHOPIFY_API_KEY) {
  console.warn(
    "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
  );
}
var proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false
};
var host = process.env.HOST ? process.env.HOST.replace(/https?:\/\//, "") : "localhost";
var hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443
  };
}
var vite_config_default = defineConfig({
  root: dirname(fileURLToPath(__vite_injected_original_import_meta_url)),
  plugins: [react()],
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
    "process.env.APP_EXTENSION_ID": JSON.stringify(process.env.APP_EXTENSION_ID)
  },
  resolve: {
    preserveSymlinks: true
  },
  server: {
    host: "localhost",
    port: process.env.FRONTEND_PORT,
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9kaXBlc2hnYXVyL0RvY3VtZW50cy9FUi1Ob24tUGx1cy1DTEktMy93ZWIvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2RpcGVzaGdhdXIvRG9jdW1lbnRzL0VSLU5vbi1QbHVzLUNMSS0zL3dlYi9mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9kaXBlc2hnYXVyL0RvY3VtZW50cy9FUi1Ob24tUGx1cy1DTEktMy93ZWIvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSBcInVybFwiO1xuaW1wb3J0IGh0dHBzIGZyb20gXCJodHRwc1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnXG5kb3RlbnYuY29uZmlnKClcbmlmIChcbiAgcHJvY2Vzcy5lbnYubnBtX2xpZmVjeWNsZV9ldmVudCA9PT0gXCJidWlsZFwiICYmXG4gICFwcm9jZXNzLmVudi5DSSAmJlxuICAhcHJvY2Vzcy5lbnYuU0hPUElGWV9BUElfS0VZXG4pIHtcbiAgY29uc29sZS53YXJuKFxuICAgIFwiXFxuQnVpbGRpbmcgdGhlIGZyb250ZW5kIGFwcCB3aXRob3V0IGFuIEFQSSBrZXkuIFRoZSBmcm9udGVuZCBidWlsZCB3aWxsIG5vdCBydW4gd2l0aG91dCBhbiBBUEkga2V5LiBTZXQgdGhlIFNIT1BJRllfQVBJX0tFWSBlbnZpcm9ubWVudCB2YXJpYWJsZSB3aGVuIHJ1bm5pbmcgdGhlIGJ1aWxkIGNvbW1hbmQuXFxuXCJcbiAgKTtcbn1cblxuY29uc3QgcHJveHlPcHRpb25zID0ge1xuICB0YXJnZXQ6IGBodHRwOi8vMTI3LjAuMC4xOiR7cHJvY2Vzcy5lbnYuQkFDS0VORF9QT1JUfWAsXG4gIGNoYW5nZU9yaWdpbjogZmFsc2UsXG4gIHNlY3VyZTogdHJ1ZSxcbiAgd3M6IGZhbHNlLFxufTtcblxuY29uc3QgaG9zdCA9IHByb2Nlc3MuZW52LkhPU1RcbiAgPyBwcm9jZXNzLmVudi5IT1NULnJlcGxhY2UoL2h0dHBzPzpcXC9cXC8vLCBcIlwiKVxuICA6IFwibG9jYWxob3N0XCI7XG5cbmxldCBobXJDb25maWc7XG5pZiAoaG9zdCA9PT0gXCJsb2NhbGhvc3RcIikge1xuICBobXJDb25maWcgPSB7XG4gICAgcHJvdG9jb2w6IFwid3NcIixcbiAgICBob3N0OiBcImxvY2FsaG9zdFwiLFxuICAgIHBvcnQ6IDY0OTk5LFxuICAgIGNsaWVudFBvcnQ6IDY0OTk5LFxuICB9O1xufSBlbHNlIHtcbiAgaG1yQ29uZmlnID0ge1xuICAgIHByb3RvY29sOiBcIndzc1wiLFxuICAgIGhvc3Q6IGhvc3QsXG4gICAgcG9ydDogcHJvY2Vzcy5lbnYuRlJPTlRFTkRfUE9SVCxcbiAgICBjbGllbnRQb3J0OiA0NDMsXG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJvb3Q6IGRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKSxcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBkZWZpbmU6IHtcbiAgICBcInByb2Nlc3MuZW52LlNIT1BJRllfQVBJX0tFWVwiOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5TSE9QSUZZX0FQSV9LRVkpLFxuICAgIFwicHJvY2Vzcy5lbnYuQVBQX0VYVEVOU0lPTl9JRFwiOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5BUFBfRVhURU5TSU9OX0lEKVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgcHJlc2VydmVTeW1saW5rczogdHJ1ZSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCJsb2NhbGhvc3RcIixcbiAgICBwb3J0OiBwcm9jZXNzLmVudi5GUk9OVEVORF9QT1JULFxuICAgIGhtcjogaG1yQ29uZmlnLFxuICAgIHByb3h5OiB7XG4gICAgICBcIl4vKFxcXFw/LiopPyRcIjogcHJveHlPcHRpb25zLFxuICAgICAgXCJeL2FwaSgvfChcXFxcPy4qKT8kKVwiOiBwcm94eU9wdGlvbnMsXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2VixTQUFTLG9CQUFvQjtBQUMxWCxTQUFTLGVBQWU7QUFDeEIsU0FBUyxxQkFBcUI7QUFFOUIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sWUFBWTtBQUx1TSxJQUFNLDJDQUEyQztBQU0zUSxPQUFPLE9BQU87QUFDZCxJQUNFLFFBQVEsSUFBSSx3QkFBd0IsV0FDcEMsQ0FBQyxRQUFRLElBQUksTUFDYixDQUFDLFFBQVEsSUFBSSxpQkFDYjtBQUNBLFVBQVE7QUFBQSxJQUNOO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTSxlQUFlO0FBQUEsRUFDbkIsUUFBUSxvQkFBb0IsUUFBUSxJQUFJO0FBQUEsRUFDeEMsY0FBYztBQUFBLEVBQ2QsUUFBUTtBQUFBLEVBQ1IsSUFBSTtBQUNOO0FBRUEsSUFBTSxPQUFPLFFBQVEsSUFBSSxPQUNyQixRQUFRLElBQUksS0FBSyxRQUFRLGVBQWUsRUFBRSxJQUMxQztBQUVKLElBQUk7QUFDSixJQUFJLFNBQVMsYUFBYTtBQUN4QixjQUFZO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDZDtBQUNGLE9BQU87QUFDTCxjQUFZO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVjtBQUFBLElBQ0EsTUFBTSxRQUFRLElBQUk7QUFBQSxJQUNsQixZQUFZO0FBQUEsRUFDZDtBQUNGO0FBRUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTSxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUFBLEVBQzVDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTiwrQkFBK0IsS0FBSyxVQUFVLFFBQVEsSUFBSSxlQUFlO0FBQUEsSUFDekUsZ0NBQWdDLEtBQUssVUFBVSxRQUFRLElBQUksZ0JBQWdCO0FBQUEsRUFDN0U7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLGtCQUFrQjtBQUFBLEVBQ3BCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNLFFBQVEsSUFBSTtBQUFBLElBQ2xCLEtBQUs7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxNQUNmLHNCQUFzQjtBQUFBLElBQ3hCO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
