import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Admin from './Admin.vue'

Vue.use(ElementUI)

new Vue({
  el: '#app',
  render: h => h(Admin)
})
