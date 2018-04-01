// pages/history/history.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadHistory();
  },
  loadHistory: function(){
    wx.request({
      url: 'https://wheelsfactory.cn/babykick/logs',
      method: "GET",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (result) {
        console.log(result)
      }
    })
  }
})