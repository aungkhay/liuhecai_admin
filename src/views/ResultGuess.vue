<template>
    <div>
        <v-btn v-if="checkPermission('result-guess-create')" color="primary" @click="dialog = true" class="mb-2"><v-icon>mdi-plus</v-icon> 添加</v-btn>

        <v-data-table-server
            v-model:page="page"
            v-model:items-per-page="perPage"
            :headers="headers"
            :items="results"
            :items-length="total"
            :loading="loading"
            class="table1"
            :items-per-page-options="[5, 10, 15, 20, 50]"
            @update:options="fetchResults"
            hover
        >
            <template #loading>
                <v-skeleton-loader type="table-row@3"/>
            </template>
            <template #item.result="{ item }">
                {{ item.result_number == 0 ? '-' : String(item.result_number).padStart(2, '0') }} <span v-if="item.zodiac_name">{{ item.zodiac_name }}</span>
            </template>
            <template #item.result_match="{ item }">
                <v-chip v-if="item.result_match == 1" color="success">准</v-chip>
                <v-chip v-else-if="item.result_match == 2" color="error">不准</v-chip>
                <v-chip v-else color="warning">未开奖</v-chip>
            </template>
            <template #item.createdAt="{ item }">
                {{ $filters.formatFullDate(item.createdAt) }}
            </template>
            <template #item.actions="{ item }">
                <v-btn v-if="checkPermission('touzi-pingte-delete')" size="small" variant="tonal" color="error" :disabled="item.result_number > 0" @click="deleteRecord(item.id)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
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
                    <v-text-field
                        v-model="obj.batch_number"
                        label="期号"
                        variant="outlined"
                    ></v-text-field>
                    <v-autocomplete
                        v-model="obj.zodiac_attr"
                        label="属性选择"
                        :items="xAttributes"
                        item-title="attribute_name"
                        item-value="attribute_name"
                        variant="outlined"
                        :error-messages="v$.zodiac_attr.$errors.map(e => e.$message)"
                        @input="v$.zodiac_attr.$touch"
                        @blur="v$.zodiac_attr.$touch"
                    ></v-autocomplete>

                    <div class="d-flex justify-end mt-3">
                        <v-btn color="primary" :disabled="isSaving || v$.$invalid" @click="saveResult"><v-icon class="mr-2">mdi-content-save-outline</v-icon> {{ selectedId == 0 ? '保存' : '更新' }}</v-btn>
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
                <v-card-text>您确定要删除这条记录吗？</v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="outlined" :disabled="isDeleting" @click="deleteDialog = false">取消</v-btn>
                    <v-btn color="error" variant="tonal" :disabled="isDeleting" @click="deleteRecord"><v-icon class="mr-2">mdi-delete</v-icon> 删除</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useZodiacStore } from '../stores/zodiac';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { CREATE_RESULT_GUESS, DELETE_RESULT_GUESS, RESULT_GUESSES, UPDATE_RESULT_GUESS, GET_PLATFORM_LAST_BATCH_NUMBER } from '../js/api';
import { useToast } from 'vue-toastification';
import { checkPermission } from '../js/common';

const zodiacStore = useZodiacStore();
const xAttributes = zodiacStore.getXAttributes;

const toast = useToast();
const results = ref([]);
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const totalPage = ref(0);

const dialog = ref(false);
const deleteDialog = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const selectedId = ref(0);
const lastBatchNumber = ref(0);
const headers = ref([
    { title: '序列', value: 'index', fixed: 'start', width: 60 },
    { title: '期号', value: 'batch_number', fixed: 'start', width: 120 },
    { title: '属性', value: 'zodiac_attr', minWidth: 100 },
    { title: '结果', value: 'result', minWidth: 100 },
    { title: '是否准', value: 'result_match', minWidth: 100 },
    { title: '创建时间', value: 'createdAt', minWidth: 170 },
    { title: '操作', value: 'actions', minWidth: 150 },
]);
const loading = ref(false);

const obj = ref({
    batch_number: lastBatchNumber.value,
    zodiac_attr: '',
});
const rules = ref({
    batch_number: { required: helpers.withMessage('期号不能为空', required) },
    zodiac_attr: { required: helpers.withMessage('属性不能为空', required) },
});
const v$ = useVuelidate(rules.value, obj.value);

function resetForm() {
    selectedId.value = 0;
    obj.value.batch_number = lastBatchNumber.value;
    obj.value.zodiac_attr = '';
    v$.value.$reset();
}

const fetchResults = async () => {
    const res = await RESULT_GUESSES(page.value, perPage.value);
    if (res.code === 1000) {
        results.value = res.data.results.map((record, index) => ({
            ...record,
            index: (page.value - 1) * perPage.value + index + 1
        }));
        total.value = res.data.meta.total;
    }
}

const editResult = (result) => {
    selectedId.value = result.id;
    obj.value.batch_number = result.batch_number;
    obj.value.zodiac_attr = result.zodiac_attr;
    v$.value.$reset();
    dialog.value = true;
}

const saveResult = async () => {
    v$.value.$touch();
    if (v$.value.$invalid || isSaving.value) {
        return;
    }

    isSaving.value = true;

    const res = selectedId.value == 0 ? (await CREATE_RESULT_GUESS(obj.value)) : (await UPDATE_RESULT_GUESS(selectedId.value, obj.value));
    if (res.code === 1000) {
        dialog.value = false;
        resetForm();
        fetchResults();
        fetchLastBatchNumber();
        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    isSaving.value = false;
}

const confirmDelete = (id) => {
    selectedId.value = id;
    deleteDialog.value = true;
}

const deleteRecord = async () => {
    if (isDeleting.value) return;

    isDeleting.value = true;
    const res = await DELETE_RESULT_GUESS(selectedId.value);
    if (res.code === 1000) {
        deleteDialog.value = false;
        fetchResults();
        fetchLastBatchNumber();
        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    isDeleting.value = false;
}

const goToFirst = () => {
    page.value = 1;
    fetchResults();
}
const goToLast = () => {
    page.value = totalPage.value;
    fetchResults();
}
const switchPage = () => {
    fetchResults();
}

const fetchLastBatchNumber = async () => {
    const res = await GET_PLATFORM_LAST_BATCH_NUMBER();
    if (res.code == 1000) {
        const last = Number(res.data.last_batch_number);
        lastBatchNumber.value = last + 1;
        obj.value.batch_number = last + 1;
    }
}

onMounted(() => {
    fetchLastBatchNumber();
});
</script>