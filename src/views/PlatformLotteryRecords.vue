<template>
    <div>
        <div class="d-flex align-center">
            <v-btn color="primary" @click="dialog = true"><v-icon>mdi-plus</v-icon> 添加</v-btn>
            <div class="ml-4">总投注金额: <span class="text-primary font-weight-bold">{{ allBetAmount }}</span> 元</div>
        </div>
        <v-table>
            <thead>
                <tr>
                    <th style="min-width: 100px;">顺序</th>
                    <th style="min-width: 100px;">期号</th>
                    <th style="min-width: 170px;">开奖号码</th>
                    <th style="min-width: 170px;">开奖日期</th>
                    <th style="min-width: 100">计算状态</th>
                    <th style="min-width: 170px;">创建时间</th>
                    <th style="min-width: 170px;">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(record, index) in records" :key="index" style="height: 60px;">
                    <td>{{ index + 1 }}</td>
                    <td>{{ record.batch_number.padStart(3, '0') }}</td>
                    <td>
                        <div class="d-flex align-center">
                            <div v-for="n in 6" :key="n" class="d-flex flex-column align-center">
                                <div class="circle-wrapper mr-1">
                                    <v-img :src="getImg(record[`num${n}_desc`])" width="33" height="33" cover/>
                                    <div class="circle-text">{{ record[`num${n}`].toString().padStart(2, '0') }}</div>
                                </div>
                                <div class="text-caption">{{ getZodiacName(record[`num${n}_desc`]) }}</div>
                            </div>
                            <div class="px-3"><v-icon>mdi-plus</v-icon></div>
                            <div class="d-flex flex-column align-center">
                                <div class="circle-wrapper mr-1">
                                    <v-img :src="getImg(record.num7_desc)" width="33" height="33" cover/>
                                    <div class="circle-text">{{ record.num7.toString().padStart(2, '0') }}</div>
                                </div>
                                <div class="text-caption">{{ getZodiacName(record.num7_desc) }}</div>
                            </div>
                        </div>
                    </td>
                    <td>{{ $filters.formatDate(record.draw_date) }}</td>
                    <td>
                        <v-chip v-if="record.calculate_status == 0">未计算</v-chip>
                        <v-chip v-else-if="record.calculate_status == 1" color="warning">计算中</v-chip>
                        <v-chip v-else color="success">已计算</v-chip>
                    </td>
                    <td>{{ $filters.formatFullDate(record.createdAt) }}</td>
                    <td>
                        <!-- <v-btn size="small" color="success" class="mr-1" @click="editRecord(record)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn> -->
                        <v-btn size="small" color="error" :disabled="record.calculate_status != 0" @click="confirmDelete(record)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
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
            width="500"
            persistent
        >
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ selectedId ? '编辑' : '添加' }}开奖记录</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="resetForm(); dialog = false;">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="pa-3">
                    <v-select
                        label="年份"
                        v-model="obj.year"
                        :items="formatedYears"
                        item-title="title"
                        item-value="key"
                        variant="outlined"
                    ></v-select>
                    <v-row dense>
                        <v-col cols="6">
                            <v-text-field
                                v-model="obj.batch_number"
                                label="期号"
                                placeholder="例如: 26001"
                                variant="outlined"
                                prepend-inner-icon="mdi-pound"
                                :error-messages="v$.batch_number.$errors.map(e => e.$message)"
                                @input="v$.batch_number.$touch"
                                @blur="v$.batch_number.$touch"
                                readonly
                            ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-menu
                                v-model="dateMenu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                            >
                                <template #activator="{ props }">
                                    <v-text-field
                                        v-bind="props"
                                        :model-value="formattedDrawDate()"
                                        label="开奖日期"
                                        readonly
                                        variant="outlined"
                                        prepend-inner-icon="mdi-calendar"
                                        :error-messages="v$.draw_date.$errors.map(e => e.$message)"
                                        @input="v$.draw_date.$touch"
                                        @blur="v$.draw_date.$touch"
                                    ></v-text-field>
                                </template>

                                <v-date-picker
                                    v-model="obj.draw_date"
                                    @update:model-value="dateMenu = false"
                                />
                            </v-menu>
                        </v-col>
                        <v-col cols="12">
                            <v-btn v-if="!selectedId" @click="generateRandomNumbers" :disabled="isSaving" :loading="generating" color="primary" variant="tonal" block>生成随机号码</v-btn>
                            <div class="mt-5" v-if="obj.num1">
                                <div class="d-flex justify-space-between border pa-2 rounded-lg">
                                    <div v-for="n in 7" :key="n" class="d-flex flex-column align-center">
                                        <div class="text-caption">{{ n < 7 ? '正码' + n : '特码' }}</div>
                                        <span class="border px-3 py-2 d-flex items-center rounded-circle">
                                            <span class="font-weight-bold">{{ obj[`num${n}`].toString().padStart(2, '0') }}</span>
                                        </span>
                                    </div>
                                </div>
                                <div class="mt-3 text-end">
                                    <span>总下注：</span>
                                    <span class="font-weight-bold">{{ totalBetAmount }}</span>
                                </div>
                            </div>
                            
                        </v-col>
                        <!-- <v-col cols="6" v-for="n in 7" :key="n">
                            <v-select
                                :label="`${n == 7 ? '特码' : '正码'  + n}`"
                                v-model="obj[`num${n}`]"
                                :items="numbers"
                                item-title="num"
                                item-value="id"
                                variant="outlined"
                                class="mb-1"
                                :prepend-inner-icon="`mdi-numeric-${n}-circle`"
                                :error-messages="v$[`num${n}`].$errors.map(e => e.$message)"
                                @input="v$[`num${n}`].$touch"
                                @blur="v$[`num${n}`].$touch"
                            >
                                <template #item="{ props, item }">
                                    <v-list-item
                                        v-bind="{ ...props, title: undefined }"
                                        density="compact"
                                        lines="one"
                                    >
                                        <v-list-item-title :style="{ color: item.raw.color }">
                                            {{ item.raw.num }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </template>

                                <template #selection="{ item }">
                                    <span :style="{ color: item.raw.color }">{{ item.raw.num }}</span>
                                </template>
                            </v-select>
                        </v-col> -->
                    </v-row>

                    <div class="d-flex justify-end mt-3">
                        <v-btn color="primary" :disabled="isSaving || generating || v$.$invalid" @click="saveRecord"><v-icon class="mr-2">mdi-content-save-outline</v-icon> {{ selectedId == 0 ? '保存' : '更新' }}</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="deleteDialog"
            width="400"
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
import { onMounted, ref, computed, watch } from "vue";
import { useZodiacStore } from "../stores/zodiac";
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { LOTTERY_RECORDS, CREATE_LOTTERY_RECORD, UPDATE_LOTTERY_RECORD, DELETE_LOTTERY_RECORD, GET_PLATFORM_LAST_BATCH_NUMBER, CHECK_BET_NUMBERS } from "../js/api";
import { orderZodiac } from "../js/common";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";

const toast = useToast();
const zodiacStore = useZodiacStore();
const numbers = computed(() => zodiacStore.getNumbers);
const zodiacYears = computed(() => zodiacStore.getZodiacYears);
const zodiacs = computed(() => zodiacStore.getZodiacs);
const comparisons = computed(() => zodiacStore.getComparisons);
const currentYear = computed(() => zodiacStore.currentYear);
const currentZodiac = computed(() => zodiacStore.currentZodiac);
const zodiacMap = {
    'rat': '鼠',
    'ox': '牛',
    'tiger': '虎',
    'rabbit': '兔',
    'dragon': '龙',
    'snake': '蛇',
    'horse': '马',
    'goat': '羊',
    'monkey': '猴',
    'rooster': '鸡',
    'dog': '狗',
    'pig': '猪'
};

const lotteryType = ref('platform');
const lastBatchNumber = ref('');
const generating = ref(false);
const totalBetAmount = ref(0);

const formatedYears = computed(() => {
    return zodiacYears.value.map(y => {
        return { key: y.from_date.split('-')[0], title: `${y.from_date.split('-')[0]}年 (${zodiacMap[y.animal]}年)` }
    });
})

const records = ref([]);
const page = ref(1);
const perPage = ref(10);
const totalPage = ref(0);
const total = ref(0);
const allBetAmount = ref(0);

const dialog = ref(null);
const deleteDialog = ref(null);
const obj = ref({
    year: currentYear.value,
    lottery_type: lotteryType.value,
    batch_number: "",
    num1: null,
    num2: null,
    num3: null,
    num4: null,
    num5: null,
    num6: null,
    num7: null,
    num1_desc: "",
    num2_desc: "",
    num3_desc: "",
    num4_desc: "",
    num5_desc: "",
    num6_desc: "",
    num7_desc: "",
    draw_date: new Date,
});
const dateMenu = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const selectedRecord = ref(null);
const selectedId = ref(0);

const rules = ref({
    batch_number: { 
        required: helpers.withMessage('期号不能为空', required),
        // format: 26001 => 26 means 2026 year, 001 means the first batch of that year
        validate: helpers.withMessage('期号格式不正确', value => {
            if (!value) return true;
            const batchValue = String(value).trim();
            const regex = /^\d{5}$/;
            if (!regex.test(batchValue)) return false;
            const yearPart = batchValue.substring(0, 2);
            const batchPart = batchValue.substring(2);
            const year = parseInt(yearPart, 10);
            const batch = parseInt(batchPart, 10);
            if (isNaN(year) || isNaN(batch)) return false;
            return year >= 0 && year <= 99 && batch > 0 && batch <= 365;
        }) 
    },
    draw_date: { required: helpers.withMessage('开奖日期不能为空', required) },
    num1: { required: helpers.withMessage('号码1不能为空', required) },
    num2: { required: helpers.withMessage('号码2不能为空', required) },
    num3: { required: helpers.withMessage('号码3不能为空', required) },
    num4: { required: helpers.withMessage('号码4不能为空', required) },
    num5: { required: helpers.withMessage('号码5不能为空', required) },
    num6: { required: helpers.withMessage('号码6不能为空', required) },
    num7: { required: helpers.withMessage('号码7不能为空', required) },
})
const v$ = useVuelidate(rules.value, obj.value);
const getImg = (num_desc) => {
    const desc = num_desc.split('/');
    return new URL(`../assets/${desc[2]}-circle.png`, import.meta.url).href
}

const getZodiacName = (num_desc) => {
    const desc = num_desc.split('/');
    return desc[0] + '/' + desc[1];
}

const resetForm = () => {
    obj.value.year = currentYear.value;
    obj.value.lottery_type = lotteryType.value;
    obj.value.batch_number = lastBatchNumber.value;
    obj.value.num1 = null;
    obj.value.num2 = null;
    obj.value.num3 = null;
    obj.value.num4 = null;
    obj.value.num5 = null;
    obj.value.num6 = null;
    obj.value.num7 = null;
    obj.value.draw_date = new Date;
    obj.value.num1_desc = "";
    obj.value.num2_desc = "";
    obj.value.num3_desc = "";
    obj.value.num4_desc = "";
    obj.value.num5_desc = "";
    obj.value.num6_desc = "";
    obj.value.num7_desc = "";
    v$.value.$reset();
    selectedId.value = 0;
    selectedRecord.value = null;
}

const formattedDrawDate = () => {
    if (!obj.value.draw_date) return ''
    return new Date(obj.value.draw_date).toLocaleDateString('zh-CN')
}

const getRecords = async () => {
    const res = await LOTTERY_RECORDS(page.value, perPage.value, lotteryType.value);
    if (res.code == 1000) {
        records.value = res.data.records;
        total.value = res.data.meta.total;
        totalPage.value = res.data.meta.totalPage;
        allBetAmount.value = res.data.total_bet_amount;
    }
}

const editRecord = (record) => {
    selectedRecord.value = record;
    selectedId.value = record.id;
    obj.value.lottery_type = lotteryType.value;
    obj.value.batch_number = record.batch_number;
    obj.value.num1 = record.num1;
    obj.value.num2 = record.num2;
    obj.value.num3 = record.num3;
    obj.value.num4 = record.num4;
    obj.value.num5 = record.num5;
    obj.value.num6 = record.num6;
    obj.value.num7 = record.num7;
    obj.value.num1_desc = record.num1_desc;
    obj.value.num2_desc = record.num2_desc;
    obj.value.num3_desc = record.num3_desc;
    obj.value.num4_desc = record.num4_desc;
    obj.value.num5_desc = record.num5_desc;
    obj.value.num6_desc = record.num6_desc;
    obj.value.num7_desc = record.num7_desc;
    obj.value.draw_date = record.draw_date;
    dialog.value = true;
}

function goToFirst() {
    page.value = 1;
    getRecords();
}
function goToLast() {
    page.value = totalPage.value;
    getRecords();
}
function switchPage() {
    getRecords();
}

const saveRecord = async () => {
    if(v$.value.$invalid || isSaving.value) return;
    isSaving.value = true;

    const selectedZodiac = zodiacs.value.find(z => z.key === currentZodiac.value);
    const arr = orderZodiac(selectedZodiac.id);
    const orderedResults = [];
    for (let i = 0; i < arr.length; i++) {
        const zodiacId = arr[i];
        const zodiac = zodiacs.value.find(z => z.id == zodiacId);
        const comparison = comparisons.value.find(c => c.id == i + 1);
        zodiac.numbers = comparison.numbers;
        orderedResults.push(zodiac);
    }
    for (let i = 0; i < orderedResults.length; i++) {
        const zodiac = orderedResults[i];
        if (zodiac.numbers.includes(obj.value.num1)) {
            const num = numbers.value.find(n => n.id === obj.value.num1);
            obj.value.num1_desc = `${zodiac.name}/${num.wuxing}/${num.color}`;
        }
        if (zodiac.numbers.includes(obj.value.num2)) {
            const num = numbers.value.find(n => n.id === obj.value.num2);
            obj.value.num2_desc = `${zodiac.name}/${num.wuxing}/${num.color}`;
        }
        if (zodiac.numbers.includes(obj.value.num3)) {
            const num = numbers.value.find(n => n.id === obj.value.num3);
            obj.value.num3_desc = `${zodiac.name}/${num.wuxing}/${num.color}`;
        }
        if (zodiac.numbers.includes(obj.value.num4)) {
            const num = numbers.value.find(n => n.id === obj.value.num4);
            obj.value.num4_desc = `${zodiac.name}/${num.wuxing}/${num.color}`;
        }
        if (zodiac.numbers.includes(obj.value.num5)) {
            const num = numbers.value.find(n => n.id === obj.value.num5);
            obj.value.num5_desc = `${zodiac.name}/${num.wuxing}/${num.color}`;
        }
        if (zodiac.numbers.includes(obj.value.num6)) {
            const num = numbers.value.find(n => n.id === obj.value.num6);
            obj.value.num6_desc = `${zodiac.name}/${num.wuxing}/${num.color}`;
        }
        if (zodiac.numbers.includes(obj.value.num7)) {
            const num = numbers.value.find(n => n.id === obj.value.num7);
            obj.value.num7_desc = `${zodiac.name}/${num.wuxing}/${num.color}`;
        }
    }

    const res = selectedId.value == 0 ? await CREATE_LOTTERY_RECORD(obj.value) : await UPDATE_LOTTERY_RECORD(selectedId.value, obj.value);
    if (res.code == 1000) {
        await fetchLastBatchNumber();
        dialog.value = false;
        await getRecords();
        resetForm();
        toast.success(res.message);
    } else {
        toast.error(res.message);
    }
    isSaving.value = false;
}

const confirmDelete = (record) => {
    selectedRecord.value = record;
    deleteDialog.value = true;
}

const deleteRecord = async () => {
    if (isDeleting.value) return;
    isDeleting.value = true;

    const res = await DELETE_LOTTERY_RECORD(selectedRecord.value.id, lotteryType.value);
    if (res.code == 1000) {
        deleteDialog.value = false;
        await getRecords();
    }
    isDeleting.value = false;
}

const fetchLastBatchNumber = async () => {
    const res = await GET_PLATFORM_LAST_BATCH_NUMBER();
    if (res.code == 1000) {
        const last = Number(res.data.last_batch_number); // "26001"
        const nextBatch = String(last + 1).padStart(5, '0');
        lastBatchNumber.value = nextBatch;
        obj.value.batch_number = nextBatch;
    }
}

const generateRandomNumbers = async () => {
    generating.value = true;
    for (let i = 1; i <= 7; i++) {
       const rand = Math.floor(Math.random() * 49) + 1;
        obj.value[`num${i}`] = rand;
    }
    const numbers = {
        num1: obj.value.num1,
        num2: obj.value.num2,
        num3: obj.value.num3,
        num4: obj.value.num4,
        num5: obj.value.num5,
        num6: obj.value.num6,
        num7: obj.value.num7,
    }
    const res = await CHECK_BET_NUMBERS(numbers);

    if (res.code == 1000) {
        totalBetAmount.value = res.data.total_bet_amount;
    } else {
        toast.error(res.message);
    }

    generating.value = false;
}

onMounted(() => {
    fetchLastBatchNumber();
    getRecords();
});
</script>

<style scoped>
.circle-wrapper {
    position: relative;
    width: 33px;
    height: 33px;
}

.circle-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    z-index: 2;
}
</style>