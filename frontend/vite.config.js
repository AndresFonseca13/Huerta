import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
	build: {
		// Reportar tamaño de chunks
		reportCompressedSize: true,
		// Tamaño de chunk warnings en KB
		chunkSizeWarningLimit: 500,
		// Minificación con esbuild (más rápido)
		minify: "esbuild",
		target: "es2015",
		rollupOptions: {
			output: {
				// Separar vendor chunks para mejor caching
				manualChunks: {
					"react-vendor": ["react", "react-dom", "react-router-dom"],
					"ui-vendor": ["framer-motion", "swiper", "react-icons"],
					"i18n-vendor": [
						"i18next",
						"react-i18next",
						"i18next-browser-languagedetector",
					],
					"azure-vendor": ["@azure/storage-blob"],
					utils: ["axios"],
				},
			},
		},
	},
});
