<template>
  <div>
    <div class="navbar">
      <img src="https://tuonidefu.com.cn/Home/SiteAssets/logo.png">
    </div>

    <BackTop></BackTop> 
    
    <div class="wordsList">
      <Button id="toIndexBtn" @click="toIndex()" size="small" ghost>
        <Icon type="ios-arrow-back" />回主页
      </Button>
      <div v-if="!holdWords.length" style="margin:100px; font-size:20px">目前没有掌握的单子唷！</div>
      <div
        v-else
        class="words"
        v-for="(item, index) in holdWords"
        :key="index"
      >
        <Button @click="showWordsDetail(index)" class="word" type="primary" size="large">{{item.word}}</Button>

        <div v-show="holdWords[index].detailFlag" class="detailSturc">
          <div class="sentence text">{{item.sentence}}</div>
          <div class="voice text">{{item.voice}}</div>
          <div class="chinese text">{{item.chinese}}</div>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      holdWords: [],
      wordsDetailFlag: [],
      theIndex: null
    };
  },

  methods: {
    showWordsDetail(index) {
      let theDetail = this.holdWords[index];
      theDetail.detailFlag = !theDetail.detailFlag;
      this.$set(this.holdWords, index, theDetail);
    },
    
    toIndex() {
      this.$router.push({
        name: "index"
      })
    }
  },

  created() {
    this.holdWords = this.$route.params.id;
    for (let i = 0; i < this.holdWords.length; i++) {
      this.holdWords[i].detailFlag = false;
    }
  },
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

.wordsList {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

#toIndexBtn {
  position: absolute;
  left: 15px;
  top: 15px;
}

.words {
  border-bottom: 7px solid #e8eaec;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  max-height: 350px;
  min-height: 150px;
}

.detailSturc {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 250px;
  margin-bottom: 10px;
}

.text {
  font-size: 25px;
}

.word {
  width: 150px;
  height: 50px;
  margin: 20px;
}

.sentence {
  border: 1px solid black;
  font-size: 15px;
  margin-top: 30px;
  margin-left: 30px;
  margin-right: 30px;
  padding: 20px;
}

.voice {
  font-size: 20px;
  margin-top: 20px;
}

.chinese {
  font-size: 20px;
  margin-top: 20px;
}
</style>
