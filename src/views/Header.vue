<template>
  <div style="display: flex; justify-content: space-between; align-items: center; overflow: hidden;">
    <!-- 页面标题部分 -->
    <div @click="goHome" style="cursor: pointer;">
      <h1 style="margin: 0; margin-left: 10px; font-size: 20px; font-weight: normal;">风格迁移工具</h1>
    </div>
    <!-- 用户下拉菜单部分 -->
    <div>
      <el-dropdown @command="handleCommand">
        <span>
          {{ username }}<el-icon class="el-icon--right"><arrow-down/></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="history">历史记录</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()
const username = userStore.username

const handleLogout = () => {
  // 清除用户信息并跳转到登录页面
  userStore.logout()
  localStorage.removeItem('auth_token')
  router.push({ name: 'Login' })
}

const handleHistory = () => {
  router.push({ name: 'History' })
}

const handleCommand = (command: string | number | object) => {
  if (command === 'history') {
    ElMessage(`click on item ${command}`)
    handleHistory()
  } else if (command === 'logout') {
    ElMessage(`click on item ${command}`)
    handleLogout()
  }
}

// 返回主页的处理逻辑
const goHome = () => {
  router.push({ name: 'HomePage' }) // 假设主页的路由名称为 'Home'
}
</script>

<style scoped>
/* 保持标题与下拉菜单对齐 */
h1 {
  line-height: 2;
}
</style>
