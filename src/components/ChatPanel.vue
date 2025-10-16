
<template>
  <div class="chat-panel border rounded-xl p-3 mt-4">
    <div class="messages h-40 overflow-y-auto mb-2">
      <div v-for="(m, i) in messages" :key="i">
        <strong>{{ m.user }}:</strong> {{ m.text }}
      </div>
    </div>
    <input v-model="input" @keyup.enter="submit" class="border rounded-xl w-full p-2" placeholder="发送消息..." />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ messages: Array })
const emit = defineEmits(['send'])
const input = ref('')
const submit = () => {
  if (!input.value.trim()) return
  emit('send', { user: 'User', text: input.value })
  input.value = ''
}
</script>