<template>
  <div>
    <el-button @click="startHacking">alert</el-button>
  </div>
</template>

<script setup>
function startHacking() {
  alert(1)
}
</script>

<style>
</style>
