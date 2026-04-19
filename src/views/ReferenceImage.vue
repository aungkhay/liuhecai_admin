<template>
    <div>
        <v-btn v-if="checkPermission('reference-image-create')" color="primary" @click="dialog = true" class="mb-2"><v-icon>mdi-plus</v-icon> 添加</v-btn>

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
            <template #item.image_url="{ item }">
                <div class="py-1">
                    <v-img :src="filePath + item.image_url" cover height="50px" width="50px"></v-img>
                </div>
            </template>
            <template #item.createdAt="{ item }">
                {{ $filters.formatFullDate(item.createdAt) }}
            </template>
            <template #item.actions="{ item }">
                <v-btn v-if="checkPermission('reference-image-update')" size="small" variant="tonal" color="success" class="mr-2" @click="editRecord(item)"><v-icon>mdi-pencil</v-icon> 编辑</v-btn>
                <v-btn v-if="checkPermission('reference-image-delete')" size="small" variant="tonal" color="error" @click="confirmDelete(item)"><v-icon>mdi-delete</v-icon> 删除</v-btn>
            </template>
        </v-data-table-server>

        <v-dialog v-model="dialog" persistent transition="dialog-bottom-transition" max-width="400px">
            <v-card class="pa-2">
                <v-card-title class="d-flex justify-space-between">
                    <span>{{ selectedRecord ? '编辑' : '添加' }}</span> 
                    <v-btn size="small" variant="text" icon="mdi-close" @click="closeDialog()"></v-btn>
                </v-card-title>
                <v-card-text class="py-0 px-3">
                    <v-text-field v-model="obj.name" label="名称"></v-text-field>
                    <v-img v-if="obj.image_url != ''" :src="filePath + obj.image_url" cover aspect-ratio="1" width="100%" height="180px" @click="fileChooser()"></v-img>
                    <div v-else class="d-flex justify-center bg-grey-darken-3"  @click="fileChooser()">
                        <v-icon size="200" style="cursor: pointer;">mdi-image-area</v-icon>
                    </div>
                    <input type="file" name="" id="fileInput" style="display: none;" accept="image/png, image/jpeg, image/jpg, image/webp" @input="pickFile()">
                </v-card-text>
                <v-card-actions class="justify-center mt-3">
                    <v-btn :disabled="!obj.image_url" :loading="isSaving || isUploading" :color="obj.image_url ? 'primary' : ''" variant="flat" @click="saveRecord()">
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
                    <v-btn icon="mdi-close" color="red" variant="text" @click="closeDialog()"></v-btn>
                </v-card-title>
                <v-card-text>
                    您确定要删除吗？
                </v-card-text>
                <v-card-actions class="justify-end mb-3 mr-3">
                    <v-btn v-if="!isDeleting" variant="outlined" @click="closeDialog()">取消</v-btn>
                    <v-btn 
                        :loading="isDeleting" 
                        :disabled="isDeleting" 
                        :color="isDeleting ? 'grey-darken-4' : 'error'" 
                        variant="flat" 
                        @click="deleteRecord()"
                    >确定</v-btn>
                </v-card-actions>   
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { checkPermission } from '../js/common';
import { CREATE_REFERENCE_IMAGE, DELETE_REFERENCE_IMAGE, REFERENCE_IMAGE_LIST, REFERENCE_IMAGE_UPLOAD, UPDATE_REFERENCE_IMAGE } from '../js/api';
import { useUserStore } from '../stores/user';
import { useToast } from 'vue-toastification';

const store = useUserStore();
const filePath = computed(() => store.getFilePath);
const toast = useToast();
const dialog = ref(false);
const deleteDialog = ref(false);
const isDeleting = ref(false);
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const records = ref([]);
const loading = ref(false);
const headers = ref([
    { title: '列', value: 'index', width: 60 },
    { title: '名称', value: 'name', minWidth: 150 },
    { title: '图片', value: 'image_url' },
    { title: '创建时间', value: 'createdAt', minWidth: 170 },
    { title: '操作', value: 'actions', minWidth: 200 },
]);
const selectedRecord = ref(null);

const imageName = ref('');
const imageUrl = ref('');
const imageFile = ref(null);
const isSaving = ref(false);
const isUploading = ref(false);
const obj = ref({
    name: '',
    image_url: '',
})

const closeDialog = () => {
    obj.value = {
        name: '',
        image_url: '',
    };
    dialog.value = false;
    deleteDialog.value = false;
    selectedRecord.value = null;
};

const fileChooser = () => {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
}

const pickFile = async () => {
    let input = document.getElementById('fileInput');
    let file = input.files;
    if (file && file[0]) {
        let reader = new FileReader
        reader.onload = e => {
            imageUrl.value = e.target.result
        }
        reader.readAsDataURL(file[0]);
        
        imageFile.value = file[0];
    }
    isUploading.value = true;
    const formData = new FormData();
    formData.append('image', imageFile.value);
    const res = await REFERENCE_IMAGE_UPLOAD(formData);
    if (res.code === 1000) {
        obj.value.image_url = res.data.file_url;

    } else {
        toast.error(res.message);
    }
    isUploading.value = false;
}

const getRecords = async () => {
    const res = await REFERENCE_IMAGE_LIST(page.value, perPage.value);
    if (res.code == 1000) {
        records.value = res.data.records.map((record, index) => ({
            ...record,
            index: (page.value - 1) * perPage.value + index + 1
        }));
        total.value = res.data.meta.total;
    }
}

const saveRecord = async () => {
    isSaving.value = true;

    let res = null;
    if (selectedRecord.value) {
        res = await UPDATE_REFERENCE_IMAGE(selectedRecord.value.id, obj.value.name, obj.value.image_url);
    } else {
        res = await CREATE_REFERENCE_IMAGE(obj.value.name, obj.value.image_url);
    }

    if (res.code === 1000) {
        closeDialog();
        getRecords();
    } else {
        toast.error(res.message);
    }
    isSaving.value = false;
}

const editRecord = (item) => {
    selectedRecord.value = item;
    obj.value.name = item.name;
    obj.value.image_url = item.image_url;
    dialog.value = true;
}

const confirmDelete = (record) => {
    selectedRecord.value = record;
    deleteDialog.value = true;
}

const deleteRecord = async () => {
    isDeleting.value = true;
    const res = await DELETE_REFERENCE_IMAGE(selectedRecord.value.id);
    if (res.code === 1000) {
        toast.info(res.message);
        getRecords();
    } else {
        toast.error(res.message);
    }
    isDeleting.value = false;
    closeDialog();
}
</script>