<template>
    <div>
        <input type="file" @change="handleFileChange" />
        <button @click="upload">Upload</button>
        <div v-for="(p, i) in progressList" :key="i">
            Chunk {{ i }}: {{ p }}%
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import SparkMD5 from 'spark-md5';

const file = ref(null);
const progressList = ref([]);

const handleFileChange = (e) => {
    file.value = e.target.files[0];
};

const upload = async () => {
    if (!file.value) return;

    const chunkSize = 2 * 1024 * 1024; // 2MB
    const chunks = Math.ceil(file.value.size / chunkSize);

    // 生成 fileHash
    const spark = new SparkMD5.ArrayBuffer();
    const buffer = await file.value.arrayBuffer();
    spark.append(buffer);
    const fileHash = spark.end();

    progressList.value = Array(chunks).fill(0);

    // 上传每个分片
    for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.value.size, (i + 1) * chunkSize);
        const chunk = file.value.slice(start, end);

        const form = new FormData();
        form.append('file', chunk);
        // form.append('fileHash', fileHash);
        // form.append('chunkIndex', String(i));

        await axios.post('http://localhost:3300/upload', form, {
            headers: {
                'file-hash': fileHash,
                'chunk-index': i
            },
            onUploadProgress: (e) => {
                progressList.value[i] = Math.round((e.loaded / e.total) * 100);
            }
        });
    }

    // // 分片上传完毕，触发合并
    await axios.post('http://localhost:3300/merge', {
        fileHash,
        fileName: file.value.name,
        totalChunks: chunks
    });

    alert('Upload complete!');
};
</script>
