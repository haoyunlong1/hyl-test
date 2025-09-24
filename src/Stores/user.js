import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        username: ''
    }),
    actions: {
        setUser(token, username) {
            this.token = token
            this.username = username
        },
        clearUser() {
            this.token = ''
            this.username = ''
        }
    },
    persist: { // 因为pinia策略问题 一个模块只能存储到同一位置下
        enabled: true,
        // strategies: [
        //     // {
        //     //     storage: sessionStorage, // 存 sessionStorage
        //     //     paths: ['token']          // 只保存 token
        //     // },
        //     {
        //         storage: localStorage,    // 存 localStorage
        //         paths: ['username']       // 只保存 username
        //     }
        // ]
    }

})