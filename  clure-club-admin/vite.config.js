// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import { resolve } from 'path'
//
// export default defineConfig({
//     plugins: [vue()],
//     resolve: {
//         alias: {
//             '@': resolve(__dirname, 'src')
//         }
//     },
//     server: {
//         host: '0.0.0.0',
//         port: 3000
//         // 移除代理配置，直接访问后端
//     }
// })


import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        },
        server: {
            host: '0.0.0.0',
            port: 3000,
            // 开发环境代理配置（可选）
            proxy: mode === 'development' ? {
                '/api': {
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true
                }
            } : {}
        },
        build: {
            // 生产环境构建配置
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: false,
            minify: 'terser',
            rollupOptions: {
                output: {
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
                }
            }
        },
        base: './' // 使用相对路径，便于部署到子目录
    }
})