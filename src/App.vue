<template>
  <div id="app">
    <Header v-if="isAuthenticated"></Header>
    <!-- ·����ͼ -->
    <router-view></router-view>
  </div>
</template>

<script lang="ts" setup>
import Header from "@/views/Header.vue";
import {computed} from "vue";
import {useUserStore} from '@/stores/userStore'
const userStore = useUserStore()
const isAuthenticated = computed(() => !!userStore.token)
</script>

<style>

</style>