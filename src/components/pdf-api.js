import {post,get} from '../utils/http.js'
const url = {
    hylces:'/users'
}
export const hylces=(params)=>{
    return get(url.hylces,params)
}