<template>
    <v-card :elevation="0">
        <v-row dense>
            <v-col v-for="(item, index) in items" :key="index" cols="12" sm="4" lg="3">
                <div class="bet-item d-flex align-center justify-space-between pa-2 rounded cursor-pointer border-primary" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                
                    <div class="d-flex align-center">
                        <div class="mr-2">{{ item.name }}</div>
                        <div v-for="(num, i) in item.numbers" :key="i" class="d-flex align-center">
                            <div class="circle-wrapper mr-2">
                                <v-img :src="getImg(num.color)" width="33" height="33" cover/>
                                <div class="circle-text">{{ num.num }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useZodiacStore } from '../../../stores/zodiac';

const zodiacStore = useZodiacStore();
const zodiacs = computed(() => zodiacStore.getOrderedZodiacs);

const props = defineProps({
    items: {
        type: Array,
        required: true,
    }
});
const selectedItems = ref([]);

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
            if (zodiacs.value) {
                const zodiac = zodiacs.value.find(z => z.name === item.name);
                if (zodiac) {
                    const numbers = zodiac.numbers.filter(n => n.id != 49);
                    item.numbers = numbers;
                }
            }
        }
    },
    { immediate: true }
);
</script>