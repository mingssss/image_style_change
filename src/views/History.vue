<template>
  <el-progress :percentage="percentage" :format="format" />
  <el-divider content-position="center">历史记录</el-divider>
  <el-container>

    <el-main>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(historyItem, index) in historyData" :key="index">
          <el-card :body-style="{ padding: '20px' }">
            <!-- Additional Information -->
            <div class="info">
              <el-row>
                <el-col :span="12"><strong>Style Model:</strong> {{ historyItem.style_model }}</el-col>
                <el-col :span="12"><strong>Created At:</strong> {{ formatDate(historyItem.created_at) }}</el-col>
                <el-col v-if="historyItem.style_model==='csgo'" :span="12"><strong>Prompt:</strong>
                  {{ historyItem.params.prompt }}
                </el-col>
                <el-col v-if="historyItem.style_model==='snp'" :span="12"><strong>transfer_mode:</strong>
                  {{ historyItem.params.transfer_mode }}
                </el-col>
                <el-col v-if="historyItem.style_model==='vgg19'">
                  <el-button
                      :type="'primary'"
                      link
                      @click="show_option(historyItem.params)"
                  >
                    点击查看详细参数
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <!-- Display content image -->
            <div v-if="historyItem.content_image_url">
              <el-divider content-position="center">原始图片</el-divider>
              <div class="image-container">
                <el-image :src="historyItem.content_image_url" :initial-index="0"
                          :preview-src-list="[historyItem.content_image_url]" alt="Style Image" class="style-image"/>
              </div>
            </div>
            <!-- Style Images -->
            <div v-if="historyItem.style_image_urls.length!==0&&historyItem.style_image_urls[0]!==''">
              <el-divider content-position="center">风格图片</el-divider>
              <div class="style-images">
                <el-row :gutter="10">
                  <el-col :span="12" v-for="(styleImage, idx) in historyItem.style_image_urls" :key="idx">
                    <el-image :src="styleImage" :initial-index="idx" :preview-src-list="historyItem.style_image_urls"
                              alt="Style Image" class="style-image"/>
                  </el-col>
                </el-row>
              </div>
            </div>

            <el-divider content-position="center">结果图片</el-divider>
            <!-- Result Images -->
            <div class="result-images">
              <el-row :gutter="10">
                <el-col :span="12" v-for="(resultImage, idx) in historyItem.result_image_url" :key="idx">
                  <el-image :src="resultImage" :preview-src-list="historyItem.result_image_url" :initial-index="idx"
                            alt="Result Image" class="result-image"/>

                </el-col>
                <div v-if="historyItem.video_urls.length > 0">
                  <div class="media-item" v-for="(videoUrl, index) in historyItem.video_urls" :key="index">
                    <video :src="videoUrl" controls class="result-image">
                      您的浏览器不支持播放该视频
                    </video>
                  </div>
                </div>
              </el-row>
            </div>


          </el-card>
        </el-col>
      </el-row>
      <el-dialog v-model="is_show_options" title="详细参数查看" width="30%" center align-center draggable >
        <el-descriptions title="详细参数">
          <el-descriptions-item label="content_weight:">{{params.content_weight}}</el-descriptions-item>
          <el-descriptions-item label="epochs:">{{params.epochs}}</el-descriptions-item>
          <el-descriptions-item label="style_weight:">{{params.style_weight}}</el-descriptions-item>
          <el-descriptions-item label="steps_per_epoch:">
            {{params.steps_per_epoch}}
          </el-descriptions-item>
          <el-descriptions-item label="sub_style_weights:">
            {{params.sub_style_weights}}
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </el-main>

  </el-container>

</template>

<script>
import {onMounted, reactive, ref} from 'vue';
import {ElCard, ElRow, ElCol, ElContainer, ElHeader, ElMain, ElMessage} from 'element-plus';
import {getHistory, getImage} from "@/utils/api.js";

export default {
  name: 'History',
  components: {
    ElCard,
    ElRow,
    ElCol,
    ElContainer,
    ElHeader,
    ElMain
  },
  setup() {
    // //"history": [
    //     {
    //         "history_id": 1,
    //         "content_image_url": "/static/uploads/content.jpg",
    //         "style_image_urls": [
    //             "/static/uploads/style1.jpg",
    //             "/static/uploads/style2.jpg"
    //         ],
    //         "result_image_url": [  // 如果为vgg19模型，返回每个epoch的结果
    //             "/static/output/style1.jpg",
    //             "/static/output/style2.jpg"
    //         ],
    //         "style_model": "vgg19",
    //         "created_at": "2024-10-29T12:34:56"
    //     }
    // ]
    // 所以historyData的结构为
    const historyData = ref([]);
    // const historyData = ref([
    //   {
    //     "content_image_url": "",
    //     "created_at": "Sun, 01 Dec 2024 19:36:57 GMT",
    //     "params": {
    //       "transfer_mode": false,
    //     },
    //     "result_image_url": [
    //       "./static/output/1733053017313_out.png"
    //     ],
    //     "video_urls": [
    //       "./static/output/1733053017313_out.png"
    //     ],
    //     "style_image_urls": [
    //       "./static/style_image/1733052933939_candy.jpg"
    //     ],
    //     "style_model": "snp"
    //   },
    //   {
    //     "content_image_url": "./static/content_image/1733052933935_figures.jpg",
    //     "created_at": "Sun, 01 Dec 2024 19:43:57 GMT",
    //     "params": {
    //       "content_weight": 50,
    //       "style_weight": 80,
    //       "epochs": 3,
    //       "steps_per_epoch": 10,
    //       "sub_style_weights": [10, 10]
    //     },
    //     "result_image_url": [
    //       "./static/output/1733053437377_out.png"
    //     ],
    //     "video_urls": [
    //       "./static/output/1733053017313_out.png"
    //     ],
    //     "style_image_urls": [
    //       "./static/style_image/1733052933939_candy.jpg"
    //     ],
    //     "style_model": "vgg19"
    //   }
    // ]);

    // const historyData = ref([
    //
    // ]);
    //当页面加载时，获取历史记录
    const user_id = localStorage.getItem('user_id');
    let percentage = ref(0);
    const format = (percentage) => (percentage === 100 ? '加载完成' : `${percentage}%`)
    onMounted(() => {
      console.log('获取历史记录')
      getHistory(user_id || "test").then(async res => {
        console.log(res.history)
        let full = res.history.length;
        for (let i = 0; i < res.history.length; i++) {
          percentage.value = ((i+1)/full*100).toFixed(2);
          //应该使用push，而不是直接赋值
          historyData.value.push({
            history_id: 0,
            content_image_url: "",
            style_image_urls: [],
            result_image_url: [],
            video_urls: [],
            style_model: "",
            created_at: "",
            params: {}
          });
          historyData.value[i].history_id = res.history[i].history_id;
          historyData.value[i].created_at = res.history[i].created_at;
          historyData.value[i].style_model = res.history[i].style_model;
          historyData.value[i].params = res.history[i].params;

          // 获取内容图片
          if(res.history[i].content_image_url !== null&&res.history[i].content_image_url !== "")
          {
            try{
              const response = await getImage(res.history[i].content_image_url);
              const binaryData = response.data
              const contentType = response.headers['content-type']
              // 将二进制数据转换为 Blob
              const blob = new Blob([binaryData], {type: contentType});
              // 生成 Blob URL
              historyData.value[i].content_image_url = URL.createObjectURL(blob);
            }catch (e) {
              ElMessage.error(e)
            }
          }

          // 获取风格图片

          console.log("获取风格图片")
          console.log(res.history[i].style_image_urls)
          for (let j = 0; j < res.history[i].style_image_urls.length; j++) {
            if(res.history[i].style_image_urls[j]!=='') {
              const response = await getImage(res.history[i].style_image_urls[j]);
              const binaryData = response.data
              const contentType = response.headers['content-type']
              const blob = new Blob([binaryData], {type: contentType});
              historyData.value[i].style_image_urls[j] = URL.createObjectURL(blob);
            }
          }
          // 获取结果图片
          console.log("获取结果图片")
          console.log(res.history[i].result_image_url)
          for (let j = 0; j < res.history[i].result_image_url.length; j++) {
            console.log("response")
            try {
             const  response = await getImage(res.history[i].result_image_url[j]);
              const binaryData = response.data
              const contentType = response.headers['content-type']
              console.log(contentType)
              const blob = new Blob([binaryData], {type: contentType});
              if (contentType.startsWith('image/')) {
                // 显示图片
                console.log("显示图片")
                historyData.value[i].result_image_url[j] = URL.createObjectURL(blob);
              } else if (contentType.startsWith('video/')) {
                console.log("显示视频")
                console.log(res.history[i])
                // 显示视频，videoUrls应该是historyData.value[i].video_urls
                historyData.value[i].video_urls.push(URL.createObjectURL(blob));
                //videoUrls.value.push(URL.createObjectURL(blob));
              }
            }catch (e) {
              ElMessage.error(e)
            }
          }
          // 删除historyData.value[i].result_image_url中视频的url，也就是删除不以blob:开头的url
          historyData.value[i].result_image_url = historyData.value[i].result_image_url.filter(url => url.startsWith('blob:'));
          //console.log(historyData.value[i].result_image_url)
        }
      });
    });
    // Helper function to format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };
    let is_show_options = ref(false);
    let params = ref({
      "content_weight": 100,
      "style_weight": 100,
      "epochs": 3,
      "steps_per_epoch": 10,
      "sub_style_weights": [10, 10]
    })
    const show_option = (option) => {
      params.value = option
      is_show_options.value = true;
    }
    return {
      historyData,
      percentage,
      format,
      formatDate,
      is_show_options,
      show_option,
      params
    };
  }
};
</script>

<style scoped>
.image-container {
  text-align: center;
}

.image {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.style-image, .result-image {
  text-align: center;
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.info {
  margin-top: 20px;
  color: #666;
}

h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}
</style>
