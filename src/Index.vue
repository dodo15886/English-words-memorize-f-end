<template>
  <div id="index">
    <div class="navbar">
      <img src="https://tuonidefu.com.cn/Home/SiteAssets/logo.png">
    </div>

    <Poptip
      id="toLoginBtn"
      confirm
      title="您確定要登出嗎？"
      @on-ok="toLogin"
      @on-cancel="cancel"
      ok-text="是"
      cancel-text="否"
    >
      <Button size="small" ghost>
        <Icon type="ios-arrow-back"/>登出
      </Button>
    </Poptip>

    <div class="title">
      <div>考串＆简单词</div>
      <div class="nameText">嗨！{{personData.name}} 同学</div>
    </div>

    <div class="UpPart">
      <div class="columnStruc">
        <div class="text">{{days}}</div>
        <div class="ConstText">已完成天数</div>
      </div>
    </div>

    <div id="divider"></div>

    <div class="statusStruc">
      <div class="columnStruc">
        <div class="text">{{todayWordsNum}}</div>
        <div class="ConstText">今日词汇</div>
        <Dropdown trigger="click" style="margin-top:10px" @on-click="setTodayWordsNum">
          <Button href="javascript:void(0)" size="small">
            选择数量
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="10">10个</DropdownItem>
            <DropdownItem name="15">15个</DropdownItem>
            <DropdownItem name="20">20个</DropdownItem>
            <DropdownItem name="25">25个</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div class="columnStruc">
        <div class="text">{{holdWordsNum}}</div>
        <div class="ConstText">已掌握</div>
        <Button @click="toHoldWords" style="margin-top:10px" type="info" size="small">查看掌握单字</Button>
      </div>
      
      <Modal v-model="modal1" title="警告！" @on-ok="ok" @on-cancel="cancel"><p>你确认要清空吗？</p></Modal>

      <div class="columnStruc">
        <div class="text">{{personWholeData.length-holdWordsNum}}</div>
        <div class="ConstText">剩余单词</div>
        <Button @click="resetWordsDB" style="margin-top:10px" type="primary" size="small">单字归零</Button>
      </div>
    </div>
    <div class="btnStruc">
      <Button class="memoryBtn" type="success" @click="toTrain">开始学习</Button>
      <Button v-show="holdData.length" class="memoryBtn" type="warning" @click="toTest">开始测验</Button>
    </div>
    
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      personData: {
        name: "",
        openId: ""
      },
      personWholeData: [], // user的個人單字database
      selectToTrainData: [], // 透過今日詞彙的數量挑選的單字
      selectToTestData: [],
      holdData: [], // 已掌握的單字
      days: 0, // 已完成天數
      todayWordsNum: 10, // 今日詞彙
      holdWordsNum: 0, // 已掌握數量
      localhostUrl: "",
      modal1: false,
    };
  },

  methods: {
    toTrain() {
      // 開始學習
      this.selectToTrainData = this.selectTrainWords(
        this.personWholeData,
        this.todayWordsNum
      );
      this.$router.push({
        // 把挑選過、最不熟悉的單字傳去Train.vue
        name: "train",
        params: {
          id: this.selectToTrainData
        }
      });
    },

    toTest() {
      // 開始測驗
      let testNum;
      if (this.todayWordsNum > this.holdData.length) {
        // 假如今日詞彙比已掌握的單字還多，以已掌握的單字數量為主
        testNum = this.holdData.length;
      } else {
        // 假如今日詞彙比已掌握的單字還少，以今日詞彙的數量為主
        testNum = this.todayWordsNum;
      }
      this.selectToTestData = this.selectTestWords(this.holdData, testNum);

      this.$router.push({
        name: "test",
        params: {
          id: this.selectToTestData
        }
      });
    },

    selectTrainWords(rawData, num) {
      // 假設‘今日詞彙’是10個，針對‘cannotMemoryCount’屬性排序，挑出排序後前10大的單字(越不熟悉優先)
      let selectedData = [];
      let sortedData = rawData.sort(this.compare("cannotMemoryCount"));

      for (let i = 0; i < num; i++) {
        selectedData.push(sortedData[i]);
      }
      selectedData = this.shuffle(selectedData); // 把挑選出來的順序打亂

      return selectedData;
    },

    selectTestWords(rawData, num) {
      // 因為count都是-1，所以不用sort
      let selectedData = [];
      rawData = this.shuffle(rawData);
      for (let i = 0; i < num; i++) {
        selectedData.push(rawData[i]);
      }
      return selectedData;
    },

    shuffle(arr) {
      // Knuth-Durstenfeld Shuffle
      // 每次隨機從array裡取一個數，跟最後一個還沒排序過的數交換
      let leng = arr.length,
        randIndex;
      while (leng > 0) {
        randIndex = Math.floor(Math.random() * leng);
        leng--;
        // 神奇的es6語法，內建的array's swap
        [arr[leng], arr[randIndex]] = [arr[randIndex], arr[leng]];
      }
      return arr;
    },

    compare(property) {
      // 根據陣列裡對象的某個屬性做sort
      // default是針對ascii排，傳compare的func進去改排序方式
      return function(a, b) {
        let v1 = a[property];
        let v2 = b[property];
        return v2 - v1;
      };
    },

    setTodayWordsNum(num) {
      this.todayWordsNum = num;
    },

    toHoldWords() {
      // 切換至已掌握單字's 頁面
      this.$router.push({
        name: "holdWords",
        params: {
          id: this.holdData
        }
      });
    },

    toLogin() {
      localStorage.clear();
      this.$router.push({
        name: "login"
      });
    },

    ok() {
      axios
        .post(this.localhostUrl + "/reset", this.personData)
        .then(response => {
          console.log(response);
          window.location.reload(); // 讓頁面更新
        })
        .catch(err => {
          console.log(err);
        });
    },
    cancel() {
      // this.$Message.info("点击了取消");
    },

    resetWordsDB() {
      this.modal1=true;
    }
  },

  mounted() {
    axios // 從serve.js load 個人的database
      // 從vuex中傳user的id跟name回後端
      .post(this.localhostUrl + "/load", this.personData)
      .then(({ data }) => {
        // data[0] : user的單字庫, [1] : 目前累積完成的天數
        this.personWholeData = data[0];
        this.days = data[1];
        for (let i = 0; i < this.personWholeData.length; i++) {
          // 算目前已掌握的單字有幾個
          if (this.personWholeData[i].cannotMemoryCount == -1) {
            this.holdData.push(this.personWholeData[i]);
            this.holdWordsNum++;
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  },

  created() {
    this.localhostUrl = this.$store.state.localhostUrl;

    // 在Login就已經存在local storege了
    this.personData.name = localStorage.getItem("username");
    this.personData.openId = localStorage.getItem("openId");
  }
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: black;
}

#divider {
  width: 100%;
  height: 15px;
  background-color: #e8eaec;
}

#toLoginBtn {
  position: absolute;
  left: 15px;
  top: 15px;
}

.UpPart {
  width: 100%;
  height: auto;
}
.title {
  text-align: center;
  font-size: 20px;
  margin-top: 30px;
}

.nameText {
  font-size: 30px;
  margin-top: 20px;
}

.UpPart .columnStruc {
  margin: 30px auto;
}

.columnStruc {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.statusStruc {
  display: flex;
  justify-content: center;
  align-items: center;
}

.statusStruc .columnStruc {
  margin: 20px;
}

.UpPart .ConstText {
  font-size: 20px;
  color: #808695;
}

.UpPart .text {
  font-weight: bolder;
  font-size: 80px;
  color: #19be6b;
}

.statusStruc .ConstText {
  font-size: 14px;
  color: #808695;
}

.statusStruc .text {
  font-weight: bolder;
  font-size: 40px;
  color: black;
}

.memoryBtn {
  margin: 20px;
  width: 90%;
}

.btnStruc {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
