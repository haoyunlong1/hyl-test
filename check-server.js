import axios from 'axios';
import os from 'os';

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const key in interfaces) {
        for (const item of interfaces[key]) {
            if (item.family === 'IPv4' && !item.internal) {
                return item.address;
            }
        }
    }
    return '127.0.0.1';
}

async function checkServer(port = 3100) {
    const ip = getLocalIP();
    const url = `http://${ip}:${port}/`;

    console.log(`🔍 正在检测 Vite 服务是否能通过 IP 访问: ${url}`);

    try {
        const res = await axios.get(url);
        if (res.status === 200) {
            console.log(`✅ 可以访问: ${url}`);
        } else {
            console.log(`⚠️ 访问失败，状态码: ${res.status}`);
        }
    } catch (err) {
        console.error(`❌ 无法访问: ${url}`);
        console.error(err.message);
    }
}

checkServer(3100);
