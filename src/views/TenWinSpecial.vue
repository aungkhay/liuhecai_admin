<template>
    <div>
        <v-btn v-if="checkPermission('ten-win-special-create')" color="primary" @click="dialog = true" class="mb-2"><v-icon>mdi-plus</v-icon> 添加</v-btn>

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
            <template #item.numbers="{ item }">
                {{ item.numbers.replace(/-/g, ',') }}
            </template>
            <template #item.result_number="{ item }">
                <span v-if="item.result_number">{{ item.result_number }} {{ item.result_zodiac }}</span>
                <span v-else class="text-grey">-</span>
            </template>
            <template #item.is_matched="{ item }">
                <v-chip v-if="item.is_matched" color="success">准</v-chip>
                <v-chip v-else-if="item.result_number == 0" color="warning">未开奖</v-chip>
                <v-chip v-else color="error">不准</v-chip>
            </template>
            <template #item.createdAt="{ item }">
                {{ $filters.formatFullDate(item.createdAt) }}
            </template>
            <template #item.actions="{ item }">
                <v-btn v-if="checkPermission('ten-win-special-update')" size="small" variant="tonal" color="success" class="mr-2" :disabled="item.result_number > 0" @click="editRecord(item)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                <v-btn v-if="checkPermission('ten-win-special-delete')" size="small" variant="tonal" color="error" :disabled="item.result_number > 0" @click="deleteRecord(item)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
            </template>
        </v-data-table-server>

        <v-dialog v-model="dialog" width="500" persistent>
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ selectedRecord ? '编辑' : '添加' }}</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="resetForm();">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-text-field
                        label="期号"
                        v-model="obj.batch_number"
                        variant="outlined"
                        :error-messages="v$.batch_number.$errors.map(e => e.$message)"
                        @input="v$.batch_number.$touch"
                        @blur="v$.batch_number.$touch"
                        class="mb-3"
                    ></v-text-field>

                    <v-text-field
                        label="号码（10个号码用-分隔）"
                        v-model="obj.numbers"
                        variant="outlined"
                        placeholder="例如：01-02-03-04-05-06-07-08-09-10"
                        :error-messages="v$.numbers.$errors.map(e => e.$message)"
                        @input="v$.numbers.$touch"
                        @blur="v$.numbers.$touch"
                        class="mb-3"
                    ></v-text-field>

                    <div class="d-flex justify-end mt-3">
                        <v-btn color="primary" :disabled="isSaving || v$.$invalid" @click="saveRecord"><v-icon class="mr-2">mdi-content-save-outline</v-icon> {{ selectedRecord ? '更新' : '保存' }}</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>

         <v-dialog
            v-model="deleteDialog"
            width="350"
            persistent
        >
            <v-card>
                <v-card-title>删除记录</v-card-title>
                <v-card-text>您确定要删吗？</v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="outlined" :disabled="isDeleting" @click="resetForm()">取消</v-btn>
                    <v-btn color="error" variant="tonal" :disabled="isDeleting" @click="confirmDelete"><v-icon class="mr-2">mdi-delete</v-icon> 删除</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { checkPermission } from '../js/common';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { useToast } from 'vue-toastification';
import { CREATE_TEN_WIN_SPECIAL, DELETE_TEN_WIN_SPECIAL, GET_PLATFORM_LAST_BATCH_NUMBER, GET_TEN_WIN_SPECIALS, UPDATE_TEN_WIN_SPECIAL } from '../js/api';

const toast = useToast();
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const records = ref([]);
const loading = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const selectedRecord = ref(null);
const lastBatchNumber = ref(0);
const headers = ref([
    { title: '序列', value: 'index', fixed: 'start', width: 60 },
    { title: '期号', value: 'batch_number', fixed: 'start', width: 120 },
    { title: '号码', value: 'numbers', minWidth: 200 },
    { title: '结果', value: 'result_number', minWidth: 100 },
    { title: '状态', value: 'is_matched', minWidth: 100 },
    { title: '创建时间', value: 'createdAt', minWidth: 170 },
    { title: '操作', value: 'actions', minWidth: 180 }
]);
const obj = ref({
    batch_number: '',
    numbers: ''
});

const rules = ref({
    batch_number: { required: helpers.withMessage('期号不能为空', required) },
    // numbers format 10 numbers separated by -
    numbers: { 
        required: helpers.withMessage('号码不能为空', required),
        validFormat: helpers.withMessage('号码格式不正确，应该是10个号码用-分隔', value => {
            if (!value) return true; // 让 required 验证器处理空值
            const parts = value.split('-');
            return parts.length === 10 && parts.every(num => /^\d+$/.test(num) && Number(num) >= 1 && Number(num) <= 49);
        })
    }
});
const v$ = useVuelidate(rules.value, obj.value);

const resetForm = () => {
    obj.value = {
        batch_number: '',
        numbers: ''
    };
    selectedRecord.value = null;
    dialog.value = false;
    deleteDialog.value = false;
    v$.value.$reset();
};

const fetchLastBatchNumber = async () => {
    const res = await GET_PLATFORM_LAST_BATCH_NUMBER();
    if (res.code == 1000) {
        const last = Number(res.data.last_batch_number);
        lastBatchNumber.value = last + 1;
        obj.value.batch_number = last + 1;
    }
}

const getRecords = async () => {
    loading.value = true;
    const res = await GET_TEN_WIN_SPECIALS(page.value, perPage.value);
    if (res.code == 1000) {
        records.value = res.data.records.map((record, index) => ({
            ...record,
            index: (page.value - 1) * perPage.value + index + 1
        }));
        total.value = res.data.meta.total;
    }
    loading.value = false;
}

const saveRecord = async () => {
    isSaving.value = true;
    try {
        let res;
        const data = {
            batch_number: obj.value.batch_number,
            numbers: obj.value.numbers.split('-').map(num => Number(num.trim()))
        };

        if(selectedRecord.value) {
            res = await UPDATE_TEN_WIN_SPECIAL(selectedRecord.value.id, data);
        } else {
            res = await CREATE_TEN_WIN_SPECIAL(data);
        }
        if (res.code === 1000) {
            await getRecords();
            await fetchLastBatchNumber();
            resetForm();
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
    } catch (error) {
        console.error(error);
    } finally {
        isSaving.value = false;
    }
}

const editRecord = (record) => {
    selectedRecord.value = record;
    obj.value.batch_number = record.batch_number;
    obj.value.numbers = record.numbers;
    v$.value.$reset();
    dialog.value = true;
}

const deleteRecord = (record) => {
    selectedRecord.value = record;
    deleteDialog.value = true;
}

const confirmDelete = async () => {
    if (isDeleting.value) return;
    isDeleting.value = true;
    try {
        const res = await DELETE_TEN_WIN_SPECIAL(selectedRecord.value.id);
        if (res.code === 1000) {
            await getRecords();
            resetForm();
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
    } catch (error) {
        console.error(error);
    } finally {
        isDeleting.value = false;
    }
}

onMounted(() => {
    fetchLastBatchNumber();
});
</script>