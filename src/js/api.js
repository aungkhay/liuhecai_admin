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

export const CHECK_BET_NUMBERS = async function (numbers) {
    return await API.post(`${prefix}/check-number-in-bets`, numbers);
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

export const CALCULATE_RECORD = async function (id) {
    return await API.post(`${prefix}/lottery-records/${id}/calculate`);
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

export const GET_DOUBLE_COLOR = async function (page, perPage) {
    return await API.get(`${prefix}/double-color`, {
        params: {
            page: page,
            perPage: perPage,
        }
    });
}

export const CREATE_DOUBLE_COLOR = async function (data) {
    return await API.post(`${prefix}/double-color/create`, data);
}

export const UPDATE_DOUBLE_COLOR = async function (id, data) {
    return await API.post(`${prefix}/double-color/${id}/update`, data);
}

export const DELETE_DOUBLE_COLOR = async function (id) {
    return await API.post(`${prefix}/double-color/${id}/delete`);
}

export const GET_BET_CATEGORIES = async () => {
    return await API.get(`${prefix}/bet/categories`);
}

export const GET_BET_ITEMS = async (subId) => {
    return await API.get(`${prefix}/bet/items/${subId}`);
}

export const DO_BET = async (data) => {
    return await API.post(`${prefix}/bet/do-bet`, data);
}

export const BET_HISTORY = async (page = 1, perPage = 10, filters = {}) => {
    return await API.get(`${prefix}/bet/history`, {
        params: {
            page: page,
            perPage: perPage,
            ...filters
        }
    });
}

export const BET_SUMMARY = async () => {
    return await API.get(`${prefix}/bet/summary`);
}

export const REFERENCE_LINKS = async () => {
    return await API.get(`${prefix}/reference-links`);
}

export const CREATE_REFERENCE_LINK = async (data) => {
    return await API.post(`${prefix}/reference-links/create`, data);
}

export const UPDATE_REFERENCE_LINK = async (id, data) => {
    return await API.post(`${prefix}/reference-links/${id}/update`, data);
}

export const DELETE_REFERENCE_LINK = async (id) => {
    return await API.post(`${prefix}/reference-links/${id}/delete`);
}

export const UPLOAD_REFERENCE_LINK_IMAGE = async (id, formData) => {
    const config = {
        method: 'post',
        url: `${prefix}/reference-links/${id}/upload`,
        data: formData
    }
    return API(config);
}

export const ROLE_LIST = async () => {
    return await API.get(`${prefix}/roles/list`);
}

export const PERMISSION_LIST = async () => {
    return await API.get(`${prefix}/roles/permission-list`);
}

export const ROLE_PERMISSIONS = async (id) => {
    return await API.get(`${prefix}/roles/${id}/permissions`);
}

export const CREATE_ROLE = async (data) => {
    return await API.post(`${prefix}/roles/create`, data);
}

export const UPDATE_ROLE = async (id, data) => {
    return await API.post(`${prefix}/roles/${id}/update`, data);
}

export const DELETE_ROLE = async (id) => {
    return await API.post(`${prefix}/roles/${id}/delete`);
}

export const ASSIGN_ROLE_PERMISSIONS = async (id, permissionIds) => {
    return await API.post(`${prefix}/roles/${id}/assign-permissions`, { permissionIds });
}

export const GET_USERS = async (filters = {}) => {
    return await API.get(`${prefix}/users`, {
        params: filters
    });
}

export const CREATE_USER = async (data) => {
    return await API.post(`${prefix}/users/create`, data);
}

export const CHANGE_USER_PASSWORD = async (id, newPassword) => {
    return await API.post(`${prefix}/users/${id}/change-password`, { new_password: newPassword });
}

export const CHANGE_USER_STATUS = async (id) => {
    return await API.post(`${prefix}/users/${id}/change-status`);
}

export const DELETE_USER = async (id) => {
    return await API.post(`${prefix}/users/${id}/delete`);
}

export const ASSIGN_USER_ROLES = async (id, roleIds) => {
    return await API.post(`${prefix}/users/${id}/assign-roles`, { roleIds });
}

export const LOG_LIST = async (filters = {}) => {
    return await API.get(`${prefix}/logs`, {
        params: filters
    });
}