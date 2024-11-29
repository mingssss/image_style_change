<template>

  <div class="common-layout">


    <el-row :gutter="20">
      <!-- Left Column -->
      <el-col :span="12">
        <el-card>
          <!-- Model and Style Selection -->
          <el-row :gutter="10">
            <el-col :span="12">
              <el-select v-model="selectedModel" placeholder="模型选择">
                <el-option label="vgg19" value="vgg19"/>
                <el-option label="arb_styl" value="arb_styl"/>
                <el-option label="csgo" value="csgo"/>
                <el-option label="snp" value="snp"/>
              </el-select>
            </el-col>
          </el-row>

          <div>
            <!-- Content Image Upload -->
            <el-divider content-position="center">原始图片</el-divider>
            <el-upload
                class="upload-demo"
                action=""
                list-type="picture"
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
            <!-- Images Grid -->
            <div v-if="selectedModel=='snp'">
              transfer_mode:
              <el-switch
                  v-model="transfer_mode"
                  class="mt-2"
                  style="margin-left: 24px"
                  inline-prompt
                  :active-icon="Check"
                  :inactive-icon="Close"
              />
            </div>

            <div v-if="selectedModel=='csgo'" style="margin-bottom:10px" >
              <el-input
                  v-model="prompt"

                  :rows="3"
                  type="textarea"
                  placeholder="请输入内容，用于指导生成器生成图片（a cute cat）"
              />
            </div>
            <el-upload
                v-if="selectedModel=='vgg19'"
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
                      v-model="file.parameter"
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

            <el-upload
                v-if="selectedModel!='vgg19'"
                class="upload-demo"
                action=""
                list-type="picture-card"
                :auto-upload="false"
                :file-list="styleImages2 ? [styleImages2] : []"
                :on-change="handleStyleImageChange2"
                accept=".jpg,.jpeg,.png,.bmp"
            >
              <template #file="{ file }">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <!-- 图片缩略图 -->
                  <img class="el-upload-list__item-thumbnail" :src="file.url" alt=""/>
                  <!-- 操作按钮 -->
                  <span class="el-upload-list__item-actions"
                        style="display: flex; justify-content: center; gap: 12px; width: 100%;">
      <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
        <el-icon><zoom-in/></el-icon>
      </span>
    </span>
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
          <div v-if="selectedModel=='vgg19'">
            <el-divider content-position="center">参数调节</el-divider>
            <el-row :gutter="10" style="margin-top: 10px;">
              <el-col :span="11">
                <div class="slider-demo-block">
                  <span class="demonstration">content_weight</span>
                  <el-slider v-model="options.content_weight" :min="0" :max="100" show-input size="small"/>
                </div>
                <div class="slider-demo-block">
                  <span class="demonstration">style_weight</span>
                  <el-slider v-model="options.style_weight" :min="0" :max="100" show-input size="small"/>
                </div>
              </el-col>

              <el-col :span="11" :offset="1">
                <div class="slider-demo-block">
                  <span class="demonstration">epochs</span>
                  <el-slider v-model="options.epochs" :min="0" :max="100" show-input size="small"/>
                </div>
                <div class="slider-demo-block">
                  <span class="demonstration">steps_per_epoch</span>
                  <el-slider v-model="options.steps_per_epoch" :min="0" :max="100" show-input size="small"/>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="form-bottom">
            <el-row :gutter="10" style="margin-top: 20px;">
              <el-button type="danger" @click="reset">重置</el-button>
              <el-button type="primary" @click="submit">提交</el-button>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <!-- Right Column -->
      <el-col :span="12" >
        <el-card>
          <el-row v-if="processFinish">
            <el-text class="mx-1" type="primary" size="large">
              <el-icon color="#409eff">
                <Check/>
              </el-icon>
              生成成功
            </el-text>
          </el-row>
          <el-divider content-position="center">生成结果</el-divider>
          <div class="media-container">
            <div class="media-item" v-for="(image, index) in imageUrl" :key="index">
              <el-image :preview-src-list="imageUrl" :initial-index="index" :src="image" :alt="'Image ' + (index + 1)" class="media"/>
            </div>

            <div v-if="videoUrls.length > 0">
              <div class="media-item" v-for="(videoUrl, index) in videoUrls" :key="index">
                <video :src="videoUrl" controls class="media">
                  您的浏览器不支持播放该视频
                </video>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import {reactive, ref} from 'vue';
import {Check, Close, Delete, Plus, ZoomIn} from '@element-plus/icons-vue';
import {ElLoading, ElMessage, UploadFile} from 'element-plus';
import {getImage, stylizeImage} from '@/utils/api';
import {uploadImages} from '@/utils/api';

export default {
  computed: {
    Check() {
      return Check
    },
    Close() {
      return Close
    }
  },
  components: {Check, Delete, Plus, ZoomIn},
  setup() {
    // State for content image and style images
    const contentImage = ref(null);
    const styleImages2 = ref(null);
    const imageUrl = ref([]);
    let videoUrls = ref([]);
    const styleImages = ref([]);
    const dialogVisible = ref(false);
    const dialogImageUrl = ref('');
    let transfer_mode = ref(false);
    let prompt = ref("");
    let backContentImage = "";
    let backStyleImage = [];
    let resultImageUrls = [];
    let processFinish = ref(false);
    let options = reactive({
      content_weight: 100,
      style_weight: 100,
      epochs: 3,
      steps_per_epoch: 10,
      sub_style_weights: []
    })
    // Handle content image change
    const handleContentImageChange = (file) => {
      contentImage.value = file;
    };
    const handlePictureCardPreview = (file: UploadFile) => {
      dialogImageUrl.value = file.url!
      dialogVisible.value = true
    }

    // Handle style image addition
    const handleStyleImageChange = (file, fileList) => {
      console.log("handleStyleImageChange")
      styleImages.value = fileList.map((file) => ({
        file,
        parameter: 50,
      }));
    };
    const handleStyleImageChange2 = (file, fileList) => {
      console.log("handleStyleImageChange2")
      styleImages2.value = file;
    };
    // Remove a style image
    const handleRemoveStyleImage = (file) => {
      const index = styleImages.value.findIndex((image) => image.file.uid === file.uid);
      if (index !== -1) styleImages.value.splice(index, 1);
    };

    // Submit function to upload images
    const submitUpload = async () => {
      if (!contentImage.value && selectedModel.value != 'csgo') {
        console.warn("请先上传内容图片！");
        ElMessage.error('请先上传内容图片')
        return;
      }
      if (selectedModel.value != 'vgg19') {
        if (!styleImages2.value && selectedModel.value != 'snp') {
          ElMessage.error('请先上传风格图片')
          return;
        }
      } else {
        if (styleImages.value.length == 0) {
          ElMessage.error('请先上传风格图片')
          return;
        }
      }

      const formData = new FormData();
      if (contentImage.value) {
        formData.append('content_image', contentImage.value.raw);
      }
      if (selectedModel.value == 'vgg19') {
        styleImages.value.forEach((image) => {
          formData.append('style_image', image.file.raw);
          console.log("----------------")
          console.log(image.file.parameter)
          if (image.file.parameter)
            options.sub_style_weights.push(image.file.parameter)
        });
      } else {
        if (styleImages2.value) {
          formData.append('style_image', styleImages2.value.raw);
        }
      }

      try {
        const response = await uploadImages(formData);
        console.log('上传成功:', response.data);
        ElMessage.success('上传成功')
        backContentImage = response.data.content_image_url
        backStyleImage = response.data.style_image_urls
      } catch (error) {
        console.error("上传失败", error);
        ElMessage.error('上传失败' + error.message)
      }
    }

    const disabled = ref(false)

    const selectedModel = ref('vgg19');
    const selectedStyle = ref('');
    const blendRatio = ref(50);
    const brightness = ref(50);
    const transparency = ref(50);
    const saturation = ref(50);
    let steps_per_epoch = ref([]);


    const addImage = () => {
      // Logic to add image
    };

    const reset = () => {
      selectedModel.value = 'vgg19';
      selectedStyle.value = '';
      blendRatio.value = 50;
      brightness.value = 50;
      transparency.value = 50;
      saturation.value = 50;
      prompt.value = null;
      transfer_mode.value = null;
      videoUrls.value = [];
      imageUrl.value = [];
    };

    const submit = async () => {
      videoUrls.value = [];
      imageUrl.value = [];
      const loading = ElLoading.service({
        lock: true,
        text: '执行中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      if (selectedModel.value === 'vgg19') {
        console.log(backStyleImage)
        if (options.sub_style_weights.length === 0) {
          for (let i = 0; i < backStyleImage.length; i++) {
            options.sub_style_weights.push(10)
          }
        }

      } else if (selectedModel.value === 'arb_styl') {
        options = {};
      } else if (selectedModel.value === 'csgo') {
        options = reactive({prompt: prompt.value});
      } else if (selectedModel.value === 'snp') {
        options = {transfer_mode: transfer_mode.value}
      }
      console.log("options")
      console.log(options)
      try {
        const response = await stylizeImage(backContentImage, backStyleImage, options, selectedModel.value);
        console.log(response)
        resultImageUrls = response.result_image_url
        loading.close();
        processFinish.value = true;
        if (selectedModel.value == 'vgg19') {
          for (let i = 0; i < resultImageUrls.length; i++) {
            const response = await getImage(resultImageUrls[i]);
            const binaryData = response.data
            const contentType = response.headers['content-type']
            // 将二进制数据转换为 Blob
            const blob = new Blob([binaryData], {type: contentType});
            // 生成 Blob URL
            if (contentType.startsWith('image/')) {
              // 显示图片
              console.log("显示图片")
              imageUrl.value.push(URL.createObjectURL(blob));
            } else if (contentType.startsWith('video/')) {
              // 显示视频
              videoUrls.value.push(URL.createObjectURL(blob))
            }
          }
        } else if (selectedModel.value == 'snp') {
          console.log("snp----")
          console.log(resultImageUrls)
          for (let i = 0; i < resultImageUrls.length; i++) {
            const response = await getImage(resultImageUrls[i]);
            console.log(response)
            const binaryData = response.data
            const contentType = response.headers['content-type']
            console.log(contentType)
            const blob = new Blob([binaryData], {type: contentType});
            if (contentType.startsWith('image/')) {
              // 显示图片
              console.log("显示图片")
              imageUrl.value.push(URL.createObjectURL(blob));
            } else if (contentType.startsWith('video/')) {
              // 显示视频
              videoUrls.value.push(URL.createObjectURL(blob))
            }
          }
        } else {
          try {
            // 请求图片的二进制数据
            const response = await getImage(resultImageUrls[0]);
            const binaryData = response.data
            const contentType = response.headers['content-type']
            // 将二进制数据转换为 Blob
            const blob = new Blob([binaryData], {type: contentType});
            // 生成 Blob URL
            imageUrl.value.push(URL.createObjectURL(blob));
          } catch (error) {
            ElMessage.error("请求失败，请重试");
          }
        }
        options.sub_style_weights = []

      } catch (error) {
        loading.close();
        ElMessage.error("请求失败，请重试");
      }



    };
    return {
      disabled,
      options,
      dialogVisible,
      dialogImageUrl,
      selectedModel,
      selectedStyle,
      blendRatio,
      brightness,
      transparency,
      saturation,
      transfer_mode,
      prompt,
      steps_per_epoch,
      imageUrl,
      styleImages2,
      videoUrls,
      handleStyleImageChange2,
      addImage,
      reset,
      submit,
      contentImage,
      styleImages,
      processFinish,
      dialogVisible,
      dialogImageUrl,
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

.form-bottom {
  display: flex;
  justify-content: flex-end;
}

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

.media-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px; /* 控制每项之间的间距 */
}

.media-item {
  flex: 1 1 calc(50% - 10px); /* 每项占据容器的三分之一宽度，并考虑到间距 */
  max-width: 100%;
}

.media {
  width: 100%;
  height: auto;
}
</style>
