<template>
  <div class="regis">
    <div class="navbar">
      <img src="./assets/logo.png">
    </div>

    <Button id="toLoginBtn" @click="toLogin()" size="small" ghost>
      <Icon type="ios-arrow-back"/>回登入
    </Button>

    <div class="RegistStruc">
      <Input
        v-model="personData.name"
        placeholder="请输入名字...(请包括数字和字母)"
        style="width:200px"
        class="regisInput"
      />
      <Input
        v-model="personData.openId"
        placeholder="请输入ID...(请包括数字和字母)"
        style="width:200px"
        class="regisInput"
      />
      <div class="validationCodeStruc">
        <div>周永霖的生日是几月几号？</div>
        <Input v-model="userVCode" placeholder="MM/DD" style="width:100px" class="validInput"/>
      </div>
      <Button class="regisBtn" @click="register" type="primary">注册</Button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "register",
  data() {
    return {
      personData: {
        name: "",
        openId: ""
      },
      userVCode: "", // 驗證碼
      correctVCode: "11/11", // 驗證碼的正解
      localhostUrl: "",
    };
  },

  methods: {
    toLogin() {
      this.$router.push({
        name: "login"
      });
    },

    register() {
      if (this.userVCode == this.correctVCode) {
        axios
          .post(this.localhostUrl + "/register", this.personData)
          .then(res => {
            if (res.data == true) { // 如果此帳號沒被註冊過
              this.$Message.success("注册成功");
              this.$router.push({
                name: "login"
              })
            } else { // 如果註冊過了
              this.$Message.error("注册失败，此id已存在。");
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        this.$Message.error("验证码输入错误");
      }
    }
  },

  created() {
    this.localhostUrl = this.$store.state.localhostUrl;
  }
};
</script>

<style scoped>
.regis {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

#toLoginBtn {
  position: absolute;
  left: 15px;
  top: 15px;
}

.navbar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: black;
}

.RegistStruc {
  position: relative;
  top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.regisInput {
  margin: 10px;
}

.validationCodeStruc {
  margin: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
