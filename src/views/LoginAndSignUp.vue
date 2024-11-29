<template>
  <div class="back-page">
    <div class="form-structor">
      <div class="signup" :class="{ 'slide-up': isLoginActive }">
        <h2 class="form-title" id="signup" @click="toggleLoginSignup"><span>or</span>Sign up</h2>
        <div class="form-holder">
          <el-form style="margin: 20px 15px 35px;" ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules"
                   label-width="auto">
            <el-form-item prop="name">
              <el-input v-model="ruleForm.name" type="text" autocomplete="off" placeholder="Name"/>
            </el-form-item>
            <el-form-item prop="email">
              <el-input v-model="ruleForm.email" type="text" autocomplete="off" placeholder="xxx@example.com"/>
            </el-form-item>
            <el-form-item prop="pass">
              <el-input v-model="ruleForm.pass" type="password" show-password autocomplete="off"
                        placeholder="Password"/>
            </el-form-item>
            <el-form-item prop="checkPass">
              <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" show-password
                        placeholder="Confirm"/>
            </el-form-item>
          </el-form>
        </div>
        <button class="submit-btn" @click="handleSignup" :disabled="!isSignupValid">Sign up</button>
      </div>
      <div class="login" :class="{ 'slide-up': !isLoginActive }">
        <div class="center">
          <h2 class="form-title" id="login" @click="toggleLoginSignup"><span>or</span>Log in</h2>
          <div class="form-holder">
            <el-form style="margin: 20px 15px 35px;" ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules"
                     label-width="auto">
              <el-form-item prop="name">
                <el-input v-model="ruleForm.name" type="text" autocomplete="off" placeholder="username"/>
              </el-form-item>
              <el-form-item prop="pass">
                <el-input v-model="ruleForm.pass" type="password" show-password autocomplete="off"
                          placeholder="Password"/>
              </el-form-item>
            </el-form>
          </div>
          <button class="submit-btn" @click="handleLogin" :disabled="!isLoginValid">Log in</button>
        </div>
      </div>
    </div>
    <div style="position: absolute; bottom: 10px; right: 10px;">
      设置服务器地址
      <el-input v-model="baseURL" style="width: 240px;" placeholder="127.0.0.1:5000/api"/>
      <el-button @click="setURL(baseURL)">确认</el-button>
    </div>
  </div>

</template>

<script lang="ts" setup>
import {reactive, ref, watch} from 'vue'
import {useUserStore} from '@/stores/userStore'
import {ElMessage, FormInstance, FormRules} from 'element-plus'
import {useRouter} from "vue-router";
import {register, login} from '@/utils/api';

let baseURL = ref(localStorage.getItem('server_ip')||'127.0.0.1')
function setURL(baseURL) {
  console.log("setURL");
  localStorage.setItem("server_ip",baseURL);
  ElMessage.success("已将地址设置为: "+baseURL)
}

// let baseURL = ref('127.0.0.1:5000/api')
const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive({
  pass: '',
  checkPass: '',
  name: '',
  email: ''
});

const isSignupValid = ref(false);
const isLoginValid = ref(false);
const router = useRouter()
const userStore = useUserStore()

// Validate email
const validateEmail = (rule: any, value: any, callback: any) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) {
    callback(new Error('Please input your email address'));
  } else if (!emailPattern.test(value)) {
    callback(new Error('Please enter a valid email address'));
  } else {
    callback();
  }
};

// Validate password
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the password'));
  } else {
    callback();
  }
};

// Validate confirm password
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the password again'));
  } else if (value !== ruleForm.pass) {
    callback(new Error("Two inputs don't match!"));
  } else {
    callback();
  }
};

// Validation rules
const rules = reactive<FormRules<typeof ruleForm>>({
  email: [{validator: validateEmail, trigger: 'blur'}],
  pass: [{validator: validatePass, trigger: 'blur'}],
  checkPass: [{validator: validatePass2, trigger: 'blur'}],
});


// Check form validity
const checkSignupValidity = () => {
  const formEl = ruleFormRef.value;
  if (!formEl) return;
  formEl.validate((valid) => {
    isSignupValid.value = valid;
  });
};

const checkLoginValidity = () => {
  const formEl = ruleFormRef.value;
  if (!formEl) return;
  formEl.validate((valid) => {
    isLoginValid.value = valid;
  });
};

// Watch for changes in the form fields
watch(() => ruleForm, () => {
  if (isLoginActive.value) {
    checkLoginValidity();
  } else {
    checkSignupValidity();
  }
}, {deep: true});

const isLoginActive = ref(false);

const toggleLoginSignup = () => {
  isLoginActive.value = !isLoginActive.value;
};

const handleSignup = async () => {
  // Handle signup logic here
  let registerForm = {
    "username": ruleForm.name,
    "password": ruleForm.pass,
    "email": ruleForm.email
  }
  console.log("signup")
  try {
    const response = await register(registerForm);
    ElMessage.success("注册失败" + response.message); // 提示用户注册成功
  } catch (error) {
    ElMessage.error("注册失败" + error.message)
  }
};

const handleLogin = async () => {
  // Handle login logic here
  let loginForm = {
    "username": ruleForm.name,
    "password": ruleForm.pass,
  }
  console.log("signup")
  try {
    const response = await login(loginForm);
    console.log(response)
    const token = response.token
    console.log("token :" + token)
    const email = 'ruleForm.email';
    // 存储用户信息到 Pinia 和 localStorage
    userStore.setUserInfo(loginForm.username, email, token)
    localStorage.setItem('user_id', loginForm.username)
    localStorage.setItem('token', token)
    ElMessage.success("登录成功"); // 提示用户注册成功
    // 跳转到主页并传递用户信息
    router.push({name: 'HomePage'})
  } catch (error) {
    ElMessage.error("登录失败" + error.message)
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Fira+Sans");

html,
body {
  position: relative;
  min-height: 100vh;
  background-color: #E1E8EE;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Fira Sans", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.back-page {

  background: #e1e8ee;
  /*设置为浏览器页面的高*/
  height: 100vh;
}

.form-structor {
  top: 30px;
  margin: auto;
  height: 700px;
  border-radius: 15px;
  width: 450px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    opacity: .8;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-repeat: no-repeat;
    background-position: left bottom;
    background-size: 500px;
    background-image: url('https://images.unsplash.com/photo-1503602642458-232111445657?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=bf884ad570b50659c5fa2dc2cfb20ecf&auto=format&fit=crop&w=1000&q=100');
  }

  .signup {
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    width: 70%;
    z-index: 5;
    -webkit-transition: all .3s ease;


    &.slide-up {
      top: 5%;
      -webkit-transform: translate(-50%, 0%);
      -webkit-transition: all .3s ease;
    }

    &.slide-up .form-holder,
    &.slide-up .submit-btn {
      opacity: 0;
      visibility: hidden;
    }

    &.slide-up .form-title {
      font-size: 1em;
      cursor: pointer;
    }

    &.slide-up .form-title span {
      margin-right: 5px;
      opacity: 1;
      visibility: visible;
      -webkit-transition: all .3s ease;
    }

    .form-title {
      color: #fff;
      font-size: 1.7em;
      text-align: center;

      span {
        color: rgba(0, 0, 0, 0.4);
        opacity: 0;
        visibility: hidden;
        -webkit-transition: all .3s ease;
      }
    }

    .form-holder {
      border-radius: 15px;
      background-color: #fff;
      overflow: hidden;
      margin-top: 50px;
      opacity: 1;
      visibility: visible;
      -webkit-transition: all .3s ease;

      .input {
        border: 0;
        outline: none;
        box-shadow: none;
        display: block;
        height: 30px;
        line-height: 30px;
        padding: 8px 15px;
        border-bottom: 1px solid #eee;
        width: 90%;
        font-size: 12px;

        &:last-child {
          border-bottom: 0;
        }

        &::-webkit-input-placeholder {
          color: rgba(0, 0, 0, 0.4);
        }
      }
    }

    .submit-btn {
      background-color: rgba(0, 0, 0, 0.4);
      color: rgba(256, 256, 256, 0.7);
      border: 0;
      border-radius: 15px;
      display: block;
      margin: 15px auto;
      padding: 15px 45px;
      width: 100%;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      opacity: 1;
      visibility: visible;
      -webkit-transition: all .3s ease;

      &:hover {
        transition: all .3s ease;
        background-color: rgba(0, 0, 0, 0.8);
      }
    }
  }

  .login {
    position: absolute;
    top: 20%;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    z-index: 5;
    -webkit-transition: all .3s ease;

    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: -20px;
      -webkit-transform: translate(-50%, 0);
      background-color: #fff;
      width: 200%;
      height: 250px;
      border-radius: 50%;
      z-index: 4;
      -webkit-transition: all .3s ease;
    }

    .center {
      position: absolute;
      top: calc(50% - 10%);
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      width: 65%;
      z-index: 5;
      -webkit-transition: all .3s ease;

      .form-title {
        color: #000;
        font-size: 1.7em;
        text-align: center;

        span {
          color: rgba(0, 0, 0, 0.4);
          opacity: 0;
          visibility: hidden;
          -webkit-transition: all .3s ease;
        }
      }

      .form-holder {
        border-radius: 15px;
        background-color: #fff;
        border: 1px solid #eee;
        overflow: hidden;
        margin-top: 50px;
        opacity: 1;
        visibility: visible;
        -webkit-transition: all .3s ease;

        .input {
          border: 0;
          outline: none;
          box-shadow: none;
          display: block;
          height: 30px;
          line-height: 30px;
          padding: 8px 15px;
          border-bottom: 1px solid #eee;
          width: 100%;
          font-size: 12px;

          &:last-child {
            border-bottom: 0;
          }

          &::-webkit-input-placeholder {
            color: rgba(0, 0, 0, 0.4);
          }
        }
      }

      .submit-btn {
        background-color: #6B92A4;
        color: rgba(256, 256, 256, 0.7);
        border: 0;
        border-radius: 15px;
        display: block;
        margin: 15px auto;
        padding: 15px 45px;
        width: 100%;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        opacity: 1;
        visibility: visible;
        -webkit-transition: all .3s ease;

        &:hover {
          transition: all .3s ease;
          background-color: rgba(0, 0, 0, 0.8);
        }
      }
    }

    &.slide-up {
      top: 90%;
      -webkit-transition: all .3s ease;
    }

    &.slide-up .center {
      top: 10%;
      -webkit-transform: translate(-50%, 0%);
      -webkit-transition: all .3s ease;
    }

    &.slide-up .form-holder,
    &.slide-up .submit-btn {
      opacity: 0;
      visibility: hidden;
      transition: all .3s ease;
    }

    &.slide-up .form-title {
      font-size: 1em;
      margin: 0;
      padding: 0;
      cursor: pointer;
      transition: all .3s ease;
    }

    &.slide-up .form-title span {
      margin-right: 5px;
      opacity: 1;
      visibility: visible;
      -webkit-transition: all .3s ease;
    }
  }
}
</style>