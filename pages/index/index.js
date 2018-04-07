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
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    startDate:''
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
      startDate: util.formatTime(new Date())
    })

    timer = setInterval(this.updateCountdown, 1000);
  },
  resetTimer: function (e) {
    app.globalData.status = 'running'
    this.updateStatus()
    clearInterval(timer)
    this.setData({
      kicks: 0,
      lastValidTime: new Date('2018.01.01'),
      countInFiveMins: 0,
      validCount: 0,
      canReverse: false,
      sectorCounter: [],
      lastKickIsValidCount: false
    })
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
      this.showsubmitRecordToast()
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
  showsubmitRecordToast: function(){
    var self = this
    var end = util.formatTime(new Date())
    wx.showModal({
      title: '提示',
      content: '是否提交数据',
      success: function (res) {
        if (res.confirm) {
          self.submitRecord(end)
        } else if (res.cancel) {
          self.resetTimer()
        }
      }
    }) 
  },
  submitRecord: function(end){
    var self = this;
    wx.getStorage({
      key: 'sessionKey',
      success: function (sessionKey) {
        wx.request({
          url: 'https://wheelsfactory.cn/babykick/log',
          method: "POST",
          data: {
            totalCount: self.data.kicks,
            validCount: self.data.validCount,
            submitDate: end,
            sessionKey: sessionKey.data,
            startTime: self.data.startDate,
            endTime: end
      },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (result) {
            if(result.data){
              wx.showToast({
                title: '数据提交成功',
                icon: 'succes',
                duration: 1000,
                mask: true
              })
            } else {
              wx.showToast({
                title: '数据提交失败',
                duration: 1000,
                mask: true
              })
            }
          }
        })
      }
    })
    
  },
  finish: function(){
    var self = this;
    let dec = this.data.cnt - 1;
    if(dec>1800){
      wx.showModal({
        title: '立即结束数胎动',
        content: '记录不足30分钟数据将不保存',
        success: function (res) {
          if (res.confirm) {
            self.resetTimer()
            app.globalData.status = 'init'
            self.updateStatus()
          } else if (res.cancel) {
            
          }
        }
      })
    } else {
      this.showsubmitRecordToast()
    }
    clearInterval(timer)
  }
})
