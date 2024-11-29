import {createApp} from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
import {createPinia} from 'pinia'
import router from './router'
import 'element-plus/dist/index.css'
import piniaPersistedState from 'pinia-plugin-persistedstate';
const pinia = createPinia();
pinia.use(piniaPersistedState);
const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.mount('#app')
