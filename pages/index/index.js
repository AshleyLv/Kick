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
    hasUserInfo: false,
    sectorCounter:[],
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
    if (this.data.cdSecond=='00'){
        let counter = this.data.sectorCounter
        counter.push(1);
        this.setData({
          sectorCounter: counter
        });
    }
  }
})
