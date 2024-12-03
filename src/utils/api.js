
import axios from 'axios';

//const url = "127.0.0.1:5000/api"  //改IP地址
const url = "127.0.0.1:5000/api"
// 设置基础请求 URL
const apiUrl = 'http://' + url

console.log("axios创建")
//创建 axios 实例
const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});
//const api = axios;

// 请求拦截器：添加 JWT Token 到请求头
api.interceptors.request.use(
    (config) => {
        let serverIP = localStorage.getItem('server_ip')
        config.baseURL = 'http://'+serverIP+':5000/';
        const token = localStorage.getItem('token'); //
        console.log("拦截器生效")
        console.log("token_from_local:"+token)
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log("JWT SET SUCCESS")
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 注册方法
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('注册失败:', error);
        throw error;
    }
};

// 登录方法
export const login = async (loginData) => {
    try {
        const response = await api.post('/auth/login', loginData);
        return response.data;
    } catch (error) {
        console.error('登录失败:', error);
        throw error;
    }
};

// 定义上传图片的接口
export function uploadImages(data) {
    return api.post('/image/upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// 4. 执行风格迁移
export const stylizeImage = async (contentImageUrl, styleImageUrls, options, styleModel) => {
    try {
        const response = await api.post('/image/stylize', {
            content_image_url: contentImageUrl,
            style_image_urls: styleImageUrls,
            options: options || {},
            style_model: styleModel,
        });
        return response.data;
    } catch (error) {
        console.error('风格迁移失败:', error);
        throw error;
    }
};

// 5. 获取单张图片
export const getImage = async (imageUrl) => {
    try {
        const response = await api.get('/image/get', {
            params: {
                image_url: imageUrl,
            },
            responseType: 'blob', // 确保返回的是二进制流
        });
        return response; // 返回二进制数据
    } catch (error) {
        console.error('获取图片失败:', error);
        throw error;
    }
};


// 6. 查询历史记录
export const getHistory = async (userId) => {
    try {
        const response = await api.get('/history/query', {
            params: {
                user_id: userId,
            },
        });
        return response.data;
    } catch (error) {
        console.error('查询历史记录失败:', error);
        throw error;
    }
};
