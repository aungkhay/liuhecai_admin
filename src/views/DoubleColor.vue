<template>
    <div>
        <v-btn v-if="checkPermission('double-color-create')" color="primary" @click="dialog = true"><v-icon>mdi-plus</v-icon> 添加</v-btn>

        <v-table>
            <thead>
                <tr>
                    <th>序列</th>
                    <th>期号</th>
                    <th>颜色</th>
                    <th>结果</th>
                    <th>是否准</th>
                    <th>创建时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(record, index) in records" :key="index">
                    <td>{{ index + 1 + (page - 1) * perPage }}</td>
                    <td>{{ String(record.batch_number).padStart(3, '0') }}</td>
                    <td>{{ colorMap[record.color_one] }} , {{ colorMap[record.color_two] }}</td>
                    <td>{{ record.result_number == 0 ? '-' : String(record.result_number).padStart(2, '0') }} <span v-if="record.zodiac_name">{{ record.zodiac_name }}</span></td>
                    <td>
                        <v-chip v-if="record.match_color == record.color_one || record.match_color == record.color_two" color="success">准</v-chip>
                        <v-chip v-else-if="record.match_color == null" color="warning">未开奖</v-chip>
                        <v-chip v-else color="error">不准</v-chip>
                    </td>
                    <td>{{ $filters.formatFullDate(record.createdAt) }}</td>
                    <td>
                        <v-btn v-if="checkPermission('double-color-update')" variant="tonal" color="success" size="small" class="mr-2" @click="editRecord(record)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                        <v-btn v-if="checkPermission('double-color-delete')" variant="tonal" color="error" size="small" @click="confirmDelete(record.id)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
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
                    <v-text-field
                        label="期号"
                        v-model="obj.batch_number"
                        variant="outlined"
                        readonly
                    ></v-text-field>

                    <v-row no-gutters>
                        <v-col cols="6">
                            <v-select
                                label="颜色一"
                                v-model="obj.color_one"
                                :items="colors"
                                item-title="name"
                                item-value="key"
                                variant="outlined"
                                :error-messages="v$.color_one.$errors.map(e => e.$message)"
                                @input="v$.color_one.$touch"
                                @blur="v$.color_one.$touch"
                                class="mr-1"
                            ></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                label="颜色二"
                                v-model="obj.color_two"
                                :items="colors"
                                item-title="name"
                                item-value="key"
                                variant="outlined"
                                :error-messages="v$.color_two.$errors.map(e => e.$message)"
                                @input="v$.color_two.$touch"
                                @blur="v$.color_two.$touch"
                                class="ml-1"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div class="d-flex justify-end mt-3">
                        <v-btn color="primary" :disabled="isSaving || v$.$invalid" @click="saveRecord"><v-icon class="mr-2">mdi-content-save-outline</v-icon> {{ selectedId == 0 ? '保存' : '更新' }}</v-btn>
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
import { GET_DOUBLE_COLOR, CREATE_DOUBLE_COLOR, UPDATE_DOUBLE_COLOR, DELETE_DOUBLE_COLOR, GET_PLATFORM_LAST_BATCH_NUMBER } from '../js/api';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { useToast } from 'vue-toastification';
import { checkPermission } from '../js/common';

const toast = useToast();
const records = ref([]);
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const totalPage = ref(0);
const lastBatchNumber = ref(0);
const dialog = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const deleteDialog = ref(false);
const selectedId = ref(0);
const colors = [
    { name: '红波', key: 'red' },
    { name: '绿波', key: 'green' },
    { name: '蓝波', key: 'blue' }
]
const colorMap = {
    red: '红波',
    green: '绿波',
    blue: '蓝波'
};

const obj = ref({
    batch_number: lastBatchNumber.value,
    color_one: null,
    color_two: null,
});

const rules = ref({
    batch_number: { required: helpers.withMessage('期号不能为空', required) },
    color_one: { required: helpers.withMessage('颜色一不能为空', required) },
    color_two: { required: helpers.withMessage('颜色二不能为空', required) },
});
const v$ = useVuelidate(rules.value, obj.value);

const fetchRecords = async () => {
    const res = await GET_DOUBLE_COLOR(page.value, perPage.value);
    if (res.code === 1000) {
        records.value = res.data.records;
        total.value = res.data.meta.total;
        totalPage.value = res.data.meta.totalPage;
    }
};

const fetchLastBatchNumber = async () => {
    const res = await GET_PLATFORM_LAST_BATCH_NUMBER();
    if (res.code == 1000) {
        const last = Number(res.data.last_batch_number);
        lastBatchNumber.value = last + 1;
        obj.value.batch_number = last + 1;
    }
}

function resetForm() {
    selectedId.value = 0;
    obj.value.batch_number = lastBatchNumber.value;
    obj.value.color_one = null;
    obj.value.color_two = null;
    v$.value.$reset();
}

const editRecord = (record) => {
    selectedId.value = record.id;
    obj.value.batch_number = record.batch_number;
    obj.value.color_one = record.color_one;
    obj.value.color_two = record.color_two;
    v$.value.$reset();
    dialog.value = true;
};

const saveRecord = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) {
        return;
    }
    isSaving.value = true;
    let res;
    if (selectedId.value === 0) {
        res = await CREATE_DOUBLE_COLOR(obj.value);
    } else {
        res = await UPDATE_DOUBLE_COLOR(selectedId.value, obj.value);
    }
    if (res.code === 1000) {
        await fetchRecords();
        await fetchLastBatchNumber();
        resetForm();
        dialog.value = false;
        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    isSaving.value = false;
};

const confirmDelete = (id) => {
    selectedId.value = id;
    deleteDialog.value = true;
};

const deleteRecord = async () => {
    if (isDeleting.value) return;

    isDeleting.value = true;
    const res = await DELETE_DOUBLE_COLOR(selectedId.value);
    if (res.code === 1000) {
        deleteDialog.value = false;
        fetchRecords();
        fetchLastBatchNumber();

        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    isDeleting.value = false;
};

const goToFirst = () => {
    page.value = 1;
    fetchRecords();
}
const goToLast = () => {
    page.value = totalPage.value;
    fetchRecords();
}
const switchPage = () => {
    fetchRecords();
}

onMounted(() => {
    fetchLastBatchNumber();
    fetchRecords();
});
</script>