import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routers'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

// Toast
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
const options = {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: true,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
}

import moment from 'moment';
app.config.globalProperties.$filters = {
    formatDate(date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
    }
}

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(Toast, options);
app.mount('#app')
