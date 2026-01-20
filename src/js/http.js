import axios from "axios";
import { useUserStore } from "../stores/user";
import router from "../routers";

let BASEURL = '/';
let API = axios.create({
    baseURL: BASEURL,
    timeout: 20000,
    headers: {
        Accept: 'application/json',
    }
});

API.interceptors.response.use(
    response => {
        var res = response.data;

        if(res.code == 1001) {
            const userStore = useUserStore();
            // Unauthorized
            localStorage.removeItem('_token_');
            userStore.setIsLoggedIn(false);
            userStore.setToken('');
            router.push({ name: 'login', query: { redirect: '/admin/' + localStorage.getItem('_pre_route_') } });
        }

        return Promise.resolve(res);
    },
    error => {
        return Promise.resolve(error.response);
    }
);

API.defaults.params = {};
API.interceptors.request.use((config) => {
    const userStore = useUserStore();
    config.headers.Authorization = userStore.token;
    return config;
}, (error) => {
    return Promise.resolve(error.response);
});

export default API