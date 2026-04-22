<template>
    <div>
        <v-btn v-if="checkPermission('zodiac-feed-create')" color="primary" @click="dialog = true" class="mb-2"><v-icon>mdi-plus</v-icon> 添加</v-btn>

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
            <template #item.feed="{ item }">
                <span>{{ feeds.find(f => f.key === item.feed_one)?.name || '-' }}</span>
                <span class="mx-1">,</span>
                <span>{{ feeds.find(f => f.key === item.feed_two)?.name || '-' }}</span>
            </template>
            <template #item.zodiac="{ item }">
                <span v-if="item.result_zodiac_name">{{ item.result_zodiac_name }}</span>
                <span v-else class="text-grey">-</span>
                <span v-if="item.result_number">{{ item.result_number }}</span>
                <span v-else class="text-grey">-</span>
            </template>
            <template #item.createdAt="{ item }">
                {{ $filters.formatFullDate(item.createdAt) }}
            </template>
            <template #item.actions="{ item }">
                <v-btn v-if="checkPermission('zodiac-feed-update')" size="small" variant="tonal" color="success" class="mr-2" :disabled="item.result_number > 0" @click="editRecord(item)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                <v-btn v-if="checkPermission('zodiac-feed-delete')" size="small" variant="tonal" color="error" :disabled="item.result_number > 0" @click="confirmDelete(item)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
            </template>
        </v-data-table-server>

        <v-dialog v-model="dialog" width="350" persistent>
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

                    <v-row no-gutters>
                        <v-col cols="6">
                            <v-select
                                label="饲料一"
                                v-model="obj.feed_one"
                                :items="feeds"
                                item-title="name"
                                item-value="key"
                                variant="outlined"
                                :error-messages="v$.feed_one.$errors.map(e => e.$message)"
                                @input="v$.feed_one.$touch"
                                @blur="v$.feed_one.$touch"
                                class="mr-1"
                            ></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                label="饲料二"
                                v-model="obj.feed_two"
                                :items="feeds"
                                item-title="name"
                                item-value="key"
                                variant="outlined"
                                :error-messages="v$.feed_two.$errors.map(e => e.$message)"
                                @input="v$.feed_two.$touch"
                                @blur="v$.feed_two.$touch"
                                class="ml-1"
                            ></v-select>
                        </v-col>
                        <div class="text-grey text-caption">
                            草:牛羊马兔 | 肉:虎蛇龙狗 | 菜:猪鼠鸡猴
                        </div>
                    </v-row>
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
                    <v-btn variant="outlined" :disabled="isDeleting" @click="deleteDialog = false">取消</v-btn>
                    <v-btn color="error" variant="tonal" :disabled="isDeleting" @click="deleteRecord"><v-icon class="mr-2">mdi-delete</v-icon> 删除</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { checkPermission } from '../js/common';
import { GET_ZODIAC_FEEDS, GET_PLATFORM_LAST_BATCH_NUMBER, CREATE_ZODIAC_FEED, UPDATE_ZODIAC_FEED, DELETE_ZODIAC_FEED } from '../js/api';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { useToast } from 'vue-toastification';

const toast = useToast();
const dialog = ref(false);
const deleteDialog = ref(false);
const selectedRecord = ref(null);
const lastBatchNumber = ref(0);
const isSaving = ref(false);
const isDeleting = ref(false);

const records = ref([]);
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const loading = ref(false);
const headers = [
    { title: '序列', value: 'index', fixed: 'start', width: 60 },
    { title: '期号', value: 'batch_number', fixed: 'start', width: 120 },
    { title: '生肖', value: 'zodiac', minWidth: 150 },
    { title: '饲料', value: 'feed', minWidth: 150 },
    { title: '创建时间', value: 'createdAt', minWidth: 170 },
    { title: '操作', value: 'actions', minWidth: 150 },
];

const obj = ref({
    batch_number: '',
    feed_one: '',
    feed_two: '',
});
const feeds = ref([
    { name: '草', key: 1 },
    { name: '肉', key: 2 },
    { name: '菜', key: 3 },
]);

const rules = ref({
    batch_number: { required: helpers.withMessage('期号不能为空', required) },
    feed_one: { required: helpers.withMessage('饲料一不能为空', required) },
    feed_two: { required: helpers.withMessage('饲料二不能为空', required) },
});
const v$ = useVuelidate(rules.value, obj.value);

const resetForm = () => {
    obj.value = {
        batch_number: lastBatchNumber.value,
        feed_one: null,
        feed_two: null,
    };
    v$.value.$reset();
    selectedRecord.value = null;
    dialog.value = false;
}

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
    const res = await GET_ZODIAC_FEEDS(page.value, perPage.value);
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
    v$.value.$touch();
    if (v$.value.$invalid) {
        return;
    }
    isSaving.value = true;
    let res;
    if (selectedRecord.value === null) {
        res = await CREATE_ZODIAC_FEED(obj.value);
    } else {
        res = await UPDATE_ZODIAC_FEED(selectedRecord.value.id, obj.value);
    }
    if (res.code === 1000) {
        await getRecords();
        await fetchLastBatchNumber();
        resetForm();
        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    isSaving.value = false;
}

const editRecord = (record) => {
    selectedRecord.value = record;
    obj.value.batch_number = record.batch_number;
    obj.value.feed_one = record.feed_one;
    obj.value.feed_two = record.feed_two;
    v$.value.$reset();
    dialog.value = true;
}

const confirmDelete = (record) => {
    selectedRecord.value = record;
    deleteDialog.value = true;
}

const deleteRecord = async () => {
    if (isDeleting.value) return;

    isDeleting.value = true;
    const res = await DELETE_ZODIAC_FEED(selectedRecord.value.id);
    if (res.code === 1000) {
        deleteDialog.value = false;
        getRecords();
        fetchLastBatchNumber();

        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    selectedRecord.value = null;
    isDeleting.value = false;
};

onMounted(() => {
    fetchLastBatchNumber();
});
</script>