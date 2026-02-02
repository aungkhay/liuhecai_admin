<template>
    <v-card :elevation="0">
        <v-row dense>
            <v-col v-for="(group, index) in groupItems" :key="index" cols="12" sm="6" md="3" lg="2">
                <div class="border rounded-lg pa-2">
                    <div class="text-center mb-2 font-weight-bold">正码{{ index + 1 }}</div>
                    <div v-for="(item, itemIndex) in group" :key="itemIndex" class="bet-item d-flex align-center justify-space-between pa-1 rounded cursor-pointer border-primary mb-2" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                        <div>{{ item.name }}</div>
                        <div class="d-flex align-center">
                            <div class="mr-2 text-primary text-caption">{{ item.odds }}</div>
                            <input type="number" v-model="item.betAmount" class="bet-input"/>
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

const props = defineProps({
    items: {
        type: Array,
        required: true,
    }
});
const selectedItems = ref([]);
const groupItems = ref([]);

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
        groupItems.value = [];
        for (let i = 1; i <= 6; i++) {
            const group = newItems.filter(item => item.code.includes(`ZM_ZM16_${i}_`));
            groupItems.value.push(group);
        }
    },
    { immediate: true }
)
</script>