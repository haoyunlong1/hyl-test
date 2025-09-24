import axios from 'axios';

// 保存取消函数
const pending = new Map();

// 显示/隐藏全局 loading（可根据项目替换成 UI 框架的 Loading）
let loadingCount = 0;
function showLoading() {
    loadingCount++;
    if (loadingCount === 1) {
        console.log('Loading 显示');
    }
}
function hideLoading() {
    loadingCount--;
    if (loadingCount <= 0) {
        loadingCount = 0;
        console.log('Loading 隐藏');
    }
}
const baseURL =
    import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_GLOB_API_URL
        : import.meta.env.VITE_GLOB_DOMAIN_URL;
console.log(baseURL,'baseURL')

// 创建 axios 实例
const service = axios.create({
    baseURL:baseURL || '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        showLoading();

        // 请求取消逻辑
        const key = config.url + '&' + config.method;
        if (pending.has(key)) {
            pending.get(key)('操作取消'); // 取消重复请求
        }
        config.cancelToken = new axios.CancelToken((c) => {
            pending.set(key, c);
        });

        // token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        hideLoading();
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        hideLoading();

        const key = response.config.url + '&' + response.config.method;
        pending.delete(key);

        const res = response.data;
        if (res.code && res.code !== 200) {
            alert(res.message || '请求出错');
            return Promise.reject(res);
        }
        return res;
    },
    (error) => {
        hideLoading();
        if (axios.isCancel(error)) {
            console.log('请求取消', error.message);
        } else {
            alert(error.message || '网络错误');
        }
        return Promise.reject(error);
    }
);

// 封装 get/post/put/delete
export function get(url, params) {
    return service.get(url, { params });
}
export function post(url, data) {
    return service.post(url, data);
}
export function put(url, data) {
    return service.put(url, data);
}
export function del(url, data) {
    return service.delete(url, { data });
}

export default service;
