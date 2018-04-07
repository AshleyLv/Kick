//app.js
App({
  onLaunch: function () {
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
    wx.login({
      success: res => {
        wx.request({
          url: 'https://wheelsfactory.cn/babykick/login',
          method: "POST",
          data: {
            code: res.code
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (result) {
            wx.setStorageSync('sessionKey', result.data)
          }
        })
      }
    })

    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            success(res) {

            }
          })
        }else {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    status: 'init'
  }
})