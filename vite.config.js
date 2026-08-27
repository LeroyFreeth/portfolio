import { defineConfig } from "vite"
import basicSsl from "@vitejs/plugin-basic-ssl"


export default defineConfig({
	base: '/portfolio/',
	publicDir: 'public',
	plugins: [basicSsl()],
	server: {
		https: true,
		host: true,
		port: 3000,
	},
	assetsInclude: ['**/*.webp','**/*.obj', '**/*.mtl'],
})
