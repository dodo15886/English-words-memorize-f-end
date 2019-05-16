<template>
  <div id="login">
    <div class="navbar">
      <Button id="regisBtn" @click="toRegister" size="small" ghost>
        注册
        <Icon type="ios-arrow-down"/>
      </Button>
      <img src="./assets/logo.png">
      <div id="wechatLogin" @click="wechatLogin">
        <div>微信登入</div>
        <img
          src="https://tuonidefu.com.cn/Home/SiteAssets/WeChatLogo.png"
          width="25px"
          height="25px"
        >
      </div>
    </div>
    <div style="margin-top: 50px; font-size: 20px">欢迎使用考串＆简单词！</div>
    <div class="loginPart">
      <div id="normalLogin">
        <Input v-model="name" placeholder="请输入名字..." style="width:200px" class="loginInput"/>
        <Input v-model="id" placeholder="请输入ID..." style="width:200px" class="loginInput"/>
        <Button id="LoginBtn" @click="Login">登入</Button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Login",

  data() {
    return {
      name: "", // user自己手動輸入的name
      id: "", // user自己手動輸入的id
      localhostUrl: ""
    };
  },

  methods: {
    wechatLogin() {
      // 理論上應要從wechat api接user的openId去登入的，但暫時先用隨機產生的string代替
      let tempName;
      let tempId;

      tempName = this.randomRangeStr(6, "name");
      tempId = this.randomRangeStr(10, "id");

      let tempPersonData = {
        // 把name&id包成一個對象
        openId: tempId,
        name: tempName
      };

      axios
        .post(this.localhostUrl + "/wechatLogin", tempPersonData)
        .then(response => {
          if (response.data) {
            // 假如登入成功
            console.log("wechatLogin success.");

            // 把目前登入的資訊存在localstorage
            localStorage.setItem("username", tempName);
            localStorage.setItem("openId", tempId);

            this.$router.push({
              // 切換到index頁面
              name: "index"
            });
          } else {
            // 登入失敗
            console.log("wechatLogin fail.");
          }
        })
        .catch(err => {
          // 傳送失敗
          console.log(err);
        });
    },

    Login() {
      // 一般讓使用者輸入帳密登入
      // 跟wechatLogin只差在傳進去的name跟id是使用者手打的
      let tempName;
      let tempId;

      tempName = this.name;
      tempId = this.id;

      let tempPersonData = {
        openId: tempId,
        name: tempName
      };

      axios
        .post(this.localhostUrl + "/login", tempPersonData)
        .then(response => {
          if (response.data) {
            console.log("login success.");

            localStorage.setItem("username", tempName);
            localStorage.setItem("openId", tempId);

            this.$router.push({
              name: "index"
            });
          } else {
            console.log("login fail.");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    toRegister() { // 切到註冊頁面
      this.$router.push({
        name: "register"
      });
    },

    randomRangeStr(num, type) {
      // 產生隨機string
      const firstChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lastChar = "abcdefghijklmnopqrstuvwxyz";
      const charStr =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let returnStr = "";

      if (type == "id") {
        for (let i = 0; i < num; i++) {
          let index = Math.round(Math.random() * (charStr.length - 1));
          returnStr += charStr.substring(index, index + 1);
        }
      } else if (type == "name") {
        let index = Math.round(Math.random() * (firstChar.length - 1));
        returnStr += firstChar.substring(index, index + 1);
        for (let i = 0; i < num - 1; i++) {
          let index = Math.round(Math.random() * (lastChar.length - 1));
          returnStr += lastChar.substring(index, index + 1);
        }
      }

      return returnStr;
    }
  },

  created() {
    this.localhostUrl = this.$store.state.localhostUrl;
  }
};
</script>

<style scoped>
#login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loginPart {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 250px;
  width: 100%;
}

#regisBtn {
  position: absolute;
  top: 15px;
  left: 15px;
}

#wechatLogin {
  position: absolute;
  right: 0px;
  padding: 10px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  cursor: pointer;
}

#wechatLogin:hover {
  background-color: rgb(70, 70, 70);
}

#normalLogin {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.loginInput {
  margin: 10px;
}

.navbar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: black;
}

#LoginBtn {
  position: relative;
  top: 30px;
}
</style>
