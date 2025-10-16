import {createRouter, createWebHashHistory, createWebHistory} from "vue-router"

// 1. 定义路由组件， 注意，这里一定要使用 文件的全名（包含文件后缀名）
// import HelloWorld from "../components/HelloWorld.vue";
// import PdfViewer from "../components/PdfViewer.vue";


// 2. 定义路由配置
const routes = [
    { path: "/",redirect: '/PdfViewer' },
    { path: "/PdfViewer",name:"PdfViewer", component: () => import('../components/PdfViewer.vue') },
    { path: "/HelloWorld",name:"HelloWorld", component: () => import('../components/HelloWorld.vue') },
    { path: "/uploadceshi",name:"uploadceshi", component: () => import('@components/uploadceshi.vue') },
   // { path: "/LiveRoom",name:"LiveRoom", component: () => import('@components/LiveRoom.vue') },
    { path: "/live/:roomId/:role",name:"live", component: () => import('@components/LiveRoom.vue') },

    { path: '/RoomList', name: 'RoomList',  component: () => import('@components/RoomList.vue'), props: true }

];



// 3. 创建路由实例
const router = createRouter({
    // 4. 采用hash 模式
    // history: createWebHashHistory(),
    // 采用 history 模式
    historyApiFallback: true,
    history: createWebHistory(),
    routes, // short for `routes: routes`
});

export default router
