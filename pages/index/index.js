//index.js
const util = require('../../utils/util.js')
const app = getApp()
let timer = null

Page({
  data: {
    status: '',
    userInfo: {},
    startTime: '',
    cdMinute: '',
    cdSecond: '',
    cnt: 0,
    kicks: 0,
    lastValidTime: new Date('2018.01.01'),
    countInFiveMins:0,
    validCount:0,
    hasUserInfo: false,
    canReverse:false,
    sectorCounter:[],
    lastKickIsValidCount:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    this.updateStatus()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  startTimer: function (e) {
    app.globalData.status = 'running'
    this.updateStatus()
    
    this.setData({
      cdMinute: '60',
      cdSecond: '00',
      cnt: 3600,
      startTime: util.currentTime(),
    })

    timer = setInterval(this.updateCountdown, 1000);
  },
  resetTimer: function (e) {
    app.globalData.status = 'running'
    this.updateStatus()
    clearInterval(timer)
    this.startTimer()
  },
  updateStatus: function() {
    this.setData({
      status: app.globalData.status
    })
  },
  updateCountdown: function() {
    let dec = this.data.cnt - 1;
    if(dec <= 0) {
      clearInterval(timer)
      app.globalData.status = 'stopped'
      this.updateStatus()
      return;
    }
    this.setData({
      cnt: dec,
      cdMinute: parseInt(dec / 60) > 9 ? parseInt(dec / 60) : '0' + parseInt(dec / 60),
      cdSecond: dec % 60 > 9 ? dec % 60 : '0' + dec % 60 
    })
    this.drawSector();
  },
  drawSector: function() {
    let status = 'ligth';
    if (this.data.countInFiveMins >= 3) {
      status = 'heavy';
    } else if (this.data.countInFiveMins < 3 && this.data.countInFiveMins > 1) {
      status = 'middle';
    }
    if (this.data.cdMinute%5==0 && this.data.cdSecond=='00'){
        let counter = this.data.sectorCounter
        counter.push(status);
        this.setData({
          sectorCounter: counter,
          countInFiveMins: 0
        });
        // this.submitRecord();
    }
    
  },
  increment: function () {
    this.setData({
      kicks: this.data.kicks + 1,
      countInFiveMins: this.data.countInFiveMins+1,
      canReverse: true
    });
    if ((new Date()).getTime() - (new Date(this.data.lastValidTime)).getTime() > 300000)    {
      this.setData({
        lastValidTime: new Date(),
        validCount: this.data.validCount+1,
        lastKickIsValidCount : true
      });
    } else {
      this.setData({
        lastKickIsValidCount:false
      })
    }
  },
  revertLast : function () {
    if (this.data.lastKickIsValidCount){
      this.setData({
        validCount: this.data.validCount - 1,
        lastKickIsValidCount: false,
        kicks: this.data.kicks - 1,
        canReverse:false,
        lastValidTime: new Date((new Date(this.data.lastValidTime)).getTime() - 300000)
      })
    } else {
      this.setData({
        kicks: this.data.kicks - 1,
        canReverse:false
      })
    }
  },
  submitRecord: function(){
    wx.request({
      url: 'https://wheelsfactory.cn/babykick/log',
      method: "POST",
      data: {
        totalCount: 120,
        validCount: 14,
        submitDate: '20180401 11:12:00'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (result) {
        console.log(result)
      }
    })
  }
})
