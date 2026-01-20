<template>
    <div>
        <Drawer />
        <Appbar />
        <router-view class="pa-3" />
    </div>
</template>

<script setup>
import Appbar from '@/components/Appbar.vue'
import Drawer from '@/components/Drawer.vue'
</script>