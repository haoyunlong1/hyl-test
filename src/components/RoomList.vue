<template>
  <div class="room-list p-4">
    <h1 class="text-2xl font-bold mb-4">直播房间列表</h1>

    <div class="mb-4 flex gap-2">
      <input v-model="newRoomName" placeholder="输入新房间名" class="border p-2 rounded" />
      <button @click="createRoom" class="btn">创建房间</button>
    </div>

    <ul class="space-y-2">
      <li v-for="room in rooms" :key="room" class="flex justify-between items-center p-2 border rounded">
        <span>{{ room }}</span>
        <div class="flex gap-2">
          <button @click="enterRoom(room, 'host')" class="btn btn-sm bg-green-500">开播</button>
          <button @click="enterRoom(room, 'viewer')" class="btn btn-sm bg-blue-500">加入</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import io from 'socket.io-client'

const router = useRouter()
const socket = io('http://localhost:3005')

const rooms = ref([])
const newRoomName = ref('')

// 获取最新房间列表
const fetchRooms = () => {
  socket.emit('get-rooms')
}

socket.on('room-list', list => {
  rooms.value = list
})

onMounted(() => {
  fetchRooms()
})

// 创建新房间
const createRoom = () => {
  if (!newRoomName.value) return
  socket.emit('create-room', newRoomName.value)
  newRoomName.value = ''
}

// 进入直播间
const enterRoom = (roomId, role) => {
  // 跳转到 LiveRoom，并传 roomId 和 role
  router.push({
    name: 'live',
    params: { roomId, role }
  })
}
</script>

<style scoped>
.room-list input {
  flex: 1;
}
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  color: white;
}
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
