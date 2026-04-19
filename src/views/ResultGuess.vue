<template>
    <div>
        <v-btn v-if="checkPermission('result-guess-create')" color="primary" @click="dialog = true"><v-icon>mdi-plus</v-icon> 添加</v-btn>

        <v-table>
            <thead>
                <tr>
                    <th style="min-width: 100px;">序列</th>
                    <th style="min-width: 100px;">期号</th>
                    <th style="min-width: 100px;">属性</th>
                    <th style="min-width: 100px;">结果</th>
                    <th style="min-width: 100px;">是否准</th>
                    <th style="min-width: 170px;">创建时间</th>
                    <th style="min-width: 180px;">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(result, index) in results" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ result.batch_number.padStart(3, '0') }}</td>
                    <td>{{ result.zodiac_attr }}</td>
                    <td>{{ result.result_number == 0 ? '-' : String(result.result_number).padStart(2, '0') }} <span v-if="result.zodiac_name">{{ result.zodiac_name }}</span></td>
                    <td>
                        <v-chip v-if="result.result_match == 1" color="success">准</v-chip>
                        <v-chip v-else-if="result.result_match == 2" color="error">不准</v-chip>
                        <v-chip v-else color="warning">未开奖</v-chip>
                    </td>
                    <td>{{ $filters.formatFullDate(result.createdAt) }}</td>
                    <td>
                        <!-- <v-btn color="success" size="small" class="mr-2" @click="editResult(result)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn> -->
                        <v-btn v-if="checkPermission('result-guess-delete')" color="error" variant="tonal" size="small" @click="confirmDelete(result.id)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
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
        results.value = res.data.results;
        total.value = res.data.meta.total;
        totalPage.value = res.data.meta.totalPage;
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
    fetchResults();
});
</script>