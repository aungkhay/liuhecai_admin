<template>
    <v-dialog
        v-model="model"
        width="1000"
        persistent
    >
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>购彩蓝</span>
                <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="model = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <v-table height="500px" density="compact" fixed-header>
                    <thead>
                        <tr>
                            <th>玩法</th>
                            <th>投注金额(元)</th>
                            <th>可赢金额(元)</th>
                            <th class="cursor-pointer text-primary" @click="cartStore.clearCarts()">清空</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(cart, index) in carts" :key="index">
                            <td style="max-width: 300px;">
                                <div>{{ cart.categoryName + ' ~ ' + cart.subCategoryName + ' ~ ' }} <span class="text-primary">{{ cart.name }}</span></div>
                            </td>
                            <td>
                                <span v-if="selectedIndex !== index">{{ cart.betAmount }}</span>
                                <div v-else class="d-flex align-center">
                                    <div class="mr-2" style="width: 100px;">
                                        <v-text-field 
                                            v-model="betAmount" 
                                            type="number" 
                                            hide-details
                                            density="compact"
                                            variant="outlined"
                                        ></v-text-field>
                                    </div>
                                    <v-btn @click="confirmEdit" size="x-small" color="success" variant="flat" icon="mdi-check"></v-btn>
                                </div>
                            </td>
                            <td>{{ (cart.odds * cart.betAmount - cart.betAmount).toFixed(2) }}</td>
                            <td>
                                <v-btn size="x-small" variant="tonal" color="success" icon="mdi-pencil" class="mr-2" @click="editCart(cart, index)"></v-btn>
                                <v-btn size="x-small" variant="tonal" color="red" @click="cartStore.removeCart(index)" :disabled="isSaving" icon="mdi-trash-can"></v-btn>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
                <div class="d-flex align-center mt-2">
                    <div class="mr-2">
                        总投注金额: <span class="text-primary font-weight-bold">{{ totalBetAmount }}</span> 元
                    </div>
                    <v-text-field
                        v-model="remark"
                        label="备注"
                        variant="outlined"
                        density="compact"
                        hide-details
                    ></v-text-field>
                </div>
                
            </v-card-text>
            <v-card-actions>
                <v-btn @click="doBet" :loading="isSaving" :disabled="isSaving || carts.length === 0 || !remark" color="primary">确认投注</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useCartStore } from '../stores/bet';

const cartStore = useCartStore();
const carts = computed(() => cartStore.getCarts);
const totalBetAmount = computed(() => carts.value.reduce((total, cart) => total + Number(cart.betAmount), 0));

const TM_SM_RULES = computed(() => cartStore.get_TM_SM_RULES);
const TM_SBB_RULES = computed(() => cartStore.get_TM_SBB_RULES);
const TM_TXTWS_RULES = computed(() => cartStore.get_TM_TXTWS_RULES);
const TM_HX_RULES = computed(() => cartStore.get_TM_HX_RULES);
const TM_WX_RULES = computed(() => cartStore.get_TM_WX_RULES);
const ZM_ZM16_RULES = computed(() => cartStore.get_ZM_ZM16_RULES);
const ZM_ZXQSB_RULES = computed(() => cartStore.get_ZM_ZXQSB_RULES);
const LXLW_RULES = computed(() => cartStore.get_LXLW_RULES);
const YXZXPTWS_RULES = computed(() => cartStore.get_YXZXPTWS_RULES);
const ZH_RULES = computed(() => cartStore.get_ZH_RULES);

const rules = ref({
    TM_SM_RULES: TM_SM_RULES,
    TM_SBB_RULES: TM_SBB_RULES,
    TM_TXTWS_RULES: TM_TXTWS_RULES,
    TM_HX_RULES: TM_HX_RULES,
    TM_WX_RULES: TM_WX_RULES,
    ZM_ZM16_RULES: ZM_ZM16_RULES,
    ZM_ZXQSB_RULES: ZM_ZXQSB_RULES,
    LXLW_RULES: LXLW_RULES,
    YXZXPTWS_RULES: YXZXPTWS_RULES,
    ZH_RULES: ZH_RULES,
})

const props = defineProps({
    dialog: {
        type: Boolean,
        required: true,
    },
    isSaving: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const emit = defineEmits(['update:dialog', 'doBet']);

const model = computed({
    get: () => props.dialog,
    set: val => emit('update:dialog', val)
})
const remark = ref('');
const selectedItem = ref(null);
const selectedIndex = ref(null);
const betAmount = ref(0);

const editCart = (cart, index) => {
    selectedItem.value = cart;
    selectedIndex.value = index;
    betAmount.value = cart.betAmount;
};

const confirmEdit = () => {
    if (selectedItem.value) {
        cartStore.updateCart(selectedItem.value.code, Number(betAmount.value));
        selectedItem.value = null;
        selectedIndex.value = null;
    }
};

const doBet = () => {
    const data = carts.value.map(cart => {
        let numbers = {};
        const codes = cart.code.split(',');
        let isGroup = false;
        if (codes.length > 1) {
            isGroup = true;
        }
        let groupName = '';
        for (const [index, code] of codes.entries()) {
            const split = code.split('_');
            let ruleName = split[0] + '_' + split[1] + '_RULES';
            groupName = split[0] + '_' + split[1];
            if (split[0] === 'LXLW' || split[0] === 'YXZXPTWS' || split[0] === 'ZH' || split[0] === 'ZX' || split[0] === 'ZXBZ') {
                ruleName = split[0] + '_RULES';
                isGroup = false;
                groupName = split[0];
                if (split[0] === 'ZXBZ') {
                    isGroup = true;
                }
            }
            const newRules = rules.value[ruleName] || [];
            // console.log(ruleName, newRules)

            for (const key in newRules) {
                if (!Object.hasOwn(newRules, key)) continue;
                if (!newRules[code]) continue;
                numbers[code] = newRules[code];
            }
            if (newRules.length == 0) {
                numbers[code] =[Number(cart.name.split(',')[index])];
            }
        }

        return {
            category_id: cart.categoryId,
            sub_category_id: cart.subCategoryId,
            is_group_bet: isGroup,
            group_name: groupName,
            item_code: cart.code,
            item_name: cart.name,
            odds: cart.odds,
            bet_amount: cart.betAmount,
            remark: remark.value,
        };
    });

    console.log('bet data', data);

    emit('doBet', data);
    remark.value = '';
};

onMounted(() => {
    cartStore.orderedZodiac();
})
</script>