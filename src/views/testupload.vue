<template>
  <div>
    <!-- Content Image Upload -->
    <el-divider content-position="center">原始图片</el-divider>
    <el-upload
        class="upload-demo"
        action=""
        :auto-upload="false"
        :file-list="contentImage ? [contentImage] : []"
        :on-change="handleContentImageChange"
        :before-remove="()=>{contentImage=null;}"
        :show-file-list="true"
        accept=".jpg,.jpeg,.png,.bmp"
        drag
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">只接受jpg/png/BMP文件</div>
    </el-upload>

    <!-- Style Images Upload -->
    <el-divider content-position="center">风格设置</el-divider>
    <el-switch v-model="layoutMode" active-text="提示词模式" inactive-text="风格图模式"
               style="--el-switch-on-color: #b7b7b7; --el-switch-off-color: #b7b7b7"/>

    <!-- Images Grid -->

    <div v-if="layoutMode">
      <el-input
          v-model="textarea"
          style="width: 680px"
          :rows="6"
          type="textarea"
          placeholder="请描述你希望做出的改动"
      />
    </div>
    <el-upload
        v-if="!layoutMode"
        class="upload-demo"
        action=""
        list-type="picture-card"
        :auto-upload="false"
        :file-list="styleImages.map(img => img.file)"
        :on-change="handleStyleImageChange"
        multiple
        accept=".jpg,.jpeg,.png,.bmp"
    >
      <template #file="{ file }">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <!-- 图片缩略图 -->
          <!--          <img class="el-upload-list__item-thumbnail" :src="file.url" alt=""-->
          <!--               style="max-width: 100px; margin-bottom: 10px;"/>-->
          <img class="el-upload-list__item-thumbnail" :src="file.url" alt=""/>
          <!-- 操作按钮 -->
          <span class="el-upload-list__item-actions"
                style="display: flex; justify-content: center; gap: 12px; width: 100%;">
      <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
        <el-icon><zoom-in/></el-icon>
      </span>
      <span class="el-upload-list__item-delete" @click="handleRemoveStyleImage(file)">
        <el-icon><delete/></el-icon>
      </span>
    </span>
          <!-- 融合比例调整滑块 -->
          <el-slider
              v-model="file.opacity"
              :min="0"
              :max="100"
              :step="1"
              style="width: 100%;"
          ></el-slider>
        </div>
      </template>
      <el-icon>
        <plus/>
      </el-icon>
    </el-upload>

    <el-dialog v-model="dialogVisible" width="80%">
      <div class="image-container">
        <img :src="dialogImageUrl" alt="Preview Image"/>
      </div>
    </el-dialog>
    <!-- Submit Button -->
    <el-button type="primary" @click="submitUpload">上传图片</el-button>

  </div>
</template>

<script lang="ts">
import {ref} from 'vue';
import {uploadImages} from '@/utils/api';
import {Delete, Plus, ZoomIn} from '@element-plus/icons-vue';
import {ElMessage, UploadFile} from "element-plus";

export default {
  components: {
    ZoomIn,
    Delete,
    Plus
  },
  setup() {
    // State for content image and style images
    const contentImage = ref(null);
    const styleImages = ref([]);
    const dialogVisible = ref(false);
    const dialogImageUrl = ref('');
    let layoutMode = ref(false);
    let textarea = ref("");
    // Handle content image change
    const handleContentImageChange = (file) => {
      contentImage.value = file;
    };

    const handleRemove = (file: UploadFile) => {
      console.log(file)
    }

    const handlePictureCardPreview = (file: UploadFile) => {
      dialogImageUrl.value = file.url!
      dialogVisible.value = true
    }

    // Handle style image addition
    const handleStyleImageChange = (file, fileList) => {
      styleImages.value = fileList.map((file) => ({
        file,
        parameter: 50  // Default fusion ratio for each style image
      }));
    };

    // Remove a style image
    const handleRemoveStyleImage = (file) => {
      const index = styleImages.value.findIndex((image) => image.file.uid === file.uid);
      if (index !== -1) styleImages.value.splice(index, 1);
    };

    // Submit function to upload images
    const submitUpload = async () => {
      if (!contentImage.value) {
        console.warn("请先上传内容图片！");
        ElMessage.error('请先上传内容图片')
        return;
      }
      const formData = new FormData();
      formData.append('content_image', contentImage.value.raw);
      styleImages.value.forEach((image) => {
        formData.append('style_image', image.file.raw);
      });
      try {
        const response = await uploadImages(formData);
        console.log('上传成功:', response.data);
        ElMessage.success('上传成功')

      } catch (error) {
        console.error("上传失败", error);
        ElMessage.error('上传失败'+error.message)
      }
    };
    return {
      contentImage,
      styleImages,
      dialogVisible,
      dialogImageUrl,
      layoutMode,
      textarea,
      handleContentImageChange,
      handleStyleImageChange,
      handleRemoveStyleImage,
      submitUpload,
      handlePictureCardPreview
    };
  },
};
</script>

<style scoped>
.upload-demo {
  margin-bottom: 20px;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  max-height: 80vh; /* 限制最大高度 */
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 确保图片保持比例缩放 */
}

</style>
