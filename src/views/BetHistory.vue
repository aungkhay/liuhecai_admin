<template>
    <div>
        <v-card class="pa-2 mb-2 border" :elevation="0">
            <v-row dense>
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filterObj.category_id"
                        :items="categories"
                        item-title="name"
                        item-value="id"
                        label="类别"
                        variant="outlined"
                        density="compact"
                        hide-details
                        @update:model-value="onCategoryChange"
                        clearable
                        @click:clear="filterObj.category_id = null"
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filterObj.sub_category_id"
                        :items="subCategories"
                        item-title="name"
                        item-value="id"
                        label="子类别"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        @click:clear="filterObj.sub_category_id = null"
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-text-field
                        label="期号"
                        variant="outlined"
                        density="compact"
                        v-model="filterObj.batch_number"
                        hide-details
                        clearable
                        @click:clear="filterObj.batch_number = null"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        :items="[{ id: 0, title: '否' }, { id: 1, title: '是' }]"
                        item-value="id"
                        item-title="title"
                        label="是否已计算"
                        variant="outlined"
                        density="compact"
                        v-model="filterObj.is_calculated"
                        hide-details
                        clearable
                        @click:clear="filterObj.is_calculated = null"
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        :items="[{ id: 0, title: '未结算' }, { id: 1, title: '输' }, { id: 2, title: '赢' }, { id: 3, title: '和' }]"
                        item-value="id"
                        item-title="title"
                        label="中奖状态"
                        variant="outlined"
                        density="compact"
                        v-model="filterObj.is_win"
                        hide-details
                        clearable
                        @click:clear="filterObj.is_win = null"
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-text-field
                        label="备注"
                        variant="outlined"
                        density="compact"
                        v-model="filterObj.remark"
                        hide-details
                        clearable
                        @click:clear="filterObj.remark = null"
                    ></v-text-field>
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
                                :model-value="formattedDate(filterObj.fromDate)"
                                hide-details
                                clearable
                                @click:clear="filterObj.fromDate = null"
                            ></v-text-field>
                        </template>

                        <v-date-picker
                            v-model="filterObj.fromDate"
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
                                :model-value="formattedDate(filterObj.toDate)"
                                hide-details
                                clearable
                                @click:clear="filterObj.toDate = null"
                            ></v-text-field>
                        </template>

                        <v-date-picker
                            v-model="filterObj.toDate"
                            @update:model-value="toDateMenu = false"
                        />
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-btn color="primary" variant="outlined" @click="fetchBetHistory()" class="mr-2"><v-icon>mdi-magnify</v-icon>搜索</v-btn>
                    <v-btn color="grey-darken-2" variant="outlined" @click="clearFilters()"><v-icon>mdi-refresh</v-icon>重置</v-btn>
                </v-col>
            </v-row>
        </v-card>

        <v-data-table-server
            v-model:page="page"
            v-model:items-per-page="perPage"
            :headers="headers"
            :items="bets"
            :items-length="total"
            :loading="loading"
            class="table1"
            :items-per-page-options="[5, 10, 15, 20, 50]"
            @update:options="fetchBetHistory"
            hover
        >
            <template #loading>
                <v-skeleton-loader type="table-row@3"/>
            </template>
            <template #item.category="{ item }">
                {{ item.category.name }}~<span class="text-primary">{{ item.subCategory.name }}</span>
                <div class="text-grey" style="font-size: 11px;">{{ item.item_code }}</div>
            </template>
            <template #item.is_win="{ item }">
                <span class="text-warning" v-if="item.is_win == 0">未结算</span>
                <span class="text-red" v-else-if="item.is_win == 1">客户亏</span>
                <span class="text-success" v-else-if="item.is_win == 2" color="success">客户赢</span>
                <span class="text-grey" v-else-if="item.is_win == 3" color="grey">和</span>
            </template>
            <template #item.bet_amount="{ item }">
                {{ Number(item.bet_amount).toFixed(2) }}
            </template>
            <template #item.win_amount="{ item }">
                {{ Number(item.win_amount).toFixed(2) }}
            </template>
            <template #item.is_calculated="{ item }">
                <v-chip v-if="item.is_calculated == 0">未结算</v-chip>
                <v-chip v-else color="success">已结算</v-chip>
            </template>
            <template #item.createdAt="{ item }">
                {{ $filters.formatFullDate(item.createdAt) }}
            </template>
            <template v-slot:body.append>
                <tr style="background-color: #d4d4d4;">
                    <td colspan="11">
                        <div>
                            <span>总下注：<span class="font-weight-bold">{{ Number(totalBetAmount).toFixed(2) }}</span></span>
                            <span class="mx-2">总中奖：<span class="font-weight-bold">{{ Number(totalWinAmount).toFixed(2) }}</span></span>
                            <span>盈利：<span class="font-weight-bold">{{ Number(profitAmount).toFixed(2) }}</span></span>
                        </div>
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { BET_HISTORY, GET_BET_CATEGORIES } from '../js/api';
import { formattedDate } from '../js/common';

const loading = ref(false);
const bets = ref([]);
const totalBetAmount = ref(0);
const totalWinAmount = ref(0);
const profitAmount = ref(0);
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const totalPage = ref(0);
const categories = ref([]);
const subCategories = ref([]);
const fromDateMenu = ref(false);
const toDateMenu = ref(false);
const filterObj = ref({
    category_id: null,
    sub_category_id: null,
    remark: null,
    fromDate: null,
    toDate: null,
    batch_number: null,
    is_win: null,
    is_calculated: null,
});
const headers = ref([
    { title: '列', value: 'index', fixed: 'start', width: 60 },
    { title: '期号', value: 'batch_number', fixed: 'start', width: 120 },
    { title: '类别', value: 'category', minWidth: 150 },
    { title: '项目', value: 'item_name', minWidth: 150 },
    { title: '赔率', value: 'odds', minWidth: 100 },
    { title: '下注金额', value: 'bet_amount', minWidth: 100 },
    { title: '赢亏', value: 'is_win', minWidth: 100 },
    { title: '赢得金额', value: 'win_amount', minWidth: 100 },
    { title: '备注', value: 'remark', minWidth: 150 },
    { title: '状态', value: 'is_calculated', minWidth: 100 },
    { title: '创建时间', value: 'createdAt', minWidth: 170 },
]);

const fetchBetHistory = async () => {
    loading.value = true;
    const res = await BET_HISTORY(page.value, perPage.value, filterObj.value);
    if (res.code == 1000) {
        bets.value = res.data.bets.map((record, index) => ({
            ...record,
            index: (page.value - 1) * perPage.value + index + 1
        }));
        total.value = res.data.meta.total;
        totalPage.value = res.data.meta.totalPage;
        totalBetAmount.value = res.data.total_bet_amount || 0;
        totalWinAmount.value = res.data.total_win_amount || 0;
        profitAmount.value = res.data.profit_amount || 0;
    }
    loading.value = false;
};

const fetchCategories = async () => {
    const res = await GET_BET_CATEGORIES();
    if (res.code == 1000) {
        categories.value = res.data;
    }
};

const onCategoryChange = () => {
    subCategories.value = [];
    const selectedCategory = categories.value.find(cat => cat.id === filterObj.value.category_id);
    if (selectedCategory) {
        subCategories.value = selectedCategory.subCategories;
    }
    filterObj.value.sub_category_id = null;
};

const clearFilters = () => {
    filterObj.value = {
        category_id: null,
        sub_category_id: null,
        remark: null,
        fromDate: null,
        toDate: null,
        batch_number: null,
        is_win: null,
        is_calculated: null,
    };
    subCategories.value = [];
    page.value = 1;
    perPage.value = 10;
    fetchBetHistory();
};

onMounted(() => {
    fetchBetHistory();
    fetchCategories();
});
</script>