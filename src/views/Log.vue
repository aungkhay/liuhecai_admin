<template>
    <div>
        <v-card class="pa-2 mb-2 border" :elevation="0">
            <v-row dense>
                <v-col cols="12" sm="6" md="2">
                    <v-text-field
                        v-model="filterObj.admin_phone"
                        label="管理员账号"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        @click:clear="filterObj.admin_phone = null"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filterObj.model"
                        :items="models"
                        item-title="name"
                        item-value="id"
                        label="模型"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        @click:clear="filterObj.model = null"
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filterObj.type"
                        :items="types"
                        item-title="name"
                        item-value="id"
                        label="类型"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        @click:clear="filterObj.type = null"
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-menu
                        v-model="fromDateMenu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                    >
                        <template #activator="{ props }">
                            <v-text-field
                                v-bind="props"
                                label="开始时间"
                                variant="outlined"
                                density="compact"
                                readonly
                                :model-value="formattedDate(filterObj.startTime)"
                                hide-details
                                clearable
                                @click:clear="filterObj.startTime = null"
                            ></v-text-field>
                        </template>

                        <v-date-picker
                            v-model="filterObj.startTime"
                            @update:model-value="fromDateMenu = false"
                        />
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-menu
                        v-model="toDateMenu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                    >
                        <template #activator="{ props }">
                            <v-text-field
                                v-bind="props"
                                label="结束时间"
                                variant="outlined"
                                density="compact"
                                readonly
                                :model-value="formattedDate(filterObj.endTime)"
                                hide-details
                                clearable
                                @click:clear="filterObj.endTime = null"
                            ></v-text-field>
                        </template>

                        <v-date-picker
                            v-model="filterObj.endTime"
                            @update:model-value="toDateMenu = false"
                        />
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-btn color="primary" variant="outlined" @click="fetchLogs()" class="mr-2"><v-icon>mdi-magnify</v-icon>搜索</v-btn>
                    <v-btn color="grey-darken-2" variant="outlined" @click="clearFilters()"><v-icon>mdi-refresh</v-icon>重置</v-btn>
                </v-col>
            </v-row>
        </v-card>

        <v-data-table-server
            v-model:page="page"
            v-model:items-per-page="perPage"
            :headers="headers"
            :items="logs"
            :items-length="total"
            :loading="loading"
            class="table1"
            :items-per-page-options="[5, 10, 15, 20, 50]"
            @update:options="fetchLogs"
            hover
        >
            <template #loading>
                <v-skeleton-loader type="table-row@3"/>
            </template>
            <template #item.createdAt="{ item }">
                {{ $filters.formatFullDate(item.createdAt) }}
            </template>
            <template #item.admin_name="{ item }">
                {{ item.admin ? item.admin.name : '-' }}
            </template>
            <template #item.admin_phone="{ item }">
                {{ item.admin ? item.admin.phone_number : '-' }}
            </template>
            <template #item.model="{ item }">
                {{ getModelName(item.model) }}
            </template>
            <template #item.type="{ item }">
                {{ getTypeName(item.type) }}
            </template>
            <template #item.actions="{ item }">
                <v-btn variant="tonal" size="small" color="primary" @click="() => { selectedLog = item; showLogDetail = true; }">内容</v-btn>
            </template>
        </v-data-table-server>

        <v-dialog v-model="showLogDetail" max-width="500">
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>操作内容</span>
                    <v-btn variant="flat" size="small" icon @click="showLogDetail = false; selectedLog = null;">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="px-2">
                    <v-table density="compact" height="400" fixed-header>
                        <thead>
                            <tr>
                                <th>Key</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody v-if="selectedLog?.content" class="font-mono text-sm">
                            <tr v-for="(value, key) in selectedLog.content" :key="key">
                                <td>{{ key }}</td>
                                <td>
                                    <div v-if="key == 'bets'">
                                        <div v-for="item in value.map(bet => `[金额：${bet.bet_amount}][赔率：${bet.odds}] ${bet.item_code}`)">{{ item }}</div>
                                    </div>
                                    <div v-else>{{ value }}</div>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { LOG_LIST } from '../js/api';
import { formattedDate } from '../js/common';

const loading = ref(false);
const logs = ref([]);
const page = ref(1);
const perPage = ref(10);
const totalPage = ref(0);
const total = ref(0);
const selectedLog = ref(null);
const showLogDetail = ref(false);

const headers = ref([
    { title: '列', value: 'index', fixed: 'start', width: 60 },
    { title: '管理员名称', value: 'admin_name', fixed: 'start', width: 150 },
    { title: '管理员账号', value: 'admin_phone', fixed: 'start', width: 150 },
    { title: '模型', value: 'model', minWidth: 120 },
    { title: '类型', value: 'type', minWidth: 150 },
    { title: '请求地址', value: 'url', minWidth: 300 },
    { title: 'IP地址', value: 'ip', minWidth: 150 },
    { title: '操作时间', value: 'createdAt', minWidth: 170 },
    { title: '操作', value: 'actions', fixed: 'end', minWidth: 100 },
]);

const models = ref([
    { id: 'Role', name: '角色' },
    { id: 'User', name: '管理员' },
    { id: 'Config', name: '配置' },
    { id: 'Banner', name: '轮播图' },
    { id: 'DoubleColor', name: '大神双波' },
    { id: 'Record', name: '开奖记录' },
    { id: 'ReferenceLink', name: '参考链接' },
    { id: 'ResultGuess', name: '发什么开什么' },
    { id: 'TouZiPingTe', name: '投注平特' },
    { id: 'Bet', name: '下注' },
]);
const types = ref([
    { id: 'create', name: '创建' },
    { id: 'update', name: '更新' },
    { id: 'delete', name: '删除' },
    { id: 'upload', name: '上传' },
    { id: 'assign-permission', name: '分配权限' },
    { id: 'change-password', name: '修改密码' },
    { id: 'change-status', name: '修改状态' },
    { id: 'assign-roles', name: '分配角色' },
]);
const fromDateMenu = ref(false);
const toDateMenu = ref(false);
const filterObj = ref({
    admin_phone: null,
    model: null,
    type: null,
    startTime: null,
    endTime: null,
});

const getModelName = (model) => {
    const found = models.value.find(m => m.id === model);
    return found ? found.name : model;
};
const getTypeName = (type) => {
    const found = types.value.find(t => t.id === type);
    return found ? found.name : type;
};

const clearFilters = () => {
    filterObj.value = {
        admin_phone: null,
        model: null,
        type: null,
        startTime: null,
        endTime: null,
    };
    page.value = 1;
    perPage.value = 10;
    fetchLogs();
};

const fetchLogs = async () => {
    loading.value = true;
    try {
        const res = await LOG_LIST({ page: page.value, perPage: perPage.value, ...filterObj.value });
        logs.value = res.data.logs.map((log, index) => ({
            ...log,
            index: (page.value - 1) * perPage.value + index + 1
        }));
        total.value = res.data.meta.total;
        totalPage.value = res.data.meta.totalPage;
    } catch (error) {
        console.error('获取日志列表失败:', error);
    } finally {
        loading.value = false;
    }
};
</script>