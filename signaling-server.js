// signaling-server.js
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

// 房间集合
const rooms = new Set()
// 每个房间的主播 socketId
const roomHosts = new Map()

io.on('connection', socket => {
    console.log('用户已连接', socket.id)

    /** ----------------- 房间列表 ----------------- **/
    socket.on('get-rooms', () => {
        socket.emit('room-list', Array.from(rooms))
    })

    socket.on('create-room', roomName => {
        if (!roomName || typeof roomName !== 'string') return
        rooms.add(roomName)
        console.log(`创建房间: ${roomName}`)
        io.emit('room-list', Array.from(rooms))
    })

    /** ----------------- 加入房间 ----------------- **/
    socket.on('join-room', ({ roomId, role }) => {
        socket.join(roomId)
        console.log(`用户 ${socket.id} 加入房间 ${roomId} 角色: ${role}`)

        if (role === 'host') {
            roomHosts.set(roomId, socket.id)
        } else if (role === 'viewer') {
            const hostId = roomHosts.get(roomId)
            if (hostId) {
                // 通知主播有新观众
                io.to(hostId).emit('new-viewer', { viewerId: socket.id })
            }
        }
    })

    /** ----------------- WebRTC 信令 ----------------- **/
    socket.on('offer', ({ offer, viewerId }) => {
        if (viewerId) io.to(viewerId).emit('offer', { offer, from: socket.id })
    })

    socket.on('answer', ({ answer, hostId }) => {
        if (hostId) io.to(hostId).emit('answer', { answer, from: socket.id })
    })

    socket.on('ice-candidate', ({ candidate, target }) => {
        if (target) io.to(target).emit('ice-candidate', { candidate, from: socket.id })
    })

    /** ----------------- 聊天 ----------------- **/
    socket.on('chat-message', msg => {
        io.to(msg.roomId).emit('chat-message', msg)
    })

    /** ----------------- 用户断开 ----------------- **/
    socket.on('disconnect', () => {
        console.log('用户断开', socket.id)
        // 如果是主播离开，通知房间内观众
        for (const [roomId, hostId] of roomHosts.entries()) {
            if (hostId === socket.id) {
                socket.to(roomId).emit('host-left')
                roomHosts.delete(roomId)
            }
        }
    })
})

server.listen(3005, () => console.log('信令服务器运行在 http://localhost:3005'))
