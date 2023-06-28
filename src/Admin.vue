<template>
  <div>
    <el-table-draggable @sort="handleRowDragEnd">
      <el-table :data="state.rows" border row-key="id">
        <el-table-column label="ID" prop="id" width="40"></el-table-column>
        <el-table-column label="图片" width="140">
          <template v-slot="{ row, $index }">
            <img :src="'http://localhost:40731/' + row.filename" width="100" height="100"
              @click="dialogState.visible = true, dialogState.index = $index">
          </template>
        </el-table-column>
        <el-table-column label="排序顺序" prop="order_num"></el-table-column>
        <el-table-column label="操作" width="144">
          <template v-slot="{ row }">
            <el-checkbox v-model="row.visible" @change="updateRecord({ id: row.id, visible: row.visible })" label="审核通过"
              border></el-checkbox>
            <el-button type="danger" icon="el-icon-delete" plain @click="removeRecord(row.id)">删除</el-button>
            <el-button @click="updateRecord({ id: row.id, order_num: state.firstOrderNum /= 2 }), fetchData()">置顶</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-table-draggable>
    <el-pagination layout="prev, pager, next" :total="state.total" :page-size="state.count" :current-page="state.page + 1"
      @current-change="handleCurrentChange" />
    <el-dialog :title="'图片 ID ' + state.rows[dialogState.index].id" :visible.sync="dialogState.visible" width="95%">
      <img :src="'http://localhost:40731/' + state.rows[dialogState.index].filename" style="max-width: 100%;">
      <span slot="footer" class="dialog-footer">
        <el-tag type="info">{{ dialogState.index + 1 }} / {{ state.rows.length }}</el-tag>
        <el-button @click="dialogState.index--" :disabled="dialogState.index === 0">上一张</el-button>
        <el-checkbox v-model="state.rows[dialogState.index].visible"
          @change="updateRecord({ id: state.rows[dialogState.index].id, visible: state.rows[dialogState.index].visible })"
          label="审核通过" border></el-checkbox>
        <el-button @click="dialogState.index++" :disabled="dialogState.index === state.rows.length - 1">下一张</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import axios from 'axios'
import ElTableDraggable from 'el-table-draggable'

const state = reactive({
  rows: [],
  total: 0,
  page: 0,
  count: 10,
  prevLastOrderNum: 0,
  nextFirstOrderNum: 0,
  firstOrderNum: 0,
})

const dialogState = reactive({
  visible: false,
  index: 0,
})

async function fetchData() {
  const response = await axios.get('http://localhost:40731/list', {
    params: {
      start: state.page * state.count - 1,
      count: state.count + 2
    }
  })
  if (state.page === 0) state.firstOrderNum = response.data.rows[0].order_num
  state.prevLastOrderNum = state.page === 0 ? 0 : response.data.rows[0].order_num
  state.nextFirstOrderNum = state.page === Math.ceil(response.data.total / state.count) - 1
    ? 114514.1919810 : response.data.rows[response.data.rows.length - 1].order_num
  state.rows = response.data.rows.slice(state.page > 0, state.count)
  state.total = response.data.total
}

async function handleCurrentChange(page) {
  state.page = page - 1
  await fetchData()
}

function handleRowDragEnd(event) {
  const i = event.newIndex
  const j = i + (i > event.oldIndex) - (i < event.oldIndex)
  const jOrder = j < 0 ? state.prevLastOrderNum : j >= state.count ? state.nextFirstOrderNum : state.rows[j].order_num
  const newOrder = (state.rows[i].order_num + jOrder) / 2
  state.rows[event.oldIndex].order_num = newOrder
  updateRecord({
    id: state.rows[event.oldIndex].id,
    order_num: newOrder,
  })
}

async function updateRecord(params) {
  await axios.get('http://localhost:40731/update', { params })
}

async function removeRecord(id) {
  await axios.get('http://localhost:40731/delete', { params: { id } })
  await fetchData()
}

onMounted(fetchData)
</script>
