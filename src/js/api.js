const prefix = '/api';
import { useUserStore } from "../stores/user";
import { useZodiacStore } from "../stores/zodiac";
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

export const CURRENT_YEAR = async function () {
    const res = await API.get(`${prefix}/current-year`);
    if (res.code == 1000) {
        const zodiacStore = useZodiacStore();
        zodiacStore.setCurrentYear(res.data.year);
    }
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

export const GET_PLATFORM_LAST_BATCH_NUMBER = async function () {
    return await API.get(`${prefix}/lottery-records/last-batch-number`);
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

export const RESULT_GUESSES = async function (page = 1, perPage = 10) {
    return await API.get(`${prefix}/result-guesses`, {
        params: {
            page: page,
            perPage: perPage,
        }
    });
}

export const CREATE_RESULT_GUESS = async function (data) {
    return await API.post(`${prefix}/result-guesses/create`, data);
}

export const UPDATE_RESULT_GUESS = async function (id, data) {
    return await API.post(`${prefix}/result-guesses/${id}/update`, data);
}

export const DELETE_RESULT_GUESS = async function (id) {
    return await API.post(`${prefix}/result-guesses/${id}/delete`);
}

export const GET_XIAO_MA = async function () {
    return await API.get(`${prefix}/configs/xiao-ma`);
}

export const UPDATE_QI_XIAO = async function (data) {
    return await API.post(`${prefix}/configs/update-qi-xiao`, data);
}

export const UPDATE_WU_XIAO = async function (data) {
    return await API.post(`${prefix}/configs/update-wu-xiao`, data);
}

export const UPDATE_SAN_XIAO = async function (data) {
    return await API.post(`${prefix}/configs/update-san-xiao`, data);
}

export const GET_LAST_BATCH_NUMBER = async function () {
    return await API.get(`${prefix}/tou-zi-ping-te/last-batch-number`);
}

export const GET_TOUZI_PINGTE = async function (page, perPage) {
    return await API.get(`${prefix}/tou-zi-ping-te`, {
        params: {
            page: page,
            perPage: perPage,
        }
    });
}

export const CREATE_TOUZI_PINGTE = async function (data) {
    return await API.post(`${prefix}/tou-zi-ping-te/create`, data);
}

export const UPDATE_TOUZI_PINGTE = async function (id, data) {
    return await API.post(`${prefix}/tou-zi-ping-te/${id}/update`, data);
}

export const DELETE_TOUZI_PINGTE = async function (id) {
    return await API.post(`${prefix}/tou-zi-ping-te/${id}/delete`);
}