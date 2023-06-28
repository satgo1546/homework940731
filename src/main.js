import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Admin from './Admin.vue'
import Uploader from './Uploader.vue'
import Waterfall from './Waterfall.vue'
import App from './App.vue'

Vue.use(ElementUI)
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', component: Waterfall },
    { path: '/admin', component: Admin },
    { path: '/uploader', component: Uploader },
  ]
})

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})
