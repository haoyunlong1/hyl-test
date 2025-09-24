<template>
    <div style="height: 2000px"></div>
    <div class="pdf-container">
        <RecycleScroller
            class="pdf-scroller"
            :items="pages"
            :item-size="740"
            key-field="id"
            emitUpdate
            @update="updateRecycleScroller"
        >
            <!-- 每页高度大概 740，可根据实际情况调整 -->
            <template #default="{ item }">
                {{ item }} {{ item.id }}
                <canvas :id="`pdfCanvas${item.id}`"  class="pdf-page"></canvas>
            </template>
        </RecycleScroller>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, reactive } from "vue";
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { RecycleScroller } from "vue-virtual-scroller";
import * as PDF from "pdfjs-dist";
import {hylces} from './pdf-api.js'
import { useUserStore } from '../Stores/user.js'
const UserStore = useUserStore();




// PDF worker 配置
PDF.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const pdfPath = "/123.pdf"; // public 下的 PDF
let pdfDoc = reactive<any>(null);

const pages = ref<{ id: number }[]>([]);
const scale = 1.2; // 缩放比例

onMounted(async () => {
    const res = await hylces({})
    console.log(res,'res')
    UserStore.setUser('123懂得都懂21','43212432')
    console.log('用户存好了:', UserStore.token, UserStore.username)



    loadFile(pdfPath);



// 普通调用
    greet("小明", 18);
// this -> window (严格模式下 undefined)

// 用 apply 调用
    greet.apply({ job: "程序员" }, ["小红", 20]);
    greet.call('D', '10','20');

// // 使用
//     window.addEventListener('scroll', throttle(() => {
//         console.log('滚动触发', Date.now());
//     }, 10000));

});

function greet(name, age) {
    console.log(`我是 ${name}, 今年 ${age} 岁, this是:`, this);
}


// 输出: 我是 小红, 今年 20 岁, this是: { job: '程序员' }

function throttle(fn, delay) {
   let timer = null;
   let last = 0;
   return function (...args){
       const now = Date.now()
       if(now - last >= delay){
           console.log('大于十秒了可以执行了')
           fn.apply(this,args)
           last = now;
       }else{
           console.log('小于十秒了开个定时器')

           clearTimeout(timer);
               timer = setTimeout(()=>{
                   fn.apply(this,args)
               },delay - (now - last))
       }


   }
}


// 使用
window.addEventListener('scroll', throttle(() => {
    console.log('滚动触发', Date.now());
}, 1000));




// 加载 PDF 文档
const loadFile = (url: string) => {
    const loadingTask = PDF.getDocument({
        url,
        cMapUrl: "pdfjs-dist/cmaps/",
        cMapPacked: true,
    });

    loadingTask.promise.then((pdf: any) => {
        pdfDoc = pdf;

        // 填充页面数组
        pages.value = Array.from({ length: pdf.numPages }, (_, i) => ({ id: i + 1 }));
        console.log(pages.value);

        // 首屏渲染前几页
        nextTick(() => {
            for (let i = 1; i <= 2; i++) {
                console.log(i);
                renderPage(i);
            }
        });
    });
};
function updateRecycleScroller(startIndex,endIndex) {
    console.log(startIndex,endIndex)
    renderPage(endIndex)
}

// 渲染单页
const renderPage = (num: number) => {
    if (!pdfDoc) return;

    pdfDoc.getPage(num).then((page: any) => {
        console.log(pdfDoc, 'pdfDoc', page, 'page');

        const canvas: HTMLCanvasElement | null = document.getElementById(
            `pdfCanvas${num}`
        ) as HTMLCanvasElement;
        if (!canvas) return; // 当前页不在视图中

        const ctx = canvas.getContext("2d")!;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = viewport.width + "px";
        canvas.style.height = viewport.height + "px";

        const renderContext = {
            canvasContext: ctx,
            viewport,
        };
        page.render(renderContext);
    });
};
</script>

<style scoped>
.pdf-container {
    width: 1100px;
    height: 740px;
    margin: auto;
    border: 1px solid #ccc;
    overflow: hidden;
}

.pdf-scroller {
    height: 100%;
}

.pdf-page {
    display: block;
    margin: 0 auto 20px;
}
</style>
