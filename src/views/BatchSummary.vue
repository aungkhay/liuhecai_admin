<template>
    <div>
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
            <template #item.total_profit="{ item }">
                {{ item.total_bet_amount - item.total_win_amount }}
            </template>
            <template #item.total_profit_rate="{ item }">
                {{ ((item.total_bet_amount - item.total_win_amount) / item.total_bet_amount * 100).toFixed(2) }}%
            </template>
        </v-data-table-server>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../stores/user';
import { BATCH_SUMMARY } from '../js/api';

const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const loading = ref(false);
const records = ref([]);
const headers = ref([
    { title: '序列', value: 'index', width: 60 },
    { title: '期号', value: 'batch_number', width: 120 },
    { title: '总下注', value: 'total_bet_amount', width: 120 },
    { title: '总中奖', value: 'total_win_amount', width: 120 },
    { title: '总盈亏', value: 'total_profit', width: 120 },
    { title: '盈利', value: 'total_profit_rate', width: 120 },
]);

const getRecords = async () => {
    loading.value = true;
    try {
        const res = await BATCH_SUMMARY(page.value, perPage.value);
        if (res.code == 1000) {
            records.value = res.data.records.map((record, index) => ({
                ...record,
                index: (page.value - 1) * perPage.value + index + 1
            }));
            total.value = res.data.meta.total;
        }
    } catch (error) {
        console.error('获取下注总结失败:', error);
    } finally {
        loading.value = false;
    }
}
</script>