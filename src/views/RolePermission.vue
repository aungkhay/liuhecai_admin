<template>
    <div>
        <v-btn v-if="checkPermission('role-add')" color="primary" class="mb-2" @click="dialog = true"><v-icon>mdi-plus</v-icon> 添加</v-btn>
        <v-table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>角色编码</th>
                    <th style="min-width: 150px;">角色名称</th>
                    <th style="min-width: 170px;">更新时间</th>
                    <th style="min-width: 300px;">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="role in roles" :key="role.id">
                    <td>{{ role.id }}</td>
                    <td>{{ role.code }}</td>
                    <td>{{ role.name }}</td>
                    <td>{{ $filters.formatFullDate(role.updatedAt) }}</td>
                    <td>
                        <v-btn v-if="checkPermission('role-update')" color="success" variant="tonal" size="small" @click="editRole(role)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                        <v-btn v-if="checkPermission('role-assign-permission')" color="primary" variant="tonal" size="small" class="mx-2" @click="openPermissionDialog(role)"><v-icon>mdi-cog</v-icon> 权限配置</v-btn>
                        <v-btn v-if="checkPermission('role-delete')" color="error" variant="tonal" size="small" @click="openDeleteDialog(role)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
                    </td>
                </tr>
            </tbody>
        </v-table>

        <v-dialog v-model="permissionDialog" max-width="500px" persistent>
            <v-card class="pa-2">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>权限配置</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="permissionDialog = false;">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="py-0 px-3">
                    <div>当前角色: {{ selectedRole.name }}</div>
                    <div class="pa-3 rounded border" style="height: 500px; overflow-y: auto;">
                        <v-expansion-panels v-model="panel" multiple hide-actions elevation="0">
                            <v-expansion-panel v-for="(perm, index) in allPermissions" :key="index">
                                <v-expansion-panel-title class="px-2" :height="15">
                                    <div class="d-flex align-center justify-space-between">
                                        <v-checkbox
                                            v-model="perm.selected"
                                            :value="perm.id"
                                            hide-details
                                            color="primary"
                                            @click.stop
                                            density="compact"
                                            @click="toggleGroup(perm, index)"
                                        />
                                        <span class="text-primary font-weight-bold">{{ perm.group }}</span>
                                    </div>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <div class="my-1" v-for="(permission, i) in perm.permissions" :key="i">
                                        <v-checkbox
                                            v-model="permission.selected"
                                            :label="permission.title"
                                            :value="permission.name"
                                            hide-details
                                            color="primary"
                                            class="mt-n3"
                                            density="compact"
                                            @click="togglePermission(index, permission, i)"
                                        />
                                    </div>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </div>
                    <div class="d-flex justify-end my-2">
                        <v-btn color="grey-darken-3" variant="outlined" class="mr-2" :disabled="isSaving" @click="permissionDialog = false">取消</v-btn>
                        <v-btn color="primary" variant="flat" :disabled="isSaving" :loading="isSaving" @click="assingRolePermissions()">保存</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialog" max-width="400px" persistent>
            <v-card class="pa-2">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ selectedRole ? '编辑角色' : '添加角色' }}</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="dialog = false; resetRoleObj();">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="py-0 px-3">
                    <v-text-field
                        v-model="roleObj.code"
                        label="角色编码"
                        variant="outlined"
                        :error-messages="v$.code.$errors.map(e => e.$message)"
                        @input="v$.code.$touch"
                        @blur="v$.code.$touch"
                        class="mt-3"
                        @keyup="isCodeError = false"
                        :readonly="selectedRole != null"
                    />
                    <v-text-field
                        v-model="roleObj.name"
                        label="角色名称"
                        variant="outlined"
                        :error-messages="v$.name.$errors.map(e => e.$message)"
                        @input="v$.name.$touch"
                        @blur="v$.name.$touch"
                        @keyup="isNameError = false"
                    />
                </v-card-text>
                <v-card-actions class="justify-end mt-3">
                    <v-btn color="grey-darken-3" variant="outlined" class="mr-2" :disabled="isSaving" @click="dialog = false; resetRoleObj();">取消</v-btn>
                    <v-btn color="red-darken-1" variant="flat" :disabled="isSaving || v$.$invalid" :loading="isSaving" @click="saveRole()">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" max-width="400px" persistent>
            <v-card class="pa-2">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>删除角色</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="deleteDialog = false; resetRoleObj();">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div>您确定要删除角色 "<span class="text-primary">{{ selectedRole?.name }}</span>" 吗？</div>
                    <div class="d-flex justify-end mt-3">
                        <v-btn color="grey-darken-3" variant="outlined" class="mr-2" :disabled="isSaving" @click="deleteDialog = false; resetRoleObj();">取消</v-btn>
                        <v-btn color="error" variant="flat" :disabled="isSaving" :loading="isSaving" @click="deleteRole()">确定</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { ASSIGN_ROLE_PERMISSIONS, CREATE_ROLE, DELETE_ROLE, PERMISSION_LIST, ROLE_LIST, ROLE_PERMISSIONS, UPDATE_ROLE } from '../js/api';
import { useToast } from 'vue-toastification';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { checkPermission } from '../js/common';

const toast = useToast();
const roles = ref([]);
const dialog = ref(false);
const permissionDialog = ref(false);
const deleteDialog = ref(false);
const isSaving = ref(false);
const selectedRole = ref(null);
const allPermissions = ref([]);
const panel = ref([]);
const loadingRolePermissions = ref(false);

const roleObj = ref({
    name: '',
    code: '',
});
const isNameError = ref(false);
const isCodeError = ref(false);
const rules = ref({
    name: { required: helpers.withMessage('角色名称不能为空', required) },
    code: { required: helpers.withMessage('角色编码不能为空', required) }
});
const v$ = useVuelidate(rules.value, roleObj.value);
const nameError = (value) => {
    return !isNameError.value;
}
const codeError = (value) => {
    return !isCodeError.value;
}

const fetchRoles = async () => {
    const res = await ROLE_LIST();
    if (res.code == 1000) {
        roles.value = res.data;
    } else {
        toast.error(res.message || 'Failed to fetch roles');
    }
}

const fetchPermissions = async () => {
    const res = await PERMISSION_LIST();
    if (res.code == 1000) {
        formatPermissions(res.data, []);
    } else {
        toast.error(res.message || 'Failed to fetch permissions');
    }
}
const openPermissionDialog = (role) => {
    selectedRole.value = role;
    permissionDialog.value = true;
    fetchRolePermissions(role.id);
}

const fetchRolePermissions = async (roleId) => {
    loadingRolePermissions.value = true;
    const res = await ROLE_PERMISSIONS(roleId);
    if (res.code == 1000) {
        formatPermissions(allPermissions.value, res.data);
    } else {
        toast.error(res.message || 'Failed to fetch role permissions');
    }
    loadingRolePermissions.value = false;
}

const  formatPermissions = (data = [], roleHasPermissions = []) => {
    const newData = data.map(d => {
        const permissions = d.permissions.map(p => {
            p.selected = roleHasPermissions.includes(p.id) ? p.name : '';
            return p;
        })
        const permLength = permissions.length;
        const selected = permissions.filter(p => p.selected != '');
        if(permLength == selected.length) {
            d.selected = d.id;
        } else {
            d.selected = '';
        }

        d.permissions = permissions;
        return d;
    })
    allPermissions.value = newData;
}


const toggleGroup = (g, index) => {
    allPermissions.value[index].selected = g.selected == '' ? g.name : '';
    allPermissions.value[index].permissions.forEach(perm => {
        perm.selected = g.selected == '' ? '' : perm.name;
    });
}

const togglePermission = (groupIndex, p, index) => {
    
    const group = allPermissions.value[groupIndex];
    group.permissions[index].selected = p.selected == '' ? p.name : '';
        
    const permLength = group.permissions.length;
    const selected = group.permissions.filter(p => p.selected != '');
    if(permLength == selected.length) {
        group.selected = group.id;
    } else {
        group.selected = '';
    }
}

const assingRolePermissions = async () => {
    isSaving.value = true;

    let selectedPermissions = [];
    for (let i = 0; i < allPermissions.value.length; i++) {
        const group = allPermissions.value[i];
        if(group.selected != '') {
            for (let j = 0; j < group.permissions.length; j++) {
                const perm = group.permissions[j];
                selectedPermissions.push(perm.id);
            }
        } else {
            for (let j = 0; j < group.permissions.length; j++) {
                const perm = group.permissions[j];
                if(perm.selected != '') {
                    selectedPermissions.push(perm.id);
                }
            }
        }
    }

    const res = await ASSIGN_ROLE_PERMISSIONS(selectedRole.value.id, selectedPermissions);
    if (res.code == 1000) {
        toast.success('权限分配成功');
    } else {
        toast.error(res.message || '权限分配失败');
    }
    isSaving.value = false;
    permissionDialog.value = false;
}

const resetRoleObj = () => {
    roleObj.value.name = '';
    roleObj.value.code = '';
    isNameError.value = false;
    isCodeError.value = false;
    selectedRole.value = null;
    v$.value.$reset();
}

const saveRole = async () => {
    isSaving.value = true;
    if(!v$.value.$invalid) {
        let res = null;
        if(selectedRole.value == null) {
            res = await CREATE_ROLE(roleObj.value);
        } else {
            res = await UPDATE_ROLE(selectedRole.value.id, roleObj.value);
        }

        if(res.code == 1002) {
            res.errors.forEach(err => {
                if (err.field == 'name') {
                    isNameError.value = true;
                    rules.value.name.nameError = helpers.withMessage(err.msg, nameError)
                }
                if (err.field == 'code') {
                    isCodeError.value = true;
                    rules.value.code.codeError = helpers.withMessage(err.msg, codeError)
                }
            });
            isSaving.value = false;
        } else {
            await fetchRoles();
            dialog.value = false;
            isSaving.value = false;
            toast.success(res.message);
        }
    }
}

const editRole = (role) => {
    selectedRole.value = role;
    roleObj.value.name = role.name;
    roleObj.value.code = role.code;
    dialog.value = true;
}

const openDeleteDialog = (role) => {
    selectedRole.value = role;
    deleteDialog.value = true;
}

const deleteRole = async () => {
    isSaving.value = true;

    const res = await DELETE_ROLE(selectedRole.value.id);
    if (res.code == 1000) {
        await fetchRoles();
        deleteDialog.value = false;
        selectedRole.value = null;
        toast.success(res.message);
    } else {
        toast.error(res.message || 'Failed to delete role');
    }
    isSaving.value = false;
}

onMounted(() => {
    fetchRoles();
    fetchPermissions();
});
</script>