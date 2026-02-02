<template>
    <v-card :elevation="0" max-width="800">
        <div v-for="(item, index) in items" :key="index" cols="12" sm="6" md="4" lg="3">
            <div class="bet-item d-flex align-center justify-space-between pa-2 rounded cursor-pointer border-primary mb-2" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                <div class="d-flex align-center">
                    <div class="mr-2">{{ item.name }}</div>
                    <div v-for="(num, i) in item.numbers" :key="i" class="d-flex align-center">
                        <div class="circle-wrapper mr-2">
                            <v-img :src="getImg(num.color)" width="33" height="33" cover/>
                            <div class="circle-text">{{ num.num.padStart(2, '0') }}</div>
                        </div>
                    </div>
                </div>
                <div class="d-flex align-center">
                    <div class="text-primary text-caption mr-2">{{ item.odds }}</div>
                    <input type="number" v-model="item.betAmount" class="bet-input"/>
                </div>
            </div>
        </div>
    </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useZodiacStore } from '../../../stores/zodiac';

const zodiacStore = useZodiacStore();
const wuxingNumbers = computed(() => zodiacStore.getWuXingNumbers);

const props = defineProps({
    items: {
        type: Array,
        required: true,
    }
});
const selectedItems = ref([]);
const wuxingMap = {
    '金': 'jin',
    '木': 'mu',
    '水': 'shui',
    '火': 'huo',
    '土': 'tu',
};

const getImg = (color) => {
    return new URL(`../../../assets/${color}-circle.png`, import.meta.url).href
}

const toggleItem = (item) => {
    const index = selectedItems.value.indexOf(item);
    if (index === -1) {
        selectedItems.value.push(item);
    } else {
        selectedItems.value.splice(index, 1);
    }
};

watch(
    () => props.items,
    (newItems) => {
        for (const item of newItems) {
            const numbers = wuxingNumbers.value[wuxingMap[item.name]];
            item.numbers = numbers;
        }
    },
    { immediate: true }
);

</script>