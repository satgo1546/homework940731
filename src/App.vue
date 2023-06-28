<template>
  <div>
    <nav>
      <router-link to="/">瀑布流</router-link>
      <router-link to="/uploader">上传图片</router-link>
      <router-link to="/admin">管理后台</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
</script>

<style>
body {
  max-width: 800px;
  margin: auto;
}

nav {
  display: flex;
  background: #dee;
  border: 1px solid #000;
  padding: 3px;
  text-align: center;
}

nav>a {
  flex: 1;
  text-decoration: none;
  padding: 3px;
  color: #377;
}

nav>a:hover {
  background: #266;
  color: #fff;
  box-shadow: 0 0 0 1px #acc inset;
}

.router-link-exact-active {
  font-weight: bold;
}
</style>
