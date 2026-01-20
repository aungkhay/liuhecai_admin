<template>
    <div class="fill-height" style="position: relative;">
        <div class="fill-height" id="loginbg"></div>
        <div class="fill-height" id="loginBlur"></div>
        <div class="fill-height w-100 d-flex justify-center align-center">
            <v-card class="rounded-lg" :class="xs ? 'w-100 pa-2' : mdAndDown ? 'w-50 pa-5' : 'w-25 pa-5'" id="loginform">
                <v-card-text>
                    <div class="text-h4 font-weight-bold">登录</div>
                    <form class="mt-10">
                        <v-text-field
                            v-model="user.username"
                            prepend-inner-icon="mdi-account"
                            variant="outlined"
                            label="用户名"
                            :error-messages="v$.username.$errors.map(e => e.$message)"
                            @input="v$.username.$touch"
                            @blur="v$.username.$touch"
                            @keyup="isUsernameError = false"
                        >
                        </v-text-field>
                        <v-text-field
                            v-model="user.password"
                            :type="isShow ? 'text' : 'password'"
                            prepend-inner-icon="mdi-key"
                            :append-inner-icon="isShow ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append-inner="isShow = !isShow"
                            variant="outlined"
                            label="密码"
                            :error-messages="v$.password.$errors.map(e => e.$message)"
                            @input="v$.password.$touch"
                            @blur="v$.password.$touch"
                            @keyup="isPasswordError = false"
                            class="my-5"
                        >
                        </v-text-field>
                        <v-text-field
                            v-model="user.recaptcha"
                            variant="outlined"
                            label="验证码"
                            :error-messages="v$.recaptcha.$errors.map(e => e.$message)"
                            @input="v$.recaptcha.$touch"
                            @blur="v$.recaptcha.$touch"
                            @keyup="isRecaptchaError = false"
                            id="recaptcha-input"
                        >
                            <template v-slot:append>
                                <div id="recaptcha-size" @click="getRecaptcha">
                                    <Recaptcha :identify-code="recaptcha" :content-width="100"></Recaptcha>
                                </div>
                            </template>
                        </v-text-field>
                        <v-btn 
                            block 
                            :color="isLoading || v$.$invalid ? 'grey-darken-4' : 'primary'"
                            size="x-large" 
                            class="mt-10"
                            type="submit" 
                            :loading="isLoading" 
                            :disabled="isLoading || v$.$invalid" 
                            @click="login"
                        >登录</v-btn>
                    </form>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script setup>
import Recaptcha from '@/components/Recaptcha.vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers, maxLength, minLength, createI18nMessage } from '@vuelidate/validators';
import { GET_RECAPTCHA, LOGIN, PROFILE } from '@/js/api';
import { useRoute } from 'vue-router';
import { onBeforeMount, onMounted, ref } from 'vue';
import { useDisplay } from 'vuetify/lib/framework.mjs';
import router from '@/routers'
import { useToast } from "vue-toastification";

const { mdAndUp, mdAndDown, xs, smAndDown } = useDisplay();

const toast = useToast();
const route = useRoute();
const isLoading = ref(false);
const isShow = ref(false);
const recaptcha = ref('');
const user = ref({
    username: '',
    password: '',
    recaptcha: '',
    uuid: ''
})
const isUsernameError = ref(false);
const isPasswordError = ref(false);
const isRecaptchaError = ref(false);

const rules = ref({
    username: { required: helpers.withMessage('用户名为必填项', required) },
    password: { required: helpers.withMessage('密码为必填项', required), },
    recaptcha: { required: helpers.withMessage('验证码为必填项', required) }
})

const v$ = useVuelidate(rules.value, user.value);

async function getRecaptcha() {
    const res = await GET_RECAPTCHA();
    if(res.code == 1000) {
        recaptcha.value = res.data.code;
        user.value.uuid = res.data.uuid;
    }
}

const usernameError = (value) => {
    return !isUsernameError.value;
}
const passwordError = (value) => {
    return !isPasswordError.value;
}
const recaptchaError = (value) => {
    return !isRecaptchaError.value;
}
const checkRecaptcha = (value) => {
    return value.toLowerCase() == recaptcha.value.toLowerCase() || !isRecaptchaError.value;
}

async function login() {

    const recap = document.getElementById('recaptcha-input');
    recap.blur();
    rules.value.recaptcha.validRecaptcha = helpers.withMessage('验证码无效', checkRecaptcha);

    if(!v$.value.$invalid) {
        isLoading.value = true;
        
        const res = await LOGIN(user.value.username, user.value.password, user.value.recaptcha, user.value.uuid);
        if(res.code == 1002) {
            res.errors.forEach(err => {
                if(err.field == 'username') {
                    isUsernameError.value = true;
                    rules.value.username.usernameError = helpers.withMessage(err.msg, usernameError)
                }
                if(err.field == 'password') {
                    isPasswordError.value = true;
                    console.log(err.msg);
                    rules.value.password.passwordError = helpers.withMessage(err.msg, passwordError)
                }
                if(err.field == 'recaptcha') {
                    isRecaptchaError.value = true;
                    rules.value.recaptcha.recaptchaError = helpers.withMessage(err.msg, recaptchaError)
                }
            });
            isLoading.value = false;
            await getRecaptcha();
        } else {
            toast.info(res.message);
            isLoading.value = false;
            await PROFILE();
            router.push('/admin/dashboard');
        }
    }
}

onBeforeMount(() => {
    getRecaptcha();
})
</script>

<style>
    #loginbg {
        position: absolute;
        background-image: url('../assets/loginbg.jpg');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        width: 100%; 
    }
    #loginBlur {
        position: absolute;
        background: #12121250;
        backdrop-filter: blur(5px);
        width: 100%; 
        height: 100%;
    }
    #loginform {
        background-color: rgba(128, 128, 128, 0.144);
        color: white;
    }
    #recaptcha-size {
        width: 100px;
        height: 100%;
        cursor: pointer;
    }
</style>