import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import figlet from 'figlet'
import gradient from 'gradient-string'
import ora from 'ora'

import open from 'open'


// chalk → 颜色
//
// figlet → ASCII 大字
//
// gradient-string → 渐变文字
//
// open → 自动打开浏览器
//
// ora → 终端加载动画

function createViteProxy(env) {
  const proxy = {};
  if (!env.VITE_PROXY) return proxy;

  try {
    const proxyList = JSON.parse(env.VITE_PROXY);
    proxyList.forEach(([prefix, target]) => {
      proxy[prefix] = {
        target,
        changeOrigin: true,
        rewrite: (path) => path.replace(new RegExp(`^${prefix}`), '')
      };
    });
  } catch (e) {
    console.error('VITE_PROXY 配置错误，请检查 .env 文件里的 JSON 格式');
  }
//  console.log(proxy,'proxy')
  return proxy;
}
// 获取局域网 IP
function getLocalNetworkIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
 // console.log(env,'env','mode',mode)
  return {
    plugins: [
        vue(),
      {
        name: 'fancy-terminal',
        configureServer(server) {
          server.httpServer?.once('listening', async () => {
            const port = server.config.server.port
            const ip = getLocalNetworkIP()

            // 彩色 ASCII Logo
            figlet('My Vite App', (err, data) => {
              if (!err) {
                console.log(gradient.rainbow.multiline(data))
              }
            })

            // 加载动画
            const spinner = ora({
              text: gradient.pastel('🚀 Vite 正在启动...'),
              spinner: 'dots'
            }).start()

            // 模拟加载进度
            await new Promise((resolve) => {
              let count = 0
              const timer = setInterval(() => {
                spinner.text = gradient.pastel(`🚀 Vite 启动中... ${count}%`)
                count += 5
                if (count > 100) {
                  clearInterval(timer)
                  resolve(null)
                }
              }, 50)
            })

            spinner.succeed(gradient.pastel('🎉 Vite 启动成功!'))

            // 显示 Local + Network
            console.log(chalk.blueBright(`📍 Local:   http://localhost:${port}/`))
            console.log(chalk.magentaBright(`🌐 Network: http://${ip}:${port}/\n`))

            // 自动打开局域网 IP
            open(`http://${ip}:${port}`)
          })
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
      }
    },
    server: {

      host: '0.0.0.0', // 监听所有网卡，局域网可访问
      strictPort: false, // 端口被占用会自动换
      open: false ,      // 启动后自动打开浏览器
      port: Number(env.VITE_PORT), //自定义端口
      fs: {
        allow: ['.']  // 允许访问项目根目录
      },
      proxy: mode === 'development' ? createViteProxy(env) : undefined,


    }
  };
});
