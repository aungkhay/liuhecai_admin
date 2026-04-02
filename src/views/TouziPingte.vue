<template>
    <div>
        <v-btn v-if="checkPermission('touzi-pingte-create')" color="primary" @click="dialog = true"><v-icon>mdi-plus</v-icon> 添加</v-btn>

        <v-table>
            <thead>
                <tr>
                    <th>序列</th>
                    <th>期号</th>
                    <th>生肖</th>
                    <th>开球数</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(record, index) in records" :key="index">
                    <td>{{ record.id }}</td>
                    <td>{{ String(record.batch_start).padStart(3, '0') }} - {{ String(record.batch_end).padStart(3, '0') }}</td>
                    <td>{{ record.zodiac_name }}</td>
                    <td>{{ record.open_count }}</td>
                    <td>
                        <v-chip v-if="record.is_finished == 0" color="warning">未完成</v-chip>
                        <v-chip v-else color="success">已完成</v-chip>
                    </td>
                    <td>{{ $filters.formatFullDate(record.createdAt) }}</td>
                    <td>
                        <v-btn v-if="checkPermission('touzi-pingte-delete') && !record.is_finished" size="small" variant="tonal" color="error" @click="deleteRecord(record.id)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
                    </td>
                </tr>
            </tbody>
        </v-table>

        <div class="d-flex justify-center mt-5">
            <v-pagination
                v-model="page"
                :length="totalPage"
                :total-visible="7"
                color="grey"
                rounded="circle"
                density="compact"
                active-color="primary"
                :show-first-last-page="true"
                @first="goToFirst"
                @last="goToLast"
                @update:model-value="switchPage"
            ></v-pagination>
        </div>

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
                    <div v-if="selectedId == 0" class="text-h6 border rounded-lg pa-3 mb-5">
                        <span>{{ String(obj.batch_start).padStart(3, '0') }}</span> - <span>{{ String(obj.batch_end).padStart(3, '0') }}</span>期
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

const obj = ref({
    year: zodiacStore.currentYear,
    batch_start: 1,
    batch_end: 2,
    zodiac_name: ''
})

const rules = ref({
    // batch_start: { required: helpers.withMessage('期号不能为空', required) },
    // batch_end: { required: helpers.withMessage('期号不能为空', required) },
    zodiac_name: { required: helpers.withMessage('属性不能为空', required) },
});
const v$ = useVuelidate(rules.value, obj.value);

const getRecords = async () => {
    isLoading.value = true;
    const res = await GET_TOUZI_PINGTE(page.value, perPage.value);
    if (res.code == 1000) {
        records.value = res.data.records;
        total.value = res.data.meta.total;
        totalPage.value = res.data.meta.totalPage;
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
        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    isDeleting.value = false;
}

onMounted(() => {
    fetchLastBatchNumber();
    getRecords();
});
</script>