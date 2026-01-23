const prefix = '/api';
import { useUserStore } from "../stores/user";
import API from "./http";

export const GET_RECAPTCHA = async function () {
    return await API.get(`${prefix}/get-recaptcha`);
}

export const LOGIN = async function (username, password, recaptcha, uuid) {
    const res = await API.post(`${prefix}/login`, {
        phone: username,
        password: password,
        verification_code: recaptcha,
        uuid: uuid,
    });
    if (res.code == 1000) {
        const userStore = useUserStore();
        const token = res.data.token;
        userStore.setToken(token);
        userStore.setIsLoggedIn(true);
        localStorage.setItem('_token_', token);
    }

    return res;
}

export const PROFILE = async function () {
    const res = await API.get(`${prefix}/profile`);
    if (res.code == 1000) {
        const userStore = useUserStore();
        userStore.setProfile(res.data);
    }
}

export const LOGOUT = async function () {
    const res = await API.post(`${prefix}/logout`);
    if (res.code == 1000) {
        const userStore = useUserStore();
        userStore.setToken('');
        userStore.setIsLoggedIn(false);
        localStorage.removeItem('_token_');
    }

    return res;
}

export const BANNERS = async function () {
    return await API.get(`${prefix}/banners`);
}

export const CREATE_BANNER = async function (formData) {
    const config = {
        method: 'post',
        url: prefix + '/banners/upload',
        data: formData
    }
    return API(config);
}

export const DELETE_BANNER = async function (id) {
    return await API.post(`${prefix}/banners/${id}/delete`);
}

export const LOTTERY_RECORDS = async function (page = 1, perPage = 10, lottery_type = 'aomen') {
    return await API.get(`${prefix}/lottery-records`, {
        params: {
            page: page,
            perPage: perPage,
            lottery_type: lottery_type,
        }
    });
}

export const CREATE_LOTTERY_RECORD = async function (data) {
    return await API.post(`${prefix}/lottery-records/create`, data);
}

export const DELETE_LOTTERY_RECORD = async function (id, lottery_type = 'aomen') {
    return await API.post(`${prefix}/lottery-records/${id}/delete`, { lottery_type });
}

export const UPDATE_LOTTERY_RECORD = async function (id, data) {
    return await API.post(`${prefix}/lottery-records/${id}/update`, data);
}