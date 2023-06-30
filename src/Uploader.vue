<template>
  <div>
    <h1>上传图片</h1>
    <input v-show="!uploading" type="file" @change="handleFileInput" multiple accept="image/gif, image/jpeg, image/png">
    <div class="grid">
      <div v-for="(item, index) in images" :key="index" class="preview">
        <img :src="item.objectURL">
        <button v-show="!uploading" @click="removePreview(index)" class="delete">删除</button>
        <progress v-show="uploading" :value="item.progress" max="1"></progress>
      </div>
    </div>
    <div v-show="uploading && !uploaded" class="loading"></div>
    <button v-show="!uploading && images.length" @click="uploadFiles" class="upload">上传</button>
    <p v-show="uploaded">上传完成。图片将于审核后显示在首页。可以上传更多或<router-link to="/">返回首页</router-link>。</p>
    <button v-show="uploaded" @click="uploadMore" class="upload">继续上传</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const images = ref([])
const uploading = ref(false)
const uploaded = ref(false)

function handleFileInput(event) {
  images.value.push(...Array.prototype.map.call(event.target.files, file => ({
    file,
    objectURL: URL.createObjectURL(file),
    progress: 0,
  })))
  event.target.value = ''
}

function removePreview(index) {
  images.value.splice(index, 1)
}

async function uploadFiles() {
  uploading.value = true
  for (const item of images.value) {
    await axios.post('http://localhost:40731/upload', { image: item.file }, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: event => item.progress = event.loaded / event.total
    })
  }
  uploaded.value = true
}

function uploadMore() {
  images.value = []
  uploading.value = false
  uploaded.value = false
}

</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  align-items: stretch;
  margin: 1em 0;
}

.preview {
  border: 5px solid transparent;
  text-align: center;
  border: 2px solid #abb;
  padding: 4px;
  background-color: #9aa;
}

.preview>img {
  max-width: 100%;
  max-height: 100px;
}

.preview>progress{
  display: block;
  width: 80%;
  margin: auto;
}

.delete {
  background-color: pink;
  border: 1px solid plum;
  color: purple;
  display: block;
  margin: auto;
}

.delete:hover {
  background-color: plum;
}

.delete:active {
  background-color: rosybrown;
}

.upload {
  display: block;
  margin: auto;
  font-size: 1.2em;
  padding: 4px 60px;
  background-color: aliceblue;
  color: steelblue;
  border: 1px solid steelblue;
}

.upload:hover{
  background-color: azure;
}

.upload:active {
  background-color: lightblue;
}

@keyframes progress-bar-stripes {
  from {
    background-position-x: 28.2842px;
  }

  to {
    background-position-x: 0;
  }
}

.loading {
  animation: progress-bar-stripes 1s linear infinite;
  height: 1em;
  background-image: repeating-linear-gradient(135deg, #3af 0 10px, #07f 0 20px);
  border-radius: 4px;
}
</style>
