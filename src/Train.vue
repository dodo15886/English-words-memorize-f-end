<template>
  <div id="train">
    <div class="navbar">
      <img src="https://tuonidefu.com.cn/Home/SiteAssets/logo.png">
    </div>

    <Button id="toIndexBtn" @click="toIndex()" size="small" ghost>
      <Icon type="ios-arrow-back"/>回主页
    </Button>

    <Tooltip v-if="Data.length > curIndex" content="答題狀況" style="width: 100%; margin-top:20px">
      <Progress stroke-color="#ff5500" :percent="totalPercent" :success-percent="successPercent" hide-info/>
    </Tooltip>

    <div class="showWords" v-if="Data.length > curIndex">
      <!-- <transition name="fade"> -->
        <div class="word text">{{Data[curIndex].word}}</div>
      <!-- </transition> -->

      <div v-if="nextFlag">
        <div class="sentence text">{{Data[curIndex].sentence}}</div>
        <div class="voice text">{{Data[curIndex].voice}}</div>
        <div class="chinese text">{{Data[curIndex].chinese}}</div>
        <div class="nextWordBtn">
          <Button @click="nextWord" type="success" size="large">下一个</Button>
        </div>
      </div>
      <div v-else class="yesNoBtnStruc">
        <Button class="yesNoBtn" type="success" size="large" @click="recongnize()">认识</Button>
        <Button class="yesNoBtn" type="warning" size="large" @click="Unrecongnize()">不认识</Button>
      </div>
    </div>

    <div v-else class="roundAndEndStruc">
      <i-circle
        :size="250"
        :trail-width="4"
        :stroke-width="5"
        :percent="successPercent"
        stroke-linecap="square"
        stroke-color="#19be6b"
      >
        <div class="chartRoundText">第 <span>{{roundCount}}</span> 轮</div>
        <div class="chartText">认识率 : <span>{{Math.round(successPercent * 100)/100}}</span>%</div>
        <div class="chartText">共 <span>{{Data.length}}</span> 个单字</div>
        <div class="chartText">还不认识 <span>{{Data.length-correctWordsNum}}</span> 个</div>
      </i-circle>

      <div v-if="Data.length-correctWordsNum == 0 || roundCount == roundMaxNum" class="endText">训练结束！请点左上角回主页！</div>
      <Button v-else class="roundBtn" type="info" @click="nextRound">下一輪</Button>
    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "train",
  data() {
    return {
      Data: [], // 傳進來train的單字
      personData: { // 現在是哪個user
        name: "",
        openId: ""
      },
      curIndex: 0, // 目前記憶到哪一個單字
      correctWordsNum: 0, // 正確的單字數量
      totalPercent: 0, // 目前回答的單字的比例
      successPercent: 0, // 目前答對的單字佔回答的單字的比例
      roundCount: 1, // 第幾輪
      nextFlag: false, // 控制單字資訊是否顯示的flag
      roundMaxNum: 3, // 要訓練幾輪
      localhostUrl: "", 
    };
  },

  methods: {
    //  count初始化是0，count是'-1'代表熟了，歸類在‘已掌握’。
    //  數字越大代表越不熟，每按認識一次就-1，不認識就+1

    recongnize() {
      this.Data[this.curIndex].cannotMemoryCount--; // 代表對這個單字熟悉一點了

      let updateData = [
        // 把這單字的不熟悉狀態跟id寫進database
        this.Data[this.curIndex].cannotMemoryCount,
        this.Data[this.curIndex].id,
        this.personData
      ];

      this.curIndex++; // 目前回答到第幾個單字++
      this.correctWordsNum++; // 答對的單字數量++
      this.totalPercent = (this.curIndex / this.Data.length) * 100; // 計算進度條的比例，全部的回答單字比例
      this.successPercent = (this.correctWordsNum / this.Data.length) * 100; // 答對的單字比例

      axios // 每按一個單字，都傳這個單字的count & 跟'單字'的id回去做紀錄
        .post(this.localhostUrl + "/count", updateData)
        .then(response => {
          console.log(response);
        })
        .catch(err => {
          console.log(err);
        });
    },

    Unrecongnize() {
      this.Data[this.curIndex].curCount++; // 本輪學習的count++
      this.Data[this.curIndex].cannotMemoryCount++; // database的count++
      let updateData = [
        this.Data[this.curIndex].cannotMemoryCount,
        // 傳回去的是DB的cannotMemoryCount，curCount只是用來計算這一輪的
        this.Data[this.curIndex].id,
        this.personData
      ];
      this.nextFlag = true;

      axios
        .post(this.localhostUrl + "/count", updateData)
        .then(response => {
          console.log(response);
        })
        .catch(err => {
          console.log(err);
        });
    },

    nextWord() {
      this.curIndex++;
      this.totalPercent = (this.curIndex / this.Data.length) * 100;
      // 只要更新全部答了幾題的比例就可
      this.nextFlag = false;
    },

    nextRound() {
      // 狀態都歸0
      this.curIndex = 0;
      this.correctWordsNum = 0;
      this.totalPercent = 0;
      this.successPercent = 0;

      this.roundCount++; // 下一輪
      this.$Message.success("第" + this.roundCount + "輪開始！");

      for (let i = 0; i < this.Data.length; i++) {
        // 把上一輪答對的都從Data裡刪掉
        if (this.Data[i].curCount < this.roundCount - 1) {
          this.Data.splice(i, 1);
          i--;
        }
      }
    },

    toIndex() {
      this.$router.push({
        name: "index"
      });
    }
  },

  created() {
    this.Data = this.$route.params.id;
    this.localhostUrl = this.$store.state.localhostUrl;

    this.personData.name = localStorage.getItem("username");
    this.personData.openId = localStorage.getItem("openId");

    for (let i = 0; i < this.Data.length; i++) {
      // 新增curCount屬性
      this.Data[i].curCount = 0;
    }
  }
};
</script>

<style scoped>
/* .fade-enter-active, .fade-leave-active {
  transition: opacity .50s;
}
.fade-enter, .fade-leave-to .fade-leave-active below version 2.1.8 {
  opacity: 0;
} */

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
  margin-top: 50px;
}

.word {
  margin: 0 auto;
  width: 200px;
  height: 100px;
  font-size: 45px;
}

.sentence {
  margin: 10px;
  padding: 10px;
  width: auto;
  height: 100px;
  font-size: 15px;
}

.voice {
  margin: 0 auto;
  width: 200px;
  height: 100px;
  font-size: 25px;
}

.chinese {
  margin: 0 auto;
  width: 200px;
  height: 100px;
  font-size: 25px;
}

.yesNoBtnStruc {
  display: flex;
  justify-content: center;
  align-items: center;
}
.yesNoBtn {
  margin: 20px;
}

.roundAndEndStruc {
  position: relative;
  top: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.roundBtn {
  margin: 50px;
  width: 200px;
  height: 50px;
}

.nextWordBtn {
  margin: 50px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chartText {
  font-size: 20px;
  margin: 15px;
}

.chartRoundText {
  font-size: 30px;
  margin: 15px;
  font-weight: 900;
}

.chartText span {
  font-size: 20px;
  color: #2d8cf0;
  font-weight: bolder;
}

.endText {
  font-size: 18px;
  margin: 50px;
}
</style>
