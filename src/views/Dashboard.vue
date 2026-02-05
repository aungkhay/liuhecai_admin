<template>
    <div>
        <div class="text-h6">总下注金额: <span class="text-primary font-weight-bold">{{ totalAmount }}</span>元</div>
        <v-card :elevation="0">
            <v-row dense>
                <v-col cols="12" sm="6" md="4" lg="3" v-for="(s, index) in summary" :key="index">
                    <v-card class="pa-4 border" variant="tonal" :elevation="0">
                        <div class="d-flex align-center justify-space-between">
                            <div class="text-h6 font-weight-bold text-primary">{{ s.name }}</div>
                            <div class="text-h6 font-weight-bold text-right">{{ s.sum }}</div>
                        </div>
                        <v-divider></v-divider>
                        <div v-for="(sub, i) in s.sub_categories" class="py-1">
                            <div class="d-flex justify-space-between">
                                <div><v-icon>mdi-circle-small</v-icon>{{ sub.name }}</div>
                                <div><span class="font-weight-bold">{{ sub.total_bet_amount }}</span><span class="text-caption text-grey">/{{ sub.total_bet_count }}</span></div>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { BET_SUMMARY } from '../js/api';

const summary = ref({});
const totalAmount = ref(0);

const formatSummary = (data) => {
    const categories = [];
    let lastCategoryId = 0;
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.category.id != lastCategoryId) {
            categories.push({
                id: item.category.id,
                name: item.category.name,
                sub_categories: [{
                    id: item.subCategory.id,
                    name: item.subCategory.name,
                    total_bet_amount: item.total_bet_amount,
                    total_bet_count: item.total_bet_count,
                }],
                sum: item.total_bet_amount
            });
        } else {
            const category = categories.find(cat => cat.id === item.category.id);
            category.sub_categories.push({
                id: item.subCategory.id,
                name: item.subCategory.name,
                total_bet_amount: item.total_bet_amount,
                total_bet_count: item.total_bet_count,
            });
            category.sum += item.total_bet_amount;
        }
        lastCategoryId = item.category.id;
    }
    return categories;
};

const fetchSummary = async () => {
    const res = await BET_SUMMARY();
    if (res.code == 1000) {
        summary.value = formatSummary(res.data);
        totalAmount.value = res.data.reduce((acc, item) => acc + item.total_bet_amount, 0); 
    }
};

onMounted(() => {
    fetchSummary();
});
</script>