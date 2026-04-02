<template>
    <div>
        <v-btn v-if="checkPermission('banner-create')" color="primary" @click="dialog = true"><v-icon>mdi-plus</v-icon> 添加</v-btn>
        
        <v-row class="mt-2">
            <v-col v-for="(b, index) in banners" :key="index" cols="12" sm="6" md="4" lg="3">
                <v-card rounded="lg">
                    <v-img
                        :src="filePath + b.image"
                        height="180px"
                        cover
                    ></v-img>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn v-if="checkPermission('banner-delete')" color="red" variant="flat" @click="openDeleteDialog(b.id)"><v-icon>mdi-trash-can</v-icon>删除</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <v-dialog v-model="dialog" persistent transition="dialog-bottom-transition" max-width="400px">
            <v-card class="pa-2">
                <v-card-title class="d-flex justify-space-between">
                    <span>添加</span> 
                    <v-btn size="small" variant="text" icon="mdi-close" @click="closeDialog()"></v-btn>
                </v-card-title>
                <v-card-text class="py-0 px-3">
                    <v-img v-if="imageUrl != ''" :src="imageUrl" cover aspect-ratio="1" width="100%" height="180px" @click="fileChooser()"></v-img>
                    <div v-else class="d-flex justify-center bg-grey-darken-3"  @click="fileChooser()">
                        <v-icon size="200" style="cursor: pointer;">mdi-image-area</v-icon>
                    </div>
                    <input type="file" name="" id="fileInput" style="display: none;" accept="image/png, image/jpeg, image/jpg, image/webp" @input="pickFile()">
                </v-card-text>
                <v-card-actions class="justify-center mt-3">
                    <v-btn :disabled="!bannerFile" :loading="isSaving" :color="bannerFile ? 'primary' : ''" variant="flat" @click="saveFile()">
                        <v-icon class="mr-2">mdi-cloud-upload</v-icon> 保存
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="deleteDialog"
            persistent
            transition="dialog-bottom-transition" 
            max-width="350px"
        >
            <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                    <div>删除</div>
                    <v-btn icon="mdi-close" color="red" variant="text" @click="closeDeleteDialog()"></v-btn>
                </v-card-title>
                <v-card-text>
                    您确定要删除此轮播图吗？
                </v-card-text>
                <v-card-actions class="justify-end mb-3 mr-3">
                    <v-btn v-if="!isDeleting" variant="outlined" @click="closeDeleteDialog()">取消</v-btn>
                    <v-btn 
                        :loading="isDeleting" 
                        :disabled="isDeleting" 
                        :color="isDeleting ? 'grey-darken-4' : 'error'" 
                        variant="flat" 
                        @click="deleteBanner()"
                    >确定</v-btn>
                </v-card-actions>   
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { BANNERS, CREATE_BANNER, DELETE_BANNER } from '../js/api';
import { useToast } from 'vue-toastification';
import { useUserStore } from '../stores/user';
import { checkPermission } from '../js/common';

const store = useUserStore();
const filePath = computed(() => store.getFilePath);
const toast = useToast();
const isRefresh = ref(false);
const banners = ref([]);
const dialog = ref(false);
const deleteDialog = ref(false);
const isDeleting = ref(false);
const selectedBannerId = ref(0);
const bannerFile = ref(null);
const imageUrl = ref('');
const isSaving = ref(false);

const closeDialog = () => {
    dialog.value = false;
    selectedBannerId.value = 0;
    bannerFile.value = null;
    imageUrl.value = '';
}

const getBanners = async () => {
    const res = await BANNERS();
    if (res.code === 1000) {
        banners.value = res.data;
    }
}

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
        
        bannerFile.value = file[0];
    }
}

async function saveFile() {

    if((selectedBannerId.value != 0 && bannerFile.value == '') || (bannerFile.value == '' && imageUrl.value != '')) {
        closeDialog();
        return;
    }

    isSaving.value = true;
    isRefresh.value = true;

    const formData = new FormData();
    formData.append('image', bannerFile.value);
    const res = await CREATE_BANNER(formData);

    if(res.code == 1000) {
        await getBanners();
        toast.info(res.message);
    } else {
        toast.error(res.message);
    }

    isSaving.value = false;
    isRefresh.value = false;
    closeDialog();
}

const openDeleteDialog = (id) => {
    selectedBannerId.value = id;
    deleteDialog.value = true;
}

const closeDeleteDialog = () => {
    selectedBannerId.value = 0;
    deleteDialog.value = false;
}

async function deleteBanner() {
    isDeleting.value = true;
    isRefresh.value = true;

    const res = await DELETE_BANNER(selectedBannerId.value);

    if(res.code == 1000) {
        await getBanners();
        toast.info(res.message);
    } else {
        toast.error(res.message);
    }

    isDeleting.value = false;
    isRefresh.value = false;
    closeDeleteDialog();
}


onMounted(() => {
    getBanners();
})
</script>