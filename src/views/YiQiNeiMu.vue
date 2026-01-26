<template>
    <div>
        <v-table>
            <thead>
                <tr>
                    <th>消</th>
                    <th>码</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="d-flex items-center">
                            <div class="bg-red rounded-lg py-1 px-2">七消</div>
                            <div class="d-flex items-center ml-2">
                                <div 
                                    v-for="(item, index) in qixiao?.xiaos" :key="index"
                                    class="border rounded-lg py-1 px-2 mr-1"
                                >{{ item }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex items-center">
                            <div class="bg-red rounded-lg py-1 px-2">7码</div>
                            <div class="d-flex items-center ml-2">
                                <div 
                                    v-for="(item, index) in qixiao?.numbers" :key="index"
                                    class="border rounded-lg py-1 px-2 mr-1"
                                >{{ item }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <v-btn color="primary" size="small" @click="edit(7)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="d-flex items-center">
                            <div class="bg-red rounded-lg py-1 px-2">五消</div>
                            <div class="d-flex items-center ml-2">
                                <div 
                                    v-for="(item, index) in wuxiao?.xiaos" :key="index"
                                    class="border rounded-lg py-1 px-2 mr-1"
                                >{{ item }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex items-center">
                            <div class="bg-red rounded-lg py-1 px-2">5码</div>
                            <div class="d-flex items-center ml-2">
                                <div 
                                    v-for="(item, index) in wuxiao?.numbers" :key="index"
                                    class="border rounded-lg py-1 px-2 mr-1"
                                >{{ item }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <v-btn color="primary" size="small" @click="edit(5)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="d-flex items-center">
                            <div class="bg-red rounded-lg py-1 px-2">三消</div>
                            <div class="d-flex items-center ml-2">
                                <div 
                                    v-for="(item, index) in sanxiao?.xiaos" :key="index"
                                    class="border rounded-lg py-1 px-2 mr-1"
                                >{{ item }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex items-center">
                            <div class="bg-red rounded-lg py-1 px-2">3码</div>
                            <div class="d-flex items-center ml-2">
                                <div 
                                    v-for="(item, index) in sanxiao?.numbers" :key="index"
                                    class="border rounded-lg py-1 px-2 mr-1"
                                >{{ item }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <v-btn color="primary" size="small" @click="edit(3)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                    </td>
                </tr>
            </tbody>
        </v-table>

        <v-dialog
            persistent
            max-width="500"
            v-model="dialog7"
        >
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>编辑七消</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="resetForm7(); dialog7 = false;">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-row v-for="i in 7" :key="i" class="mb-2" no-gutters>
                        <v-col cols="6">
                            <v-select
                                :label="`生肖${i}`"
                                :items="zodiacs"
                                item-title="name"
                                variant="outlined"
                                v-model="obj7[`name${i}`]"
                                :error-messages="v7$[`name${i}`].$errors.map(e => e.$message)"
                                @input="v7$[`name${i}`].$touch"
                                @blur="v7$[`name${i}`].$touch"
                                @update:modelValue="val => onZodiacChange(val, i)"
                                class="pr-1"
                            ></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                :label="`号码${i}`"
                                :items="numArray[`num${i}`]"
                                item-title="num"
                                variant="outlined"
                                v-model="obj7[`num${i}`]"
                                :error-messages="v7$[`num${i}`].$errors.map(e => e.$message)"
                                @input="v7$[`num${i}`].$touch"
                                @blur="v7$[`num${i}`].$touch"
                                class="pl-1"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div class="d-flex justify-end mt-2">
                        <v-btn color="primary" :disabled="isSaving || v7$.$invalid" @click="save(7)"><v-icon class="mr-2">mdi-content-save-outline</v-icon> 保存</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
            persistent
            max-width="500"
            v-model="dialog5"
        >
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>编辑五消</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="resetForm5(); dialog5 = false;">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-row v-for="i in 5" :key="i" class="mb-2" no-gutters>
                        <v-col cols="6">
                            <v-select
                                :label="`生肖${i}`"
                                :items="zodiacs"
                                item-title="name"
                                variant="outlined"
                                v-model="obj5[`name${i}`]"
                                :error-messages="v5$[`name${i}`].$errors.map(e => e.$message)"
                                @input="v5$[`name${i}`].$touch"
                                @blur="v5$[`name${i}`].$touch"
                                @update:modelValue="val => onZodiacChange(val, i)"
                                class="pr-1"
                            ></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                :label="`号码${i}`"
                                :items="numArray[`num${i}`]"
                                item-title="num"
                                variant="outlined"
                                v-model="obj5[`num${i}`]"
                                :error-messages="v5$[`num${i}`].$errors.map(e => e.$message)"
                                @input="v5$[`num${i}`].$touch"
                                @blur="v5$[`num${i}`].$touch"
                                class="pl-1"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div class="d-flex justify-end mt-2">
                        <v-btn color="primary" :disabled="isSaving || v5$.$invalid" @click="save(5)"><v-icon class="mr-2">mdi-content-save-outline</v-icon> 保存</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
            persistent
            max-width="500"
            v-model="dialog3"
        >
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>编辑三消</span>
                    <v-btn variant="flat" size="small" :disabled="isSaving" icon @click="resetForm3(); dialog3 = false;">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-row v-for="i in 3" :key="i" class="mb-2" no-gutters>
                        <v-col cols="6">
                            <v-select
                                :label="`生肖${i}`"
                                :items="zodiacs"
                                item-title="name"
                                variant="outlined"
                                v-model="obj3[`name${i}`]"
                                :error-messages="v3$[`name${i}`].$errors.map(e => e.$message)"
                                @input="v3$[`name${i}`].$touch"
                                @blur="v3$[`name${i}`].$touch"
                                @update:modelValue="val => onZodiacChange(val, i)"
                                class="pr-1"
                            ></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                :label="`号码${i}`"
                                :items="numArray[`num${i}`]"
                                item-title="num"
                                variant="outlined"
                                v-model="obj3[`num${i}`]"
                                :error-messages="v3$[`num${i}`].$errors.map(e => e.$message)"
                                @input="v3$[`num${i}`].$touch"
                                @blur="v3$[`num${i}`].$touch"
                                class="pl-1"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div class="d-flex justify-end mt-2">
                        <v-btn color="primary" :disabled="isSaving || v3$.$invalid" @click="save(3)"><v-icon class="mr-2">mdi-content-save-outline</v-icon> 保存</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { useZodiacStore } from '../stores/zodiac';
import { UPDATE_QI_XIAO, UPDATE_WU_XIAO, UPDATE_SAN_XIAO, GET_XIAO_MA } from '../js/api'; 
import { useToast } from 'vue-toastification';

const toast = useToast();
const zodiacStore = useZodiacStore();
const zodiacs = computed(() => zodiacStore.getOrderedZodiacs);

const qixiao = ref({});
const wuxiao = ref({});
const sanxiao = ref({});

const dialog7 = ref(false);
const dialog5 = ref(false);
const dialog3 = ref(false);

const isSaving = ref(false);
const numArray = ref({
    num1: [],
    num2: [],
    num3: [],
    num4: [],
    num5: [],
    num6: [],
    num7: [],
})

const obj7 = ref({
    name1: '',
    name2: '',
    name3: '',
    name4: '',
    name5: '',
    name6: '',
    name7: '',
    num1: '',
    num2: '',
    num3: '',
    num4: '',
    num5: '',
    num6: '',
    num7: '',
})

const rules7 = ref({
    name1: { required: helpers.withMessage('请选择生肖1', required) },
    name2: { required: helpers.withMessage('请选择生肖2', required) },
    name3: { required: helpers.withMessage('请选择生肖3', required) },
    name4: { required: helpers.withMessage('请选择生肖4', required) },
    name5: { required: helpers.withMessage('请选择生肖5', required) },
    name6: { required: helpers.withMessage('请选择生肖6', required) },
    name7: { required: helpers.withMessage('请选择生肖7', required) },
    num1: { required: helpers.withMessage('请选择号码1', required) },
    num2: { required: helpers.withMessage('请选择号码2', required) },
    num3: { required: helpers.withMessage('请选择号码3', required) },
    num4: { required: helpers.withMessage('请选择号码4', required) },
    num5: { required: helpers.withMessage('请选择号码5', required) },
    num6: { required: helpers.withMessage('请选择号码6', required) },
    num7: { required: helpers.withMessage('请选择号码7', required) },
});
const v7$ = useVuelidate(rules7.value, obj7.value);
const resetForm7 = () => {
    // Reset form logic for 7码
    obj7.value.name1 = '';
    obj7.value.name2 = '';
    obj7.value.name3 = '';
    obj7.value.name4 = '';
    obj7.value.name5 = '';
    obj7.value.name6 = '';
    obj7.value.name7 = '';
    obj7.value.num1 = '';
    obj7.value.num2 = '';
    obj7.value.num3 = '';
    obj7.value.num4 = '';
    obj7.value.num5 = '';
    obj7.value.num6 = '';
    obj7.value.num7 = '';
    v7$.value.$reset();
}

const obj5 = ref({
    name1: '',
    name2: '',
    name3: '',
    name4: '',
    name5: '',
    num1: '',
    num2: '',
    num3: '',
    num4: '',
    num5: '',
})

const rules5 = ref({
    name1: { required: helpers.withMessage('请选择生肖1', required) },
    name2: { required: helpers.withMessage('请选择生肖2', required) },
    name3: { required: helpers.withMessage('请选择生肖3', required) },
    name4: { required: helpers.withMessage('请选择生肖4', required) },
    name5: { required: helpers.withMessage('请选择生肖5', required) },
    num1: { required: helpers.withMessage('请选择号码1', required) },
    num2: { required: helpers.withMessage('请选择号码2', required) },
    num3: { required: helpers.withMessage('请选择号码3', required) },
    num4: { required: helpers.withMessage('请选择号码4', required) },
    num5: { required: helpers.withMessage('请选择号码5', required) },
});
const v5$ = useVuelidate(rules5.value, obj5.value);
const resetForm5 = () => {
    // Reset form logic for 5码
    obj5.value.name1 = '';
    obj5.value.name2 = '';
    obj5.value.name3 = '';
    obj5.value.name4 = '';
    obj5.value.name5 = '';
    obj5.value.num1 = '';
    obj5.value.num2 = '';
    obj5.value.num3 = '';
    obj5.value.num4 = '';
    obj5.value.num5 = '';
    v5$.value.$reset();
}

const obj3 = ref({
    name1: '',
    name2: '',
    name3: '',
    num1: '',
    num2: '',
    num3: '',
})

const rules3 = ref({
    name1: { required: helpers.withMessage('请选择生肖1', required) },
    name2: { required: helpers.withMessage('请选择生肖2', required) },
    name3: { required: helpers.withMessage('请选择生肖3', required) },
    num1: { required: helpers.withMessage('请选择号码1', required) },
    num2: { required: helpers.withMessage('请选择号码2', required) },
    num3: { required: helpers.withMessage('请选择号码3', required) },
});
const v3$ = useVuelidate(rules3.value, obj3.value);
const resetForm3 = () => {
    // Reset form logic for 3码
    obj3.value.name1 = '';
    obj3.value.name2 = '';
    obj3.value.name3 = '';
    obj3.value.num1 = '';
    obj3.value.num2 = '';
    obj3.value.num3 = '';
    v3$.value.$reset();
}

const getXiaoMa = async () => {
    const res = await GET_XIAO_MA();
    if (res.code === 1000) {
        const data = res.data;
        const qixiaoData = data.find(item => item.type === 'qi_xiao') || {};
        const wuxiaoData = data.find(item => item.type === 'wu_xiao') || {};    
        const sanxiaoData = data.find(item => item.type === 'san_xiao') || {};

        const splited7 = qixiaoData.val.split('|');
        if(splited7.length === 2) {
            qixiao.value = {
                xiaos: splited7[0].split(','),
                numbers: splited7[1].split(','),
            }
        }
        const splited5 = wuxiaoData.val.split('|');
        if(splited5.length === 2) {
            wuxiao.value = {
                xiaos: splited5[0].split(','),
                numbers: splited5[1].split(','),
            }
        }
        const splited3 = sanxiaoData.val.split('|');
        if(splited3.length === 2) {
            sanxiao.value = {
                xiaos: splited3[0].split(','),
                numbers: splited3[1].split(','),
            }
        }
    }
}

const onZodiacChange = (val, i) => {
    console.log(`Zodiac changed for index ${i}:`, val);
    numArray.value[`num${i}`] = zodiacs.value.find(z => z.name === val)?.numbers || [];
    obj7.value[`num${i}`] = ''; // Reset selected number when zodiac changes
};

const edit = async (type) => {
    if (type === 7) {
        // Populate obj7 with current qixiao data
        for (let i = 0; i < 7; i++) {
            obj7.value[`name${i + 1}`] = qixiao.value.xiaos[i] || '';
            onZodiacChange(obj7.value[`name${i + 1}`], i + 1);
            obj7.value[`num${i + 1}`] = qixiao.value.numbers[i] || '';
        }
        v7$.value.$reset();
        dialog7.value = true;
    } else if (type === 5) {
        // Populate obj5 with current wuxiao data
        for (let i = 0; i < 5; i++) {
            obj5.value[`name${i + 1}`] = wuxiao.value.xiaos[i] || '';
            onZodiacChange(obj5.value[`name${i + 1}`], i + 1);
            obj5.value[`num${i + 1}`] = wuxiao.value.numbers[i] || '';
        }
        v5$.value.$reset();
        dialog5.value = true;
    } else if (type === 3) {
        // Populate obj3 with current sanxiao data
        for (let i = 0; i < 3; i++) {
            obj3.value[`name${i + 1}`] = sanxiao.value.xiaos[i] || '';
            onZodiacChange(obj3.value[`name${i + 1}`], i + 1);
            obj3.value[`num${i + 1}`] = sanxiao.value.numbers[i] || '';
        }
        v3$.value.$reset();
        dialog3.value = true;
    }
}

const save = async (type) => {
    
    if(isSaving.value || type === 7 && v7$.value.$invalid || type === 5 && v5$.value.$invalid || type === 3 && v3$.value.$invalid) {
        return;
    }

    let res;
    let xiaoType = '';
    let newObj = {};
    if (type === 7) {
        xiaoType = 'qi_xiao';
        newObj = { ...obj7.value };
    } else if (type === 5) {
        xiaoType = 'wu_xiao';
        newObj = { ...obj5.value };
    } else if (type === 3) {
        xiaoType = 'san_xiao';
        newObj = { ...obj3.value };
    }
    const data = { xiaos: [], numbers: [], type: xiaoType }
    for (let i = 1; i <= type; i++) {
        data.xiaos.push(newObj[`name${i}`]);
        data.numbers.push(newObj[`num${i}`]);
    }
    
    isSaving.value = true;

    if (type === 7) {
        res = await UPDATE_QI_XIAO(data);
    } else if (type === 5) {
        res = await UPDATE_WU_XIAO(data);
    } else if (type === 3) {
        res = await UPDATE_SAN_XIAO(data);
    }

    if (res.code === 1000) {
        toast.success(res.message);
        dialog7.value = false;
        dialog5.value = false;
        dialog3.value = false;
    } else {
        toast.error(res.message);
    }

    await getXiaoMa();
    isSaving.value = false;
}

onMounted(() => {
    // Any initialization logic if needed
    zodiacStore.orderZodiac();
    getXiaoMa();
});
</script>