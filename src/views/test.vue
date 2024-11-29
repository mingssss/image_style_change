<template>
  <div class="container">
    <!-- Model and Style Selection -->
    <el-row :gutter="20" class="selection-section">
      <el-col :span="12">
        <el-select v-model="model" placeholder="模型选择">
          <el-option label="Model 1" value="model1"></el-option>
          <el-option label="Model 2" value="model2"></el-option>
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-select v-model="style" placeholder="风格选择">
          <el-option label="Style 1" value="style1"></el-option>
          <el-option label="Style 2" value="style2"></el-option>
        </el-select>
      </el-col>
    </el-row>

    <!-- Image Upload Section -->
    <div class="upload-section">
      <el-upload action="" list-type="picture-card">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或 <a href="#">点击上传</a></div>
      </el-upload>
      <p>只支持jpg/png/BMP文件</p>
    </div>

    <!-- Sliders Section -->
    <div class="slider-section">
      <el-row>
        <el-col :span="24">
          <div class="slider">
            <span>融合比</span>
            <el-slider v-model="fusion" :step="1" />
          </div>
          <div class="slider">
            <span>亮度</span>
            <el-slider v-model="brightness" :step="1" />
          </div>
          <div class="slider">
            <span>透明度</span>
            <el-slider v-model="transparency" :step="1" />
          </div>
          <div class="slider">
            <span>饱和度</span>
            <el-slider v-model="saturation" :step="1" />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Image Preview Section -->
    <el-row class="preview-section">
      <el-col :span="24">
        <el-switch v-model="isStyleMode" active-text="风格图模式" inactive-text="提示词模式"></el-switch>
        <el-button>风格图片</el-button>
        <div class="image-preview">
          <img src="" alt="Image 1" />
          <img src="" alt="Image 2" />
          <img src="" alt="Image 3" />
          <div class="add-image">+</div>
        </div>
      </el-col>
    </el-row>

    <!-- Submit and Reset Buttons -->
    <div class="action-buttons">
      <el-button @click="reset">重置</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const model = ref(null);
    const style = ref(null);
    const fusion = ref(50);
    const brightness = ref(50);
    const transparency = ref(50);
    const saturation = ref(50);
    const isStyleMode = ref(true);

    const reset = () => {
      model.value = null;
      style.value = null;
      fusion.value = 50;
      brightness.value = 50;
      transparency.value = 50;
      saturation.value = 50;
      isStyleMode.value = true;
    };

    const submit = () => {
      // Submit action logic
    };

    return {
      model,
      style,
      fusion,
      brightness,
      transparency,
      saturation,
      isStyleMode,
      reset,
      submit,
    };
  },
};
</script>

<style scoped>
.container {
  border: 1px solid #eee;
  padding: 20px;
}

.selection-section {
  margin-bottom: 20px;
}

.upload-section {
  margin: 20px 0;
  text-align: center;
}

.upload-section p {
  font-size: 12px;
  color: #999;
}

.slider-section {
  margin: 20px 0;
}

.slider {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.preview-section {
  margin-top: 20px;
}

.image-preview {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.image-preview img {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 75px;
  border: 1px dashed #ddd;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.action-buttons .el-button {
  margin-left: 10px;
}
</style>
