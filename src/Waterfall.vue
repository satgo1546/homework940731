<template>
  <div>
    <div ref="refreshSpinner" class="loading"></div>
    <div class="grid" ref="gridContainer">
      <div v-for="(item, i) in images" :key="i" class="card"
        :style="{ gridColumn: item.column + 1, marginTop: item.y + 'px' }" @click="popupIndex = i, popupShown = true">
        <img :src="'http://localhost:40731/' + item.filename">
      </div>
    </div>
    <div v-show="!exhausted" ref="loadMoreSpinner" class="loading"></div>
    <p v-show="exhausted">没有更多了。</p>
    <div v-if="images.length" v-show="popupShown" class="popup">
      <img :src="'http://localhost:40731/' + images[popupIndex].filename" @click="popupShown = false">
      <button v-show="popupIndex > 0" class="previous" @click="popupIndex -= 1"></button>
      <button v-show="popupIndex < images.length - 1" class="next" @click="popupIndex += 1"></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const images = ref([])
const exhausted = ref(false)
const popupIndex = ref(0)
const popupShown = ref(false)
const minimumColumnWidth = 160
const maximumColumnCount = 5
const columnHeights = ref([])
let mansoryWidth = 0
let fetching = false
let intersecting = false

function flow(item) {
  const columnWidth = Math.min(document.documentElement.clientWidth, 800) / columnHeights.value.length
  let y = Math.min(...columnHeights.value)
  for (let i = 0; i < columnHeights.value.length; i++) {
    if (y === columnHeights.value[i]) {
      item.column = i
      break
    }
  }
  item.y = y
  columnHeights.value[item.column] = y + (columnWidth - 12) / item.width * item.height + 12
  return item
}

async function fetchMore() {
  // 已在加载或已全部加载完则不再加载
  if (fetching || exhausted.value) return
  fetching = true
  // 获取后20条数据
  const response = (await axios.get('http://localhost:40731/list', {
    params: {
      start: images.length,
      count: 20,
    }
  })).data
  for (const item of response.rows) {
    images.value.push(flow(item))
  }
  // 此次操作导致全部加载完则设置已全部加载完的标志
  if (images.value.length >= response.total || !response.rows.length) {
    exhausted.value = true
  }
  fetching = false
}

async function refresh() {
  images.value.splice(0, images.value.length)
  columnHeights.value.fill(0)
  exhausted.value = false
  await fetchMore()
}

const loadMoreSpinner = ref(null)
const refreshSpinner = ref(null)
const gridContainer = ref(null)
let interval = 0

onMounted(() => {
  refresh()
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      gridContainer.value.scrollIntoView()
      refresh()
    }
  }, { threshold: 0.3 }).observe(refreshSpinner.value)
  new IntersectionObserver(([entry]) => {
    intersecting = entry.isIntersecting
  }, { threshold: 0 }).observe(loadMoreSpinner.value)
  interval = setInterval(() => {
    if (intersecting) fetchMore()
  }, 200);
  new ResizeObserver(([entry]) => {
    if (mansoryWidth != entry.contentRect.width) {
      mansoryWidth = entry.contentRect.width
      columnHeights.value = Array(Math.min(Math.max(Math.floor(mansoryWidth / minimumColumnWidth), 1), maximumColumnCount)).fill(0)
      for (const item of images.value) flow(item)
    }
  }).observe(gridContainer.value)
  gridContainer.value.scrollIntoView()
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped>
.grid {
  display: grid;
  grid-auto-columns: 1fr;
  align-items: start;
  min-height: 100vh;
  margin-top: 48px;
}

.card {
  position: relative;
  border: 2px solid #abb;
  padding: 4px;
  background-color: #9aa;
  grid-row: 1;
  text-align: center;
  cursor: zoom-in;
}

.card>img {
  width: 100%;
}

.loading {
  width: 32px;
  height: 32px;
  margin: 16px auto;
  border-radius: 50%;
  background: conic-gradient(transparent .7turn, white);
  border: 2px solid white;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(1turn);
  }
}

.popup {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-color: #000a;
}

.popup>img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.previous,
.next {
  position: absolute;
  top: 50%;
  margin-top: -64px;
  box-sizing: content-box;
  width: 0;
  height: 0;
  padding: 0;
  background: none;
  border: 64px solid transparent;
}

.previous {
  border-right-color: #ccc6;
  left: -48px;
}

.previous:hover {
  border-right-color: #cccc;
}

.next {
  border-left-color: #ccc6;
  right: -48px;
}

.next:hover {
  border-left-color: #cccc;
}
</style>
