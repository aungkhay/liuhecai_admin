<template>
    <div>
        <v-btn v-if="checkPermission('touzi-pingte-create')" color="primary" @click="dialog = true" class="mb-2"><v-icon>mdi-plus</v-icon> 添加</v-btn>

        <v-data-table-server
            v-model:page="page"
            v-model:items-per-page="perPage"
            :headers="headers"
            :items="records"
            :items-length="total"
            :loading="loading"
            class="table1"
            :items-per-page-options="[5, 10, 15, 20, 50]"
            @update:options="getRecords"
            hover
        >
            <template #loading>
                <v-skeleton-loader type="table-row@3"/>
            </template>
            <template #item.batch_number="{ item }">
                {{ String(item.batch_start).padStart(3, '0') + ' - ' + String(item.batch_end).padStart(3, '0') }}
            </template>
            <template #item.is_finished="{ item }">
                <v-chip v-if="item.is_finished == 0" color="warning">未完成</v-chip>
                <v-chip v-else color="success">已完成</v-chip>
            </template>
            <template #item.createdAt="{ item }">
                {{ $filters.formatFullDate(item.createdAt) }}
            </template>
            <template #item.actions="{ item }">
                <v-btn v-if="checkPermission('touzi-pingte-delete')" size="small" variant="tonal" color="error" :disabled="item.is_finished" @click="deleteRecord(item.id)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
            </template>
        </v-data-table-server>

        <v-dialog 
            v-model="dialog"
            width="350"
            persistent
        >
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ selectedId !== 0 ? '编辑' : '添加' }}</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="resetForm(); dialog = false;">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div v-if="selectedId == 0">
                        <!-- <span>{{ String(obj.batch_start).padStart(3, '0') }}</span> - <span>{{ String(obj.batch_end).padStart(3, '0') }}</span>期 -->
                        <div class="d-flex">
                            <div class="w-50 pr-1">
                                <v-text-field 
                                    v-model="obj.batch_start"
                                    label="开始期号"
                                    variant="outlined"
                                    :error-messages="v$.batch_start.$errors.map(e => e.$message)"
                                    @input="v$.batch_start.$touch"
                                    @blur="v$.batch_start.$touch"
                                />
                            </div>
                            <div class="w-50 pl-2">
                                <v-text-field
                                    v-model="obj.batch_end"
                                    label="结束期号"
                                    variant="outlined"
                                    :error-messages="v$.batch_end.$errors.map(e => e.$message)"
                                    @input="v$.batch_end.$touch"
                                    @blur="v$.batch_end.$touch"
                                />
                            </div>
                        </div>
                    </div>
                    <v-select 
                        :items="zodiacs" 
                        v-model="obj.zodiac_name" 
                        label="属性选择"
                        item-title="name"
                        item-value="name"
                        variant="outlined"
                        :error-messages="v$.zodiac_name.$errors.map(e => e.$message)"
                        @input="v$.zodiac_name.$touch"
                        @blur="v$.zodiac_name.$touch"
                    ></v-select>
                    <div class="d-flex justify-end mt-3">
                        <v-btn color="primary" :disabled="isSaving || v$.$invalid" @click="saveRecord"><v-icon class="mr-2">mdi-content-save-outline</v-icon> {{ selectedId == 0 ? '保存' : '更新' }}</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="deleteDialog"
            width="300"
            persistent
        >
            <v-card>
                <v-card-title class="text-h6">确认删除吗？</v-card-title>
                <v-card-actions class="d-flex justify-end">
                    <v-btn variant="text" :disabled="isDeleting" @click="deleteDialog = false">取消</v-btn>
                    <v-btn color="error" :disabled="isDeleting" @click="confirmDelete"><v-icon class="mr-2">mdi-delete</v-icon> 删除</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { GET_LAST_BATCH_NUMBER, GET_TOUZI_PINGTE, CREATE_TOUZI_PINGTE, UPDATE_TOUZI_PINGTE, DELETE_TOUZI_PINGTE } from '../js/api';
import { useZodiacStore } from '../stores/zodiac';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { useToast } from 'vue-toastification';
import { checkPermission } from '../js/common';

const toast = useToast();
const zodiacStore = useZodiacStore();
const zodiacs = zodiacStore.getZodiacs;

const records = ref([]);
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const totalPage = ref(0);
const isLoading = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const selectedId = ref(0);
const lastBatchNumber = ref(0);
const loading = ref(false);
const headers = ref([
    { title: '序列', value: 'index', fixed: 'start', width: 60 },
    { title: '期号', value: 'batch_number', fixed: 'start', width: 150 },
    { title: '生肖', value: 'zodiac_name', minWidth: 80 },
    { title: '开球数', value: 'open_count', minWidth: 100 },
    { title: '状态', value: 'is_finished', minWidth: 100 },
    { title: '创建时间', value: 'createdAt', minWidth: 170 },
    { title: '操作', value: 'actions', minWidth: 150 },
]);

const obj = ref({
    year: zodiacStore.currentYear,
    batch_start: 1,
    batch_end: 2,
    zodiac_name: ''
})

const rules = ref({
    batch_start: { required: helpers.withMessage('开始期号不能为空', required) },
    batch_end: { required: helpers.withMessage('结束期号不能为空', required) },
    zodiac_name: { required: helpers.withMessage('属性不能为空', required) },
});
const v$ = useVuelidate(rules.value, obj.value);

const getRecords = async () => {
    isLoading.value = true;
    const res = await GET_TOUZI_PINGTE(page.value, perPage.value);
    if (res.code == 1000) {
        records.value = res.data.records.map((record, index) => ({
            ...record,
            index: (page.value - 1) * perPage.value + index + 1
        }));
        total.value = res.data.meta.total;
    }
    isLoading.value = false;
}

const resetForm = () => {
    selectedId.value = 0;
    obj.value.year = zodiacStore.currentYear;
    obj.value.batch_start = lastBatchNumber.value + 1;
    obj.value.batch_end = lastBatchNumber.value + 2;
    obj.value.zodiac_name = '';
    v$.value.$reset();
}

const fetchLastBatchNumber = async () => {
    const res = await GET_LAST_BATCH_NUMBER();
    if (res.code == 1000) {
        const last = Number(res.data.last_batch_number);
        lastBatchNumber.value = last;
        obj.value.batch_start = last + 1;
        obj.value.batch_end = last + 2;
    }
}

const saveRecord = async () => {
    if (isSaving.value || v$.value.$invalid) {
        return;
    }
    isSaving.value = true;

    const res = selectedId.value == 0 
        ? await CREATE_TOUZI_PINGTE(obj.value) 
        : await UPDATE_TOUZI_PINGTE(selectedId.value, obj.value);

    if (res.code == 1000) {
        dialog.value = false;
        resetForm();
        await getRecords();
        await fetchLastBatchNumber();
        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    isSaving.value = false;
}

const goToFirst = () => {
    page.value = 1;
    getRecords();
}
const goToLast = () => {
    page.value = totalPage.value;
    getRecords();
}
const switchPage = () => {
    getRecords();
}

const deleteRecord = async (id) => {
    selectedId.value = id;
    deleteDialog.value = true;
}

const confirmDelete = async () => {
    isDeleting.value = true;
    const res = await DELETE_TOUZI_PINGTE(selectedId.value);
    if (res.code == 1000) {
        deleteDialog.value = false;
        selectedId.value = 0;
        await getRecords();
        await fetchLastBatchNumber();
        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    isDeleting.value = false;
}

onMounted(() => {
    fetchLastBatchNumber();
});
</script>