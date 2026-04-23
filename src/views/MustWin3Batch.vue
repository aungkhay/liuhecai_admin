<template>
    <div>
        <v-btn v-if="checkPermission('must-win-3-batch-create')" color="primary" @click="dialog = true" class="mb-2"><v-icon>mdi-plus</v-icon> 添加</v-btn>

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
                <div class="d-flex align-center">
                    <div class="bg-grey-lighten-3 px-2 py-1 rounded text-center">
                        <div>{{ item.batch_one }}</div>
                        <div class="text-caption">{{ item.zodiac_one }}</div>
                    </div>
                    <div class="bg-grey-lighten-3 px-2 py-1 rounded  text-center mx-1">
                        <div>{{ item.batch_two }}</div>
                        <div class="text-caption">{{ item.zodiac_two }}</div>
                    </div>
                    <div class="bg-grey-lighten-3 px-2 py-1 rounded  text-center">
                        <div>{{ item.batch_three }}</div>
                        <div class="text-caption">{{ item.zodiac_three }}</div>
                    </div>
                </div>
            </template>
            <template #item.result_number="{ item }">
                <div class="d-flex align-center">
                    <div class="bg-grey-lighten-3 px-2 py-1 rounded text-center">
                        <div>{{ item.batch_one }}</div>
                        <div class="text-caption">{{ item.result_zodiac_one }} <span class="font-weight-bold text-primary">{{ String(item.result_number_one).padStart(2, '0') }}</span></div>
                    </div>
                    <div class="bg-grey-lighten-3 px-2 py-1 rounded  text-center mx-1">
                        <div>{{ item.batch_two }}</div>
                        <div class="text-caption">{{ item.result_zodiac_two }} <span class="font-weight-bold text-primary">{{ String(item.result_number_two).padStart(2, '0') }}</span></div>
                    </div>
                    <div class="bg-grey-lighten-3 px-2 py-1 rounded  text-center">
                        <div>{{ item.batch_three }}</div>
                        <div class="text-caption">{{ item.result_zodiac_three }} <span class="font-weight-bold text-primary">{{ String(item.result_number_three).padStart(2, '0') }}</span></div>
                    </div>
                </div>
            </template>
            <template #item.is_finished="{ item }">
                <v-chip v-if="item.is_finished == 0" color="warning">未完成</v-chip>
                <v-chip v-else color="success">已完成</v-chip>
            </template>
            <template #item.createdAt="{ item }">
                {{ $filters.formatFullDate(item.createdAt) }}
            </template>
            <template #item.actions="{ item }">
                <v-btn v-if="checkPermission('must-win-3-batch-update')" size="small" variant="tonal" color="success" class="mr-2" :disabled="item.result_number_one" @click="editRecord(item)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                <v-btn v-if="checkPermission('must-win-3-batch-delete')" size="small" variant="tonal" color="error" :disabled="item.result_number_one" @click="deleteRecord(item)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
            </template>
        </v-data-table-server>

        <v-dialog 
            v-model="dialog"
            width="500"
            persistent
        >
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ selectedRecord ? '编辑' : '添加' }}</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="resetForm()">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="6">
                            <v-text-field 
                                v-model="obj.batch_one" 
                                label="期一" 
                                variant="outlined"
                                :error-messages="v$.batch_one.$errors.map(e => e.$message)"
                                @input="v$.batch_one.$touch"
                                @blur="v$.batch_one.$touch"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                v-model="obj.zodiac_one"
                                :items="zodiacs"
                                item-title="name"
                                item-value="name"
                                label="生肖一"
                                variant="outlined"
                                :error-messages="v$.zodiac_one.$errors.map(e => e.$message)"
                                @input="v$.zodiac_one.$touch"
                                @blur="v$.zodiac_one.$touch"
                            ></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field 
                                v-model="obj.batch_two" 
                                label="期二" 
                                variant="outlined"
                                :error-messages="v$.batch_two.$errors.map(e => e.$message)"
                                @input="v$.batch_two.$touch"
                                @blur="v$.batch_two.$touch"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                v-model="obj.zodiac_two"
                                :items="zodiacs"
                                item-title="name"
                                item-value="name"
                                label="生肖二"
                                variant="outlined"
                                :error-messages="v$.zodiac_two.$errors.map(e => e.$message)"
                                @input="v$.zodiac_two.$touch"
                                @blur="v$.zodiac_two.$touch"
                            ></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field 
                                v-model="obj.batch_three" 
                                label="期三" 
                                variant="outlined"
                                :error-messages="v$.batch_three.$errors.map(e => e.$message)"
                                @input="v$.batch_three.$touch"
                                @blur="v$.batch_three.$touch"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                v-model="obj.zodiac_three"
                                :items="zodiacs"
                                item-title="name"
                                item-value="name"
                                label="生肖三"
                                variant="outlined"
                                :error-messages="v$.zodiac_three.$errors.map(e => e.$message)"
                                @input="v$.zodiac_three.$touch"
                                @blur="v$.zodiac_three.$touch"
                            ></v-select>
                        </v-col>
                    </v-row>

                    <div class="d-flex justify-end mt-3">
                        <v-btn color="primary" :disabled="isSaving || v$.$invalid" @click="saveRecord"><v-icon class="mr-2">mdi-content-save-outline</v-icon> {{ selectedRecord ? '更新' : '保存' }}</v-btn>
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
import { checkPermission } from '../js/common';
import { CREATE_MUST_WIN_3_BATCH, DELETE_MUST_WIN_3_BATCH, GET_MUST_WIN_3_BATCHES, MUST_WIN_3_BATCH_LAST_BATCH_NUMBER, UPDATE_MUST_WIN_3_BATCH } from '../js/api';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { useZodiacStore } from '../stores/zodiac';
import { useToast } from 'vue-toastification';

const toast = useToast();
const zodiacStore = useZodiacStore();
const zodiacs = zodiacStore.getZodiacs;

const dialog = ref(false);
const selectedRecord = ref(null);
const page = ref(1);
const perPage = ref(10);
const records = ref([]);
const total = ref(0);
const loading = ref(false);
const headers = ref([
    { title: '序列', value: 'index', fixed: 'start', width: 60 },
    { title: '期号', value: 'batch_number', fixed: 'start', width: 200 },
    { title: '结果', value: 'result_number', minWidth: 200 },
    { title: '状态', value: 'is_finished', minWidth: 100 },
    { title: '创建时间', value: 'createdAt', minWidth: 170 },
    { title: '操作', value: 'actions', minWidth: 150, },
]);
const deleteDialog = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const lastBatchNumber = ref(0);
const obj = ref({
    batch_one: null,
    batch_two: null,
    batch_three: null,
    zodiac_one: null,
    zodiac_two: null,
    zodiac_three: null,
});

const rules = ref({
    batch_one: { required: helpers.withMessage('期一不能为空', required) },
    batch_two: { required: helpers.withMessage('期二不能为空', required) },
    batch_three: { required: helpers.withMessage('期三不能为空', required) },
    zodiac_one: { required: helpers.withMessage('生肖一不能为空', required) },
    zodiac_two: { required: helpers.withMessage('生肖二不能为空', required) },
    zodiac_three: { required: helpers.withMessage('生肖三不能为空', required) },
});
const v$ = useVuelidate(rules.value, obj.value);

const resetForm = () => {
    selectedRecord.value = null;
    obj.value = {
        batch_one: lastBatchNumber.value + 1,
        batch_two: lastBatchNumber.value + 2,
        batch_three: lastBatchNumber.value + 3,
        zodiac_one: null,
        zodiac_two: null,
        zodiac_three: null,
    };
    v$.value.$reset();
    dialog.value = false;
};

const fetchLastBatchNumber = async () => {
    const res = await MUST_WIN_3_BATCH_LAST_BATCH_NUMBER();
    if (res.code == 1000) {
        const last = Number(res.data.last_batch_number);
        lastBatchNumber.value = last;
        obj.value.batch_one = last + 1;
        obj.value.batch_two = last + 2;
        obj.value.batch_three = last + 3;
    }
}

const getRecords = async () => {
    const res = await GET_MUST_WIN_3_BATCHES(page.value, perPage.value);
    if (res.code == 1000) {
        records.value = res.data.records.map((record, index) => ({
            ...record,
            index: (page.value - 1) * perPage.value + index + 1
        }));
        total.value = res.data.meta.total;
    }
};

const saveRecord = async () => {
    try {
        isSaving.value = true;
        let res;

        if (selectedRecord.value) {
            res = await UPDATE_MUST_WIN_3_BATCH(selectedRecord.value.id, obj.value);
        } else {
            res = await CREATE_MUST_WIN_3_BATCH(obj.value);
        }

        if (res.code == 1000) {
            toast.success(res.message || '操作成功');
            resetForm();
            await getRecords();
            await fetchLastBatchNumber();
        } else {
            toast.error(res.message || '操作失败');
        }
    } catch (error) {
        toast.error(error.message || '操作失败');
    } finally {
        isSaving.value = false;
    }
};

const editRecord = (record) => {
    selectedRecord.value = record;
    obj.value.batch_one = record.batch_one;
    obj.value.batch_two = record.batch_two;
    obj.value.batch_three = record.batch_three;
    obj.value.zodiac_one = record.zodiac_one;
    obj.value.zodiac_two = record.zodiac_two;
    obj.value.zodiac_three = record.zodiac_three;
    v$.value.$reset();
    dialog.value = true;
}

const deleteRecord = (record) => {
    selectedRecord.value = record;
    deleteDialog.value = true;
}

const confirmDelete = async () => {
    if (isDeleting.value) return;

    try {
        isDeleting.value = true;
        const res = await DELETE_MUST_WIN_3_BATCH(selectedRecord.value.id);
        if (res.code == 1000) {
            toast.success(res.message || '删除成功');
            await getRecords();
            await fetchLastBatchNumber();
        } else {
            toast.error(res.message || '删除失败');
        }
    } catch (error) {
        toast.error(error.message || '删除失败');
    } finally {
        isDeleting.value = false;
        deleteDialog.value = false;
    }
}

onMounted(() => {
    fetchLastBatchNumber();
});
</script>