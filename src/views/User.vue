<template>
    <div>
        <v-btn v-if="checkPermission('user-add')" @click="dialog = true" class="mb-2" color="primary"><v-icon>mdi-plus</v-icon>添加</v-btn>
        <v-data-table-server
            v-model:page="page"
            v-model:items-per-page="perPage"
            :headers="headers"
            :items="users"
            :items-length="total"
            :loading="loading"
            class="table1"
            :items-per-page-options="[5, 10, 15, 20, 50]"
            @update:options="fetchUsers"
            hover
        >
            <template #loading>
                <v-skeleton-loader type="table-row@3"/>
            </template>
            <template #item.roles="{ item }">
                {{ item.roles && item.roles.length ? item.roles.map(role => role.name).join(', ') : item.id == 1 ? '总管理员' : '-' }}
            </template>
            <template #item.createdAt="{ item }">
                {{ $filters.formatFullDate(item.createdAt) }}
            </template>
            <template #item.actions="{ item }">
                <v-btn v-if="checkPermission('user-change-status')" size="small" variant="tonal" :color="item.status === 1 ? 'error' : 'success'" :disabled="item.id == 1" @click="changeStatus(item)">{{ item.status === 1 ? '禁用' : '启用' }}</v-btn>
                <v-btn v-if="checkPermission('user-delete')" size="small" variant="tonal" color="error" :disabled="item.id == 1" @click="selectedUser = item; deleteDialog = true" class="mx-1"><v-icon>mdi-delete</v-icon> 删除</v-btn>
                <v-btn v-if="checkPermission('user-change-password')" size="small" variant="tonal" color="purple" :disabled="!isSuperAdmin && item.id != 1" @click="selectedUser = item; changePasswordDialog = true" class="mr-1"><v-icon>mdi-lock</v-icon> 修改密码</v-btn>
                <v-btn v-if="checkPermission('user-assign-role')" size="small" variant="tonal" color="primary" :disabled="item.id == 1" @click="editRole(item)"><v-icon>mdi-lock-reset</v-icon> 切换角色</v-btn>
            </template>
        </v-data-table-server>

        <v-dialog v-model="dialog" persistent max-width="400">
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ selectedUser ? '编辑用户' : '添加用户' }}</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="dialog = false; resetUserObj();">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="userObj.name"
                        label="名称"
                        variant="outlined"
                        :error-messages="v$.name.$errors.map(e => e.$message)"
                        @input="v$.name.$touch"
                        @blur="v$.name.$touch"
                        @keyup="isNameError = false"
                    />
                    <v-text-field
                        v-model="userObj.phone"
                        label="手机号"
                        variant="outlined"
                        :error-messages="v$.phone.$errors.map(e => e.$message)"
                        @input="v$.phone.$touch"
                        @blur="v$.phone.$touch"
                        class="mt-3"
                        @keyup="isPhoneNumberError = false"
                    />
                    <v-text-field
                        v-model="userObj.password"
                        :type="showPassword ? 'text' : 'password'"
                        label="密码"
                        variant="outlined"
                        :error-messages="v$.password.$errors.map(e => e.$message)"
                        @input="v$.password.$touch"
                        @blur="v$.password.$touch"
                        class="mt-3"
                        @keyup="isPasswordError = false"
                        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append-inner="showPassword = !showPassword"
                    />
                    <v-select
                        v-model="userObj.role_ids"
                        :items="roles"
                        item-title="name"
                        item-value="id"
                        label="角色"
                        variant="outlined"
                        multiple
                        :error-messages="v$.role_ids.$errors.map(e => e.$message)"
                        @input="v$.role_ids.$touch"
                        @blur="v$.role_ids.$touch"
                        class="mt-3"
                        @change="isRoleIdsError = false"
                    />
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="flat" color="primary" :disabled="isSaving || v$.$invalid" :loading="isSaving" @click="saveUser">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="changePasswordDialog" max-width="400">
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>修改密码</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="changePasswordDialog = false; resetUserObj();">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div v-if="selectedUser">
                        <v-text-field
                            v-model="selectedUser.name"
                            label="用户名称"
                            type="text"
                            variant="outlined"
                            class="mt-3"
                            readonly
                        />
                    </div>
                    <v-text-field
                        v-model="passwordChangeObj.password"
                        label="新密码"
                        type="password"
                        variant="outlined"
                        :error-messages="v1$.password.$errors.map(e => e.$message)"
                        @input="v1$.password.$touch"
                        @blur="v1$.password.$touch"
                        class="mt-3"
                        @keyup="isPasswordError = false"
                    />
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="flat" color="primary" :disabled="isSaving || v1$.$invalid" :loading="isSaving" @click="changePassword">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="changeRoleDialog" max-width="400">
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>修改角色</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="changeRoleDialog = false; resetUserObj();">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div v-if="selectedUser">
                        <v-text-field
                            v-model="selectedUser.name"
                            label="用户名称"
                            type="text"
                            variant="outlined"
                            class="mt-3"
                            readonly
                        />
                    </div>
                    <!-- 角色选择组件 -->
                     <v-select
                        v-model="roleChangeObj.role_ids"
                        :items="roles"
                        item-title="name"
                        item-value="id"
                        label="角色"
                        variant="outlined"
                        multiple
                        :error-messages="v2$.role_ids.$errors.map(e => e.$message)"
                        @input="v2$.role_ids.$touch"
                        @blur="v2$.role_ids.$touch"
                        class="mt-3"
                        @change="isRoleIdsError = false"
                    />
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="flat" color="primary" :disabled="isSaving || v2$.$invalid" :loading="isSaving" @click="changeRole">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" max-width="400px" persistent>
            <v-card class="pa-2">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>删除用户</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="deleteDialog = false; resetUserObj();">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div>您确定要删除用户 "<span class="text-primary">{{ selectedUser?.name }}</span>" 吗？</div>
                    <div class="d-flex justify-end mt-3">
                        <v-btn color="grey-darken-3" variant="outlined" class="mr-2" :disabled="isSaving" @click="deleteDialog = false; resetUserObj();">取消</v-btn>
                        <v-btn color="error" variant="flat" :disabled="isSaving" :loading="isSaving" @click="deleteUser()">确定</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ASSIGN_USER_ROLES, CHANGE_USER_PASSWORD, CHANGE_USER_STATUS, CREATE_USER, DELETE_USER, GET_USERS, ROLE_LIST } from '../js/api';
import { useToast } from 'vue-toastification';
import { useUserStore } from '../stores/user';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { checkPermission } from '../js/common';

const toast = useToast();
const userStore = useUserStore();
const isSuperAdmin = computed(() => userStore.isSuperAdmin); 
const users = ref([]);
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const loading = ref(false);
const roles = ref([]);
const selectedUser = ref(null);
const dialog = ref(false);
const deleteDialog = ref(false);
const changePasswordDialog = ref(false);
const showPassword = ref(false);
const changeRoleDialog = ref(false);
const isSaving = ref(false);
const userObj = ref({
    name: '',
    phone: '',
    password: '',
    role_ids: [],
});
const isNameError = ref(false);
const isPhoneNumberError = ref(false);
const isPasswordError = ref(false);
const isRoleIdsError = ref(false);
const rules = ref({
    name: { required: helpers.withMessage('名称不能为空', required) },
    phone: { required: helpers.withMessage('手机号不能为空', required) },
    password: { 
        required: helpers.withMessage('密码不能为空', required),
        minLength: helpers.withMessage('密码至少6位', value => value && value.length >= 6) 
    },
    role_ids: { required: helpers.withMessage('请选择角色', required) },
});

const v$ = useVuelidate(rules.value, userObj.value);

const nameError = (value) => !isNameError.value;
const phoneNumberError = (value) => !isPhoneNumberError.value;
const passwordError = (value) => !isPasswordError.value;
const roleIdsError = (value) => !isRoleIdsError.value;
const passwordChangeObj = ref({
    password: '',
});
const rulesForPasswordChange = ref({
    password: { 
        required: helpers.withMessage('新密码不能为空', required),
        minLength: helpers.withMessage('新密码至少6位', value => value && value.length >= 6) 
    },
});
const v1$ = useVuelidate(rulesForPasswordChange.value, passwordChangeObj.value);

const roleChangeObj = ref({
    role_ids: [],
});
const rulesForRoleChange = ref({
    role_ids: { required: helpers.withMessage('请选择角色', required) },
});
const v2$ = useVuelidate(rulesForRoleChange.value, roleChangeObj.value);

const headers = ref([
    { title: '列', value: 'index', fixed: 'start', width: 60 },
    { title: '名称', value: 'name', fixed: 'start', minWidth: 150 },
    { title: '手机号', value: 'phone_number', minWidth: 150 },
    { title: '角色', value: 'roles', minWidth: 150 },
    { title: '创建时间', value: 'createdAt', minWidth: 170 },
    { title: '操作', value: 'actions', fixed: 'end', minWidth: 350 },
]);

const resetUserObj = () => {
    userObj.value = {
        name: '',
        phone: '',
        password: '',
        role_ids: [],
    };
    passwordChangeObj.value = {
        password: '',
    };
    roleChangeObj.value = {
        role_ids: [],
    };
    selectedUser.value = null;
    v$.value.$reset();
    v1$.value.$reset();
    v2$.value.$reset();
    isNameError.value = false;
    isPhoneNumberError.value = false;
    isPasswordError.value = false;
    isRoleIdsError.value = false;
}

const fetchRoles = async () => {
    try {
        const res = await ROLE_LIST();
        if (res.code == 1000) {
            roles.value = res.data;
        }
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}

const fetchUsers = async () => {
    loading.value = true;
    try {
        const res = await GET_USERS({
            page: page.value,
            per_page: perPage.value,
        });

        if (res.code == 1000) {
            users.value = res.data.users.map((user, index) => ({
                ...user, index,
                index: (page.value - 1) * perPage.value + index + 1
            }));
            total.value = res.data.meta.total;
        }
        
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        loading.value = false;
    }
}

const changeStatus = async (user) => {
    const res = await CHANGE_USER_STATUS(user.id);
    if (res.code == 1000) {
        fetchUsers();
        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
}

const saveUser = async () => {
    isSaving.value = true;
    try {
        const res = await CREATE_USER(userObj.value);
        if (res.code == 1002) {
            res.errors.forEach(err => {
                if (err.field == 'name') {
                    isNameError.value = true;
                    rules.value.name.nameError = helpers.withMessage(err.msg, nameError)
                } 
                if (err.field == 'phone') {
                    isPhoneNumberError.value = true;
                    rules.value.phone.phoneNumberError = helpers.withMessage(err.msg, phoneNumberError)
                } 
                if (err.field == 'password') {
                    isPasswordError.value = true;
                    rules.value.password.passwordError = helpers.withMessage(err.msg, passwordError)
                } 
                if (err.field == 'role_ids') {
                    isRoleIdsError.value = true;
                    rules.value.role_ids.roleIdsError = helpers.withMessage(err.msg, roleIdsError)
                }
            });
            isSaving.value = false;
        } else if (res.code == 1000) {
            toast.success(res.message);
            dialog.value = false;
            resetUserObj();
            fetchUsers();
        } else {
            toast.error(res.message);
        }
    } catch (error) {
        console.error('Error saving user:', error);
        toast.error('保存用户失败');
    } finally {
        isSaving.value = false;
    }
}

const changePassword = async () => {
    isSaving.value = true;
    try {
        const res = await CHANGE_USER_PASSWORD(selectedUser.value.id, passwordChangeObj.value.password);
        if (res.code == 1002) {
            res.errors.forEach(err => {
                if (err.field == 'new_password') {
                    isPasswordError.value = true;
                    rulesForPasswordChange.value.password.passwordError = helpers.withMessage(err.msg, passwordError)
                } 
            });
            isSaving.value = false;
        } else if (res.code == 1000) {
            toast.success(res.message);
            changePasswordDialog.value = false;
            resetUserObj();
            fetchUsers();
        } else {
            toast.error(res.message);
        }
    } catch (error) {
        console.error('Error changing password:', error);
        toast.error('修改密码失败');
    } finally {
        isSaving.value = false;
    }
}

const editRole = (user) => {
    selectedUser.value = user;
    roleChangeObj.value.role_ids = user.roles ? user.roles.map(role => role.id) : [];
    changeRoleDialog.value = true;
}

const changeRole = async () => {
    isSaving.value = true;
    try {
        const res = await ASSIGN_USER_ROLES(selectedUser.value.id, roleChangeObj.value.role_ids);
        if (res.code == 1000) {
            toast.success(res.message);
            changeRoleDialog.value = false;
            resetUserObj();
            fetchUsers();
        } else {
            toast.error(res.message);
        }
    } catch (error) {
        console.error('Error changing role:', error);
        toast.error('修改角色失败');
    } finally {
        isSaving.value = false;
    }
}

const deleteUser = async () => {
    isSaving.value = true;
    try {
        const res = await DELETE_USER(selectedUser.value.id);
        if (res.code == 1000) {
            toast.success(res.message);
            deleteDialog.value = false;
            resetUserObj();
            fetchUsers();
        } else {
            toast.error(res.message);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('删除用户失败');
    } finally {
        isSaving.value = false;
    }
}

onMounted(() => {
    fetchRoles();
});
</script>