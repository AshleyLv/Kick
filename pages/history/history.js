// pages/history/history.js
Page({
  data: {
    index : 1,
    size: 5,
    recordList : []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadHistory();
  },
  loadHistory: function(){
    var self = this
    wx.getStorage({
      key: 'sessionKey',
      success: function (sessionKey) {
        wx.request({
          url: 'https://wheelsfactory.cn/babykick/logs',
          method: "GET",
          data: {
            index: self.data.index,
            size: self.data.size,
            sessionKey: sessionKey.data
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (result) {
            if(result.data.result){
              let list = self.data.recordList
              result.data.result.forEach(function (item) {
                item.duration = Math.ceil(item.duration / 60000)
                list.push(item)
              })
              self.setData({
                recordList: list
              })
            }

          }
        })
      }
    })
  },
  loadMore: function(){
    this.setData({
      index: this.data.index + 1
    })
    this.loadHistory();
  }
})