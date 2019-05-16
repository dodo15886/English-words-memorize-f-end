<template>
  <div id="test">
    <div class="navbar">
      <img src="https://tuonidefu.com.cn/Home/SiteAssets/logo.png">
    </div>

    <Button id="toIndexBtn" @click="toIndex()" size="small" ghost>
      <Icon type="ios-arrow-back"/>回主页
    </Button>

    <Tooltip v-if="testData.length > curIndex" content="答題狀況" style="width: 100%; margin-top:20px">
      <Progress
        stroke-color="#ff5500"
        :percent="totalPercent"
        :success-percent="successPercent"
        hide-info
      />
    </Tooltip>

    <div v-if="testData.length > curIndex" class="showWords">
      <div class="word">
        {{testData[curIndex].word}}
        <Tooltip :content="testData[curIndex].sentence" max-width="200" placement="top-end">
          <Button type="warning">提示</Button>
        </Tooltip>
      </div>

      <Button
        v-for="(item, index) in answerOption"
        :key="index"
        class="awsOptionBtn"
        :type="awsOptionBtnType[index]"
        @click="checkAnswer(item, index)"
      >
        <div style="font-size:15px">{{item}}</div>
      </Button>
      <Button class="awsOptionBtn" type="warning" @click="forgetWord" :disabled="isDisabled" ghost>
        <div style="font-size:15px">完全不记得</div>
      </Button>
    </div>
    <div v-else-if="testData.length - correctWordsNum != 0" class="endStruc">
      <i-circle
        :size="250"
        :trail-width="4"
        :stroke-width="5"
        :percent="successPercent"
        stroke-linecap="square"
        stroke-color="#19be6b"
      >
        <div class="chartText">
          答对率 :
          <span>{{Math.round(successPercent * 100)/100}}</span>%
        </div>
        <div class="chartText">
          共
          <span>{{testData.length}}</span> 个单字
        </div>
        <div class="chartText">
          答对了
          <span>{{correctWordsNum}}</span> 个
        </div>
      </i-circle>

      <div v-if="successPercent < 30" class="sugText">
        您的答对率过低，建议重新回主页面复习
        <span>「已掌握单字」</span>清单唷！
      </div>
      <div v-else-if="successPercent < 80" class="sugText">您的答对率普普，建议可以多做几次练习唷！</div>
      <div v-else class="sugText">
        您的答对率极高，建议可以继续回主页面点选
        <span>「开始学习」</span>，背新的一轮单字了！
      </div>

      <Button class="endBtn" type="info" size="large" @click="newRound(true)">此轮再测一次</Button>
      <Button class="endBtn" type="warning" size="large" @click="newRound(false)">没答对的单字再测一次</Button>
    </div>
    <div v-else class="endText">已把所有单字测验完毕！</div>

    <div class="nextWordStruc">
      <Button class="nextWord" v-if="ansStatus" @click="nextWord" type="primary">
        下一个单字
        <Icon type="ios-arrow-forward"/>
      </Button>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";

export default {
  data() {
    return {
      personData: {
        name: "",
        openId: ""
      },
      testData: [], // 傳進來測驗的所有單字
      rawTestData: [], // 紀錄一開始所有的單字(需要中文)
      answerOption: [], // 選項裡的單字中文
      ansStatus: false, // 現在正在測驗的那個單字測試者回答了沒
      curIndex: 0, // 紀錄目前在testData中，正在進行到第幾個
      answerOptionNum: 4, // 測驗的選項數量
      awsOptionBtnType: [], // 測驗的選項的type，default or success or error
      correctAnsInOptIndex: 0, // 正確答案在當前的選項的第幾個
      isDisabled: false,

      totalPercent: 0,
      correctWordsNum: 0,
      successPercent: 0
    };
  },

  created() {
    this.localhostUrl = this.$store.state.localhostUrl;
    this.testData = this.$route.params.id; // 接收Index.vue傳來的data
    axios
      .post(this.localhostUrl + "/rawLoad")
      .then(({ data }) => {
        this.rawTestData = data;
        this.answerOption = this.InitilizeArray(""); // 初始化幾個選項
        this.awsOptionBtnType = this.InitilizeArray("default"); // 初始化選項的type，預設為default
        this.answerOption = this.setAnsOption(); // 設定選項的內容Ｆ
      })
      .catch(err => {
        console.log(err);
      });
    this.personData.name = localStorage.getItem("username");
    this.personData.openId = localStorage.getItem("openId");

    for (let i = 0; i < this.testData.length; i++) {
      this.testData.isMemory = false;
    }
  },

  methods: {
    checkAnswer(choosedAns, index) {
      // 檢查是否回答正確
      if (
        this.testData[this.curIndex].chinese == choosedAns &&
        this.ansStatus == false
      ) {
        // 正確的話 且 沒有回答過
        this.testData[this.curIndex].isMemory = true; // 記得這個單字
        this.$set(this.awsOptionBtnType, index, "success"); // 把這個btn換成綠色
        this.ansStatus = true; // 更新狀態：已經回答了

        this.correctWordsNum++;
      } else if (
        this.testData[this.curIndex].chinese != choosedAns &&
        this.ansStatus == false
      ) {
        // 錯誤的話 且 沒有回答過
        this.$set(this.awsOptionBtnType, index, "error"); // 把這個btn換成紅色
        this.$set(this.awsOptionBtnType, this.correctAnsInOptIndex, "success"); // 把正解顯示出來
        this.ansStatus = true; // 更新狀態：已經回答了
      }
      this.isDisabled = true; // 讓不記得btn不能再按，不然會讓cannotMemoryCount在+一次，覆寫到db
    },

    forgetWord() {
      // 完全忘記這個單字，去database把這個單字從‘已掌握’拿掉(把cannotMemoryCount+1變成0)
      this.testData[this.curIndex].cannotMemoryCount++;
      let testUpdateData = [
        this.testData[this.curIndex].cannotMemoryCount,
        this.testData[this.curIndex].id,
        this.personData
      ];
      this.$set(this.awsOptionBtnType, this.correctAnsInOptIndex, "success"); // 把正解顯示出來
      this.ansStatus = true; // 更新狀態：已經回答了
      this.isDisabled = true; // 讓不記得btn不能再按，不然會讓cannotMemoryCount在+一次，覆寫到db
      axios
        .post(this.localhostUrl + "/count", testUpdateData)
        .then(response => {
          console.log(response);
          this.$Message.warning("已把此單字從已掌握清單刪除！");
        })
        .catch(err => {
          console.log(err);
        });
    },

    nextWord() {
      this.curIndex++; // 換下一個單字
      this.ansStatus = false; // 切換狀態為：未回答
      this.isDisabled = false; // 把不記得btn重新設為可以選
      if (this.curIndex != this.testData.length)
        // 假如到最後一個單字了還去set選項單字，會overflow
        this.answerOption = this.setAnsOption();
      this.awsOptionBtnType = this.InitilizeArray("default"); // 更新選項btn的type回為default

      this.totalPercent = (this.curIndex / this.testData.length) * 100; // 計算進度條的比例，全部的回答單字比例
      this.successPercent = (this.correctWordsNum / this.testData.length) * 100; // 答對的單字比例
    },

    toIndex() {
      // 回Index.vue
      this.$router.push({
        name: "index"
      });
    },

    setAnsOption() {
      this.correctAnsInOptIndex = Math.floor(
        Math.random() * this.answerOptionNum
      ); // 設定正確答案的index
      let returnAnswerOption = this.InitilizeArray(""); // 初始化選項array

      returnAnswerOption[this.correctAnsInOptIndex] = this.testData[
        this.curIndex
      ].chinese; // 設定正確答案

      for (let i = 0; i < this.answerOptionNum - 1; i++) {
        // 設定剩下的不正確的選項，從除了正解以外的testData裡隨機挑
        // 一圈for設定一個，共設定'選項數量-1'個(扣掉正解)
        let incorrectAnsIndex = Math.floor(
          Math.random() * this.rawTestData.length
        ); // 設定錯誤答案的index

        let incorrectAns = this.rawTestData[incorrectAnsIndex].chinese;

        if ( returnAnswerOption.indexOf(incorrectAns) >= 0 ) {
          // 假如這個單字已經被設定過(包含正解)
          // 再做一次循環
          i--;
          continue;
        } else {
          // 假如沒設定過，放進選項array
          for (let j = 0; j < this.answerOptionNum; j++) {
            // 遍歷選項array，如果是空的才設定
            if (returnAnswerOption[j] == "") {
              returnAnswerOption[j] = incorrectAns;
              break;
            }
          }
        }
      }

      return returnAnswerOption;
    },

    newRound(status) {
      // true => 全部重測; false => 錯的重測
      // 把狀態全歸0，重新一輪
      this.curIndex = 0;
      this.ansStatus = false;
      this.totalPercent = 0;
      this.successPercent = 0;
      this.correctWordsNum = 0;

      if (!status) {
        // 如果學生只要再測一次沒答對的單字
        let temp = _.cloneDeep(this.testData);
        // 避免直接操作DOM，先深拷貝到一個temp上，然後對temp操作
        for (let i = 0; i < temp.length; i++) {
          if (temp[i].isMemory || temp[i].cannotMemoryCount > -1) {
            // 如果有答對或是完全沒印象的單字，就把它刪掉
            temp.splice(i, 1);
            i--;
          }
        }
        this.testData = temp;
      }

      if (this.testData.length > 0) {
        this.answerOption = this.setAnsOption(); // 設定選項的內容
      } else {
        this.$Message.success("已掌握的單字都測驗完了！");
      }
    },

    InitilizeArray(value) {
      // 初始化固定數量的array
      let array = [];
      for (let i = 0; i < this.answerOptionNum; i++) {
        array.push(value);
      }
      return array;
    }
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

#toIndexBtn {
  position: absolute;
  left: 15px;
  top: 15px;
}

.showWords {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 70px;
  height: 400px;
}

.word {
  width: 300px;
  font-size: 30px;
  text-align: center;
  margin: 30px;
}

.voice {
  border: 1px solid red;
}

.awsOptionBtn {
  min-width: 150px;
  height: 50px;
  margin: 13px;
}

.nextWordStruc {
  display: flex;
  justify-content: center;
  align-items: center;

  margin: 30px;
}
.nextWord {
  width: 100%;
}

.endStruc {
  position: relative;
  top: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.chartText {
  font-size: 20px;
  margin: 15px;
}
.chartText span {
  font-size: 20px;
  color: #2d8cf0;
  font-weight: bolder;
}

.endText {
  font-size: 20px;
  margin: 20px;
}

.endBtn {
  position: relative;
  top: 20px;
  margin: 20px;
}

.sugText {
  position: relative;
  top: 20px;
  margin: 20px;
  font-size: 15px;
  width: 280px;
}

.sugText span {
  font-size: 20px;
  color: #2d8cf0;
  font-weight: bolder;
}
</style>
