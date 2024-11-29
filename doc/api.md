
---

# **风格迁移图像处理项目 API 文档**

## **基础信息**

- **服务地址**: `http://<server-ip>:5000/api`
- **数据格式**: JSON
- **授权方式**: JWT Token（`Authorization: Bearer <token>`）

---

## **1. 用户注册**

### **POST** `/auth/register`

#### **描述**
用户注册接口。

#### **请求示例**

```json
{
    "username": "xxx",
    "password": "xxx",
    "email": "xxx@example.com"
}
```

#### **响应示例**

```json
{
    "code": 200,
    "message": "User registered successfully"
}
```

---

## **2. 用户登录**

### **POST** `/auth/login`

#### **描述**
用户登录接口，返回 JWT Token。

#### **请求示例**

```json
{
    "username": "xxx",
    "password": "xxx"
}
```

#### **响应示例**

```json
{
    "code": 200,
    "token": "xxxx..."
}
```

---

## **3. 上传内容图片和风格图片**

### **POST** `/image/upload`

#### **描述**
上传内容图片和多张风格图片。

#### **Headers**

```
Authorization: Bearer <token>
```

#### **Body** (form-data)

| Key            | Type  | Value             |
|----------------|-------|------------------|
| content_image  | File  | 上传的内容图片     |
| style_image    | File  | 上传的风格图片 (可多选) |

#### **响应示例**

```json
{
    "code": 200,
    "content_image_url": "/static/uploads/content.jpg",
    "style_image_urls": [
        "/static/uploads/style1.jpg",
        "/static/uploads/style2.jpg"
    ]
}
```

---

## **4. 执行风格迁移**

### **POST** `/image/stylize`

#### **描述**
执行风格迁移，并返回生成的图片。

#### **Headers**

```
Authorization: Bearer <token>
```

#### **请求示例**

---

## **4. 执行风格迁移**

### **POST** `/image/stylize`

#### **描述**
执行风格迁移，并返回生成的图片。

#### **Headers**

```
Authorization: Bearer <token>
```

#### **请求示例**

```json
{
    "content_image_url": "/static/uploads/content.jpg",  // 除style_model=csgo外，必须传。如果csgo不传该字段，则必传prompt
    "style_image_urls": [
        "/static/uploads/style1.jpg",
        "/static/uploads/style2.jpg"
    ],  // 只有style_model=vgg19支持多选；只有snp可以不传。
    "options": {  // 这些都可选
        // arb_styl 不需要传任何参数

        // 以下部分为style_model=vgg19支持的参数
        "content_weight": 100,
        "style_weight": 100,  
        "epochs": 3,          
        "steps_per_epoch": 10,
        "sub_style_weights": [10, 10],  // 各风格图片的权重配比，次序要跟style_image_urls一致，

        // 以下部分为csgo支持的参数
        "prompt": "a cute cat", // 用于指导生成器生成图片

        // snp支持
        "transfer_mode": 0,     // 0: transfer color only; else:transfer both color and texture
    },
    "style_model": "vgg19"  // 目前只支持这些： vgg19、arb_styl、csgo、snp
}
```

#### **响应示例**

```json
{
    "code": 200,
    "result_image_url": [  // 如果为arb_styl、csgo模型，则列表内只有一个内容；如果为vgg19模型，列表内依次为每个epoch的结果；
        // 如果为snp模型，则：如果没传style_image_urls，返回两个链接。第一个为图片，第二个为视频。如果传了style_image_urls，返回4个链接。第一个为图片，第二个为视频。第三个为图片，第四个为视频。
        "/static/output/style1.jpg",
        "/static/output/style2.jpg"
    ]
}
```
---

## **5. 获取单张图片**

### **GET** `/image/get`

#### **描述**
根据历史记录 ID 返回对应的图片文件。

#### **Headers**

```
Authorization: Bearer <token>
```

#### **请求示例**

```json
{
    "image_url": "/static/output/style2.jpg"
}
```

#### **响应示例**

- 成功时返回图片文件。
- 失败时返回：

```json
{
    "code": 404,
    "message": "Image not found"
}
```

---

## **6. 查询历史记录**

### **GET** `/history/query`

#### **描述**
查询用户的图片处理历史记录。

#### **Headers**

```
Authorization: Bearer <token>
```

#### **请求参数**

| 参数名  | 类型   | 描述             |
|--------|--------|------------------|
| user_id | Int   | 用户ID |

#### **响应示例**

```json
{
    "code": 200,
    "history": [
        {
            "history_id": 1,
            "content_image_url": "/static/uploads/content.jpg",
            "style_image_urls": [
                "/static/uploads/style1.jpg",
                "/static/uploads/style2.jpg"
            ],
            "result_image_url": [  // 如果为vgg19模型，返回每个epoch的结果
                "/static/output/style1.jpg",
                "/static/output/style2.jpg"
            ],
            "style_model": "vgg19",
            "created_at": "2024-10-29T12:34:56"
        }
    ]
}
```

---

## **7. 错误响应格式**

#### **示例**

```json
{
    "code": 400,
    "message": "Bad Request"
}
```

---

## **8. 认证与授权**

所有需要身份验证的接口都需要在 **Headers** 中传递 **JWT Token**：

```
Authorization: Bearer <token>
```

如未提供或无效，将返回 **401 Unauthorized** 错误：

```json
{
    "code": 401,
    "message": "Unauthorized"
}
```

---

## **9. 常见错误代码**

| 错误代码 | 描述                   |
|----------|------------------------|
| 400      | Bad Request            |
| 401      | Unauthorized           |
| 404      | Not Found              |
| 500      | Internal Server Error  |

---
