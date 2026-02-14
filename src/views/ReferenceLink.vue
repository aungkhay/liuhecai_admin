<template>
    <div>
        <v-btn color="primary" @click="dialog = true"><v-icon>mdi-plus</v-icon> 添加</v-btn>

        <v-table dense>
            <thead>
                <tr>
                    <th>序列</th>
                    <th>图片</th>
                    <th>链接</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(l, index) in links" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td><v-img :src="filePath + l.image" width="100" height="50" class="my-1"></v-img></td>
                    <td>
                        <a :href="l.url" target="_blank" style="text-decoration: none;">{{ l.url }}</a>
                    </td>
                    <td>
                        <v-btn color="primary" size="small" class="mr-2" @click="editLink(l)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                        <v-btn color="error" size="small" @click="confirmDelete(l.id)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
                    </td>
                </tr>
            </tbody>
        </v-table>

        <v-dialog v-model="dialog" persistent max-width="450">
            <v-card>
                <v-card-title>添加参考链接</v-card-title>
                <v-card-text>
                    <v-text-field 
                        v-model="obj.url" 
                        label="链接地址" 
                        variant="outlined" 
                        density="compact"
                        :error-messages="v$.url.$errors.map(e => e.$message)"
                        @input="v$.url.$touch"
                        @blur="v$.url.$touch"
                    ></v-text-field>
                    <div class="mt-3">
                        <v-img v-if="imageUrl != ''" :src="imageUrl" cover aspect-ratio="1" width="100%" height="100px" @click="fileChooser()"></v-img>
                        <div v-else class="d-flex justify-center bg-grey-darken-3"  @click="fileChooser()">
                            <v-icon size="100" style="cursor: pointer;">mdi-image-area</v-icon>
                        </div>
                        <input type="file" name="" id="fileInput" style="display: none;" accept="image/png, image/jpeg, image/jpg, image/webp" @input="pickFile()">
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="isSaving" color="red" @click="closeDialog">取消</v-btn>
                    <v-btn :disabled="isSaving || v$.$invalid" :loading="isSaving" color="primary" @click="saveLink">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" persistent max-width="450">
            <v-card>
                <v-card-title>确认删除</v-card-title>
                <v-card-text>确定要删除这个链接吗？</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red" @click="deleteDialog = false">取消</v-btn>
                    <v-btn color="primary" @click="deleteLink(selectedLinkId)">删除</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { REFERENCE_LINKS, CREATE_REFERENCE_LINK, UPDATE_REFERENCE_LINK, DELETE_REFERENCE_LINK, UPLOAD_REFERENCE_LINK_IMAGE } from '../js/api';
import { useUserStore } from '../stores/user';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers, url } from '@vuelidate/validators';
import { useToast } from 'vue-toastification';

const toast = useToast();
const userStore = useUserStore();
const links = ref([]);
const dialog = ref(false);
const deleteDialog = ref(false);
const filePath = computed(() => userStore.filePath);
const linkFile = ref(null);
const imageUrl = ref('');
const isSaving = ref(false);
const selectedLinkId = ref(0);

const obj = ref({
    url: '',
});
const rules = ref({
    url: { required: helpers.withMessage('链接地址不能为空', required), url: helpers.withMessage('链接地址不合法', url) },
})
const v$ = useVuelidate(rules.value, obj.value);

const getReferenceLinks = async () => {
    try {
        const res = await REFERENCE_LINKS();
        if (res.code == 1000) {
            links.value = res.data;
        }
    } catch (error) {
        console.error('获取参考链接失败:', error);
    }
};

const fileChooser = () => {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
}

const pickFile = () => {
    let input = document.getElementById('fileInput');
    let file = input.files;
    if (file && file[0]) {
        let reader = new FileReader
        reader.onload = e => {
            imageUrl.value = e.target.result
        }
        reader.readAsDataURL(file[0]);
        
        linkFile.value = file[0];
    }
}

const closeDialog = () => {
    dialog.value = false;
    selectedLinkId.value = 0;
    linkFile.value = null;
    imageUrl.value = '';
    obj.value.url = '';
    v$.value.$reset();
}

const editLink = (link) => {
    selectedLinkId.value = link.id;
    obj.value.url = link.url;
    imageUrl.value = filePath.value + link.image;
    dialog.value = true;
}

const saveLink = async () => {
    if (v$.$invalid) {
        v$.$touch();
        return;
    }
    isSaving.value = true;

    try {
        let res;
        let id = selectedLinkId.value;
        if (id) {
            res = await UPDATE_REFERENCE_LINK(id, { url: obj.value.url });
        } else {
            res = await CREATE_REFERENCE_LINK({ url: obj.value.url });
            if (res.code == 1000) {
                id = res.data.id;
            }
        }

        if (linkFile.value) {
            const formData = new FormData();
            formData.append('image', linkFile.value);
            const uploadRes = await UPLOAD_REFERENCE_LINK_IMAGE(id, formData);
            if (uploadRes.code !== 1000) {
                throw new Error('图片上传失败');
            }
        }

        getReferenceLinks();
        closeDialog();
        toast.success('保存成功');
    } catch (error) {
        toast.error('保存失败');
    } finally {
        isSaving.value = false;
    }
}

const confirmDelete = (id) => {
    selectedLinkId.value = id;
    deleteDialog.value = true;
}

const deleteLink = async (id) => {
    try {
        const res = await DELETE_REFERENCE_LINK(id);
        if (res.code == 1000) {
            getReferenceLinks();
            toast.success('删除成功');
        } else {
            throw new Error('删除失败');
        }
    } catch (error) {
        toast.error(error.message);
    } finally {
        deleteDialog.value = false;
        selectedLinkId.value = 0;
    }
}

onMounted(() => {
    getReferenceLinks();
});
</script>