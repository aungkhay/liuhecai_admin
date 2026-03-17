<template>
    <div>
        <v-card class="pa-4 mb-4 border" :elevation="0">
            <v-row>
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
                    <v-btn color="primary" @click="fetchBetHistory()" class="mr-2"><v-icon>mdi-magnify</v-icon>搜索</v-btn>
                    <v-btn color="primary" @click="clearFilters()"><v-icon>mdi-refresh</v-icon>重置</v-btn>
                </v-col>
            </v-row>
        </v-card>
        <v-table dense>
            <thead>
                <tr>
                    <th>序列</th>
                    <th>期号</th>
                    <th>类别</th>
                    <th>项目</th>
                    <th>赔率</th>
                    <th>下注余额</th>
                    <th>赢亏</th>
                    <th>备注</th>
                    <th>状态</th>
                    <th>创建时间</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(bet, index) in bets" :key="bet.id">
                    <td>{{ (page - 1) * perPage + index + 1 }}</td>
                    <th>{{ bet.batch_number }}</th>
                    <td>
                        {{ bet.category.name }}~<span class="text-primary">{{ bet.subCategory.name }}</span>
                        <div class="text-grey" style="font-size: 11px;">{{ bet.item_code }}</div>
                    </td>
                    <td>{{ bet.item_name }}</td>
                    <td>{{ bet.odds }}</td>
                    <td>{{ bet.bet_amount }}</td>
                    <td>
                        <span class="text-warning" v-if="bet.is_win == 0">未结算</span>
                        <span class="text-red" v-else-if="bet.is_win == 1">未中奖</span>
                        <span class="text-success" v-else-if="bet.is_win == 2" color="success">中奖</span>
                        <span class="text-grey" v-else-if="bet.is_win == 3" color="grey">和</span>
                    </td>
                    <td>{{ bet.remark }}</td>
                    <td>
                        <v-chip v-if="bet.is_calculated == 0">未结算</v-chip>
                        <v-chip v-else color="success">已结算</v-chip>
                    </td>
                    <td>{{ $filters.formatFullDate(bet.createdAt) }}</td>
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
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { BET_HISTORY, GET_BET_CATEGORIES } from '../js/api';
import { formattedDate } from '../js/common';

const bets = ref([]);
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
});

const fetchBetHistory = async () => {
    const res = await BET_HISTORY(page.value, perPage.value, filterObj.value);
    if (res.code == 1000) {
        bets.value = res.data.bets;
        total.value = res.data.meta.total;
        totalPage.value = res.data.meta.totalPage;
    }
};

function goToFirst() {
    page.value = 1;
    fetchBetHistory();
}
function goToLast() {
    page.value = totalPage.value;
    fetchBetHistory();
}
function switchPage() {
    fetchBetHistory();
}

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