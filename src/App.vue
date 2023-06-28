<template>
  <div>
    <el-table-draggable @sort="handleRowDragEnd">
      <el-table :data="state.rows" border row-key="id">
        <el-table-column label="ID" prop="id"></el-table-column>
        <el-table-column label="文件名" prop="filename"></el-table-column>
        <el-table-column label="排序顺序" prop="order_num"></el-table-column>
        <el-table-column label="审核通过" prop="visible"></el-table-column>
      </el-table>
    </el-table-draggable>
    <el-pagination layout="prev, pager, next" :total="state.total" :page-size="state.count" :current-page="state.page"
      @current-change="handleCurrentChange" />
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import axios from 'axios'
import ElTableDraggable from 'el-table-draggable'

const state = reactive({
  rows: [],
  total: 0,
  page: 1,
  count: 10,
  prevLastOrderNum: 0,
  nextFirstOrderNum: 0,
})

async function fetchData() {
  const response = await axios.get('http://localhost:40731/list', {
    params: {
      start: (state.page - 1) * state.count - 1,
      count: state.count + 2
    }
  })
  state.prevLastOrderNum = state.page === 1 ? 0 : response.data.rows[0].order_num
  state.nextFirstOrderNum = state.page === Math.ceil(response.data.total / state.count)
    ? 114514.1919810 : response.data.rows[response.data.rows.length - 1].order_num
  state.rows = response.data.rows.slice(state.page > 1, state.count)
  state.total = response.data.total
}

async function handleCurrentChange(page) {
  state.page = page
  await fetchData()
}

function handleRowDragEnd(event) {
  const i = event.newIndex
  const j = i + (i > event.oldIndex) - (i < event.oldIndex)
  const jOrder = j < 0 ? state.prevLastOrderNum : j >= state.count ? state.nextFirstOrderNum : state.rows[j].order_num
  const newOrder = (state.rows[i].order_num + jOrder) / 2
  state.rows[event.oldIndex].order_num = newOrder
  axios.get('http://localhost:40731/update', {
    params: {
      id: state.rows[event.oldIndex].id,
      order_num: newOrder,
    },
  })
}

onMounted(fetchData)
</script>
