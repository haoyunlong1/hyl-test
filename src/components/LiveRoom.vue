<template>
  <div class="live-room p-4">
    <h1 class="text-xl font-bold mb-4">直播间 - {{ roomId }}</h1>

    <div class="video-section grid grid-cols-2 gap-4">
      <video ref="localVideo" autoplay playsinline :muted="isHost" class="rounded-xl shadow"></video>
      <video ref="remoteVideo" autoplay playsinline class="rounded-xl shadow"></video>
    </div>

    <ChatPanel :messages="messages" @send="sendMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import io from 'socket.io-client'
import ChatPanel from './ChatPanel.vue'

const route = useRoute()
const roomId = route.params.roomId
const role = route.params.role // 'host' 或 'viewer'
const isHost = role === 'host'

const localVideo = ref(null)
const remoteVideo = ref(null)
const messages = ref([])

const socket = io('http://localhost:3005')
socket.on('chat-message', msg => messages.value.push(msg))

/** ----------------- 聊天功能 ----------------- **/
const sendMessage = msg => {
  socket.emit('chat-message', { user: 'Me', text: msg, roomId })
  messages.value.push({ user: 'Me', text: msg })
}

/** ----------------- 主播端 ----------------- **/
const viewers = new Map() // 存储每个观众的 peerConnection
let localStream = null

const startLive = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  localVideo.value.srcObject = localStream

  socket.emit('join-room', { roomId, role: 'host' })

  socket.on('new-viewer', async ({ viewerId }) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream))

    pc.onicecandidate = e => {
      if (e.candidate) socket.emit('ice-candidate', { candidate: e.candidate, target: viewerId })
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.emit('offer', { offer, viewerId })
    viewers.set(viewerId, pc)
  })

  socket.on('answer', ({ answer, from }) => {
    const pc = viewers.get(from)
    if (pc) pc.setRemoteDescription(new RTCSessionDescription(answer))
  })

  socket.on('ice-candidate', ({ candidate, from }) => {
    const pc = viewers.get(from)
    if (pc) pc.addIceCandidate(candidate)
  })
}

/** ----------------- 观众端 ----------------- **/
let pc = null
let hostId = null

const joinLive = async () => {
  socket.emit('join-room', { roomId, role: 'viewer' })

  pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })

  pc.ontrack = e => { remoteVideo.value.srcObject = e.streams[0] }
  pc.onicecandidate = e => {
    if (e.candidate && hostId) socket.emit('ice-candidate', { candidate: e.candidate, target: hostId })
  }

  socket.on('offer', async ({ offer, from }) => {
    hostId = from
    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localVideo.value.srcObject = localStream
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socket.emit('answer', { answer, hostId: from })
  })

  socket.on('ice-candidate', ({ candidate }) => {
    if (candidate && pc) pc.addIceCandidate(candidate)
  })

  socket.on('host-left', () => {
    if (remoteVideo.value) remoteVideo.value.srcObject = null
  })
}

onMounted(() => {
  if (isHost) startLive()
  else joinLive()
})

onBeforeUnmount(() => {
  if (localStream) localStream.getTracks().forEach(track => track.stop())
  if (pc) pc.close()
  viewers.forEach(pc => pc.close())
  socket.disconnect()
})
</script>

<style scoped>
.video-section video {
  width: 100%;
  height: auto;
  background: black;
}
</style>
