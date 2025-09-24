import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import 'vue3-virtual-scroller/dist/vue-virtual-scroller.css'
// 引入路由对象实例
import router from './router/index.js'
import { createPinia } from 'pinia'
import 'ant-design-vue/dist/reset.css';

//pinia持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


import Antd from 'ant-design-vue';

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 可在这里 pinia.use(plugin) 做扩展

app.use(router)
app.use(pinia)

app.use(Antd)

app.mount('#app')


