import { siteConfig } from './site.js'

// 卡组织
export const cardNetworks = ['VISA', 'MasterCard', 'Discover']

// 卡状态
export const cardStatuss = [
    {label: '成功', value: 'Pending'},
    {label: '失败', value: 'Fail'},
    {label: '完成', value: 'Closed'}
]
// 映射
let letCartStatusMaps = {};
cardStatuss.forEach(item => {
    letCartStatusMaps[item.value] = item.label;
})
export const cartStatusMaps = letCartStatusMaps;

// 卡片交易类型
export const cardTypes = [
    {label: '开卡', value: 'Create'},
    {label: '消费', value: 'Consumption'},
    {label: '转入', value: 'TransferIn'},
    {label: '转出', value: 'TransferOut'},
    // {label: '冻结金额', value: 'Frozen'},
    // {label: '解冻金额', value: 'UnFrozen'},
    {label: '冻结', value: 'Suspend'},
    {label: '解冻', value: 'Enable'},
    {label: '罚金', value: 'Penalty'},
    {label: '撤销', value: 'Reversal'},
    {label: '退款', value: 'Credit'},
    {label: '授权', value: 'Fee_Consumption'},
    {label: '注销', value: 'Destroy'},
    {label: '月费', value: 'Monthly'},
    {label: '验证', value: 'Verification'},
]
// 映射
let letCardTypeMaps = {};
cardTypes.forEach(item => {
    letCardTypeMaps[item.value] = item.label;
})
export const cardTypeMaps = letCardTypeMaps;

// 财务类型
export const financeTypes = [
    {value: 'AssetsDeposit', label: '充值'},
    {value: 'transferIn', label: '转入'},
    {value: 'purchase', label: '消费'},
    {value: 'refund', label: '退款'},
    {value: 'transferOut', label: '转出'},
    {value: 'AssetsWithdrawal', label: '提现'},
    {value: 'settlement', label: '清算'},
    {value: 'adjustment', label: '调整'}
]
// 映射
let letFinanceTypeMaps = {};
financeTypes.forEach(item => {
    letFinanceTypeMaps[item.value] = item.label;
})
export const financeTypeMaps = letFinanceTypeMaps;

// 财务状态
export const financeStatusList = [
    {value: 'pending', label: '处理中'},
    {value: 'completed', label: '已完成'},
    {value: 'failed', label: '已失败'},
    {value: 'cancelled', label: '已取消'}
]
// 映射
let letFinanceStatusMaps = {};
financeStatusList.forEach(item => {
    letFinanceStatusMaps[item.value] = item.label;
})
export const financeStatusMaps = letFinanceStatusMaps;



// 常见问题
export const questionLists = [
    {
        title: `${siteConfig.nameZh}（${siteConfig.nameEn}）是什么？`,
        content: `${siteConfig.nameZh}（${siteConfig.nameEn}）是一家主营全球虚拟卡的支付服务商。主要提供一种无需实体介质的支付工具，它通常以数字形式存在，由银行或支付服务商发行，主要用于在线购物和订阅等。`
    },
    {
        title: '我们支持哪些消费场景？',
        content: `虚拟卡（Virtual Card）在现代金融和电子商务中有着广泛的应用。以下是一些${siteConfig.nameZh}（${siteConfig.nameEn}）支持的具体消费场景：\n` +
            '\n' +
            '<b>1.在线购物：</b>虚拟卡可以用于在各种电商平台上进行购物，包括购买实物商品和数字商品。\n' +
            '\n' +
            '<b>2.订阅服务：</b>虚拟卡可以用于支付各种在线订阅服务，如 Telegram、Twitter、Netflix、Spotify、Adobe Creative Cloud、Microsoft Office 365、ChatGPT、OpenAI、Claude 等。\n' +
            '\n' +
            '<b>3.广告投放：</b>可支付全球主流广告平台费用，如通过 FaceBook Ads、Google Ads、TikTok 等。\n' +
            '\n' +
            '<b>4.旅游预订：</b>您可以使用虚拟卡预订机票、酒店和租车服务，如通过 Expedia、Booking.com、Airbnb 等平台。\n' +
            '\n' +
            '<b>5.游戏娱乐：</b>虚拟卡也常用于购买游戏（如 Steam、PlayStation Store）、虚拟物品和在线娱乐。\n' +
            '\n' +
            '<b>6.票务预订：</b>可以用虚拟卡购买各种票务，如电影票、演唱会门票、以及其他活动的电子票。\n' +
            '\n' +
            '<b>7.应用内购：</b>虚拟卡可以用于在 App Store、Google Play、Paypal 进行应用内购买。\n' +
            '\n' +
            '<b>8.教育服务：</b>在线教育课程、培训班以及电子书等数字教育资源也可以通过虚拟卡支付。\n' +
            '\n' +
            '<b>9.日常开销：</b>因为虚拟卡通常可以绑定到手机支付应用（如 Apple Pay、Google Pay），因此可以在支持NFC支付的实体店进行付款。\n' +
            '\n' +
            '<b>10.其它支付：</b>常见主流平台域名购买、服务器租用，如 DogYun、Namesilo 等'
    },
    {
        title: '卡片资费标准或换卡政策？',
        content: '卡片<font color=red>仅在创建时收取一次性制卡费用</font>，后期无任何隐形月租、年费等。通常情况下，卡片有效期为三年，在有效期内若非用户原因导致卡片失效，平台将会免费更换相同卡片或类似用途的卡片。'
    },
    {
        title: '如果开卡后付款失败该怎么办？',
        content: '通常情况下付款失败原因可能是：有效期格式输入错误 / 卡内余额不够 / 您的付款环境被商户标记为欺诈风险。请根据具体提示进行再次付款即可，不建议相同环境反复重试。' +
            '\n' +
            '若仍然有问题，可尝试联系在线客服请求协助获取更多建议。'
    },
    {
        title: '卡内余额是否可以提现？',
        content: '当然，<b>卡内余额属于您的私有财产，我们将予以坚决保护。</b>您可以在任何时候灵活转出卡内余额，并且可随时提现至您的外部账户而无需面临长时间的等待。'
    },
    {
        title: '我的卡片为何被注销？',
        content: '根据您的历史交易数据，风控模型会自动评判异常交易。' +
            '\n' +
            '如果您的卡片在<b>短时间内出现连续拒付、大额拒付、恶意退款、频繁撤销等场景，可能会被风控系统强行注销且中止服务。</b>' +
            '\n' +
            '<font color=red>但请放心，您的资金是安全的。</font>被强行删除的卡片，您的资金将会退回至您的钱包，您可以重新开卡或资金提现。'
    },
    {
        title: '我可以使用哪些方式付款？',
        content: '根据平台政策，当前仅支持 USDT-TRC20 方式付款。后期若开通更多收款方式，我们将会第一时间公布。'
    },
    {
        title: '我有自己的推广媒介，可以合作么？',
        content: '我们非常欢迎具有推广能力的用户参与合作，您可以在会员中心复制您的专属邀请链接，其它用户通过您的专属链接成功注册且创建卡片，您将立即获得最高 30% 佣金，上不封顶且可立即提现。'
    },
    {
        title: '如果我有开发能力，是否可以通过 API 方式接入？',
        content: '是的，可以。作为持牌经营主体和源头服务商，通过API方式合作接入是我们支撑的主要业务之一。\n如果您有这方面的需求，请联系在线客服提交商务合作意向，我们将为您提供个性化的量身定制方案。'
    }
]
