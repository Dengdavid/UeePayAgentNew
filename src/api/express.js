import request from './request.js'

export default {
    // 获取支持的币种
    getCurrency() {
        return request({url: '/express/currency', method: 'get'})
    },
    // 获取币种字段参数
    getFieldParams(params) {
        return request({  url: '/express/fieldParams', method: 'get',  params })
    },
    // 获取币种字段填写示例
    getFieldExample(params) {
        return request({  url: '/express/fieldExample', method: 'get',  params })
    },
    // 计算汇款金额
    exchangeAmount(params) {
        return request({ url: '/express/exchangeAmount', method: 'post', data: params })
    },
    // 获取收款人
    getReceivers(params) {
        return request({ url: '/express/receiver/approved', method: 'get', params })
    },
    // 获取付款人
    getSenders(params) {
        return request({ url: '/express/sender/approved', method: 'get', params })
    },

    // 获取银行城市列表
    getBankCity(params) {
        return request({  url: '/express/bankCity', method: 'get',  params })
    },

    // 获取交易历史列表
    getTransactionHistory(params) {
        return request({url: '/express/transactionLists', method: 'get', params})
    },
    
    // 获取交易详情
    getTransactionInfo(merchantOrderNo) {
        return request({url: '/express/transactionInfo', method: 'get', params: { merchantOrderNo, is_show_file: 1 }})
    },
    
    // 上传合规资料文件
    uploadComplianceFile(formData) {
        return request({ url: '/express/upload', method: 'post', data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    
    // 提交合规资料
    submitCompliance(data) {
        return request({ url: '/express/submitRfi', method: 'post', data})
    },

    // 添加收款人
    addReceiver(params) {
        return request({ url: '/express/receiver/add', method: 'post', data: params });
    },

    // 获取收款人列表
    getReceiverList(params) {
        return request({ url: '/express/receiver/index', method: 'get', params });
    },

    // 添加付款人
    addSender(params) {
        return request({ url: '/express/sender/add', method: 'post', data: params });
    },

    // 获取付款人列表
    getSenderList(params) {
        return request({ url: '/express/sender/index', method: 'get', params });
    },

    // 发起交易
    submitTransaction(params) {
        return request({ url: '/express/transaction', method: 'post', data: params });
    },
    
    // 获取付款人详情
    getSenderDetail(params) {
        return request({ url: '/express/sender/info', method: 'get', params });
    },

    // 编辑付款人
    editSender(params) {
        return request({ url: '/express/sender/edit', method: 'post', data: params });
    },

    // 获取收款人详情
    getReceiverDetail(params) {
        return request({ url: '/express/receiver/info', method: 'get', params });
    },

    // 编辑收款人
    editReceiver(params) {
        return request({ url: '/express/receiver/edit', method: 'post', data: params });
    },

    // 修改收款人标签
    editReceiverLabel(params) {
        return request({ url: '/express/receiver/editLabel', method: 'post', data: params });
    },

    // 修改付款人标签
    editSenderLabel(params) {
        return request({ url: '/express/sender/editLabel', method: 'post', data: params });
    },
}