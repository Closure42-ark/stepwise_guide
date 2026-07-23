import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/global.css'

// 应用入口：注册 Pinia 状态管理和 Vue Router，挂载到 #app
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
