/**
 * 全局唯一标识符（uuid）
 * @param {Number} len uuid的长度，当有前缀时且需要严格控制长度，需自行提前计算好除去前缀字符串的长度
 * @param {Boolean} prefix 将在返回的字符串前面加上此前缀
 * @param {Number} radix 生成uuid的基数(意味着返回的字符串都是这个基数),2-二进制,8-八进制,10-十进制,16-十六进制
 */
export const guid = function(len = 32, prefix = '', radix = null) {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid = [];
    radix = radix || chars.length;

    if (len) {
        // 如果指定uuid长度,只是取随机的字符,0|x为位运算,能去掉x的小数位,返回整数位
        for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        let r;
        // rfc4122标准要求返回的uuid中,某些位为固定的字符
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (let i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    
    return prefix + uuid.join('');
}

// 判断参数是否是其中之一
export function oneOf (value, validList) {
    for (let i = 0; i < validList.length; i++) {
        if (value === validList[i]) {
            return true;
        }
    }
    return false;
}

// 获取对象类型
export const getObjectClass = function(o) {
    if(o === null) return 'Null';
    if(typeof o === 'undefined') return 'Undefined';
    if(Array.isArray(o)) return 'Array';
    return Object.prototype.toString.call(o).slice(8,-1);
}

// 深度克隆
export const deepClone = function(o) {
    var r;
    var oc = getObjectClass(o);
    // 判断类型，对象类型继续往下进行深度克隆，原生类型直接返回
    if(oc === 'Object') {
        r = {};
    }else if(oc === 'Array') {
        r = [];
    }else{
        return o;
    }
    // 进行克隆，当类型为对象和数组是，递归调用遍历
    for(var k in o){
        if(getObjectClass(o[k]) === 'Object' || getObjectClass(o[k]) === 'Array'){
            r[k] = deepClone(o[k]);
        }else{
            r[k] = o[k];
        }
    }
    return r;
}

// 防抖函数、延迟
export const debounce = function(func, delay) {
    var timer = null;
    return function () {
        var self = this, args = arguments;
        timer && clearTimeout(timer);
        timer = setTimeout(function() {
            func.apply(self, args);
        }, delay);
    };
}
// 节流函数，间隔N毫秒触发一次
export const throttle = function(func, delay) {
    var timer,
        args = arguments,
        start;
    return function loop() {
        var self = this;
        var now = Date.now();
        if(!start){
            start = now;
        }
        if(timer){
            clearTimeout(timer);
        }
        if(now - start >= delay){
            func.apply(self, args);
            start = now;
        }else {
            timer = setTimeout(function () {
                loop.apply(self, args);
            }, 50);
        }
    };
}

// 日期格式化，示例：tools.formatDate('2018-10-24', 'yyyy-MM-dd hh:mm:ss')
export const formatDate = function(d, fmt) {
    if(!d) return '';
    if(typeof d === 'string' || typeof d === 'number') {
        // now时返回当前时间
        if(d === 'now') {
            d = new Date();
        }else{
            d = new Date(d);
        }
    }
    if(!fmt) fmt = 'yyyy-MM-dd';
    var o = {
        'M+' : d.getMonth() + 1, //月份
        'd+' : d.getDate(), //日
        'h+' : d.getHours(), //小时
        'm+' : d.getMinutes(), //分
        's+' : d.getSeconds(), //秒
        'q+' : Math.floor((d.getMonth() + 3) / 3), //季度
        'S'  : d.getMilliseconds() //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp('('+ k +')').test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
}

// 驼峰转连字符
export const hyphenate = function(str) {
    return str.replace(/\B([A-Z])/g, '-$1').toLowerCase();
}

// 16进制转rgb
export const colorToRGB = function (str) {
    // 16进制颜色值的正则
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 把颜色值变成小写
    let color = str.toLowerCase();
    if (reg.test(color)) {
        // 如果只有三位的值，需变成六位，如：#fff => #ffffff
        if (color.length === 4) {
            let colorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
            }
            color = colorNew;
        }
        // 处理六位的颜色值，转为RGB
        let colorChange = [];
        for (let i = 1; i < 7; i += 2) {
            colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
        }
        return colorChange;
    }
    return [];
}

// rgb转16进制
export const colorToHex = function (str) {
    // RGB颜色值的正则
    let reg = /^(rgb|RGB)/;
    let color = str;
    if (reg.test(color)) {
        let strHex = "";
        // 把RGB的3个数值变成数组
        let colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        // 转成16进制
        for (let i = 0; i < colorArr.length; i++) {
            let hex = Number(colorArr[i]).toString(16);
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        return strHex;
    } else {
        return '';
    }
}

// 取反向色
export const colorReverse = function (value){
    value = '0x' + value.replace(/#/g,"");
    let str = '000000' + (0xFFFFFF - value).toString(16);
    return '#' + str.substring(str.length - 6, str.length);
}

// 根据指定下下标，获取删除后新的下标
export const getArrNextIndex = function (i, c, len) {
    if(len <= 1) {
        return null;
    }else{
        if(i === c) {
            if(c === 0) {
                return 0;
            }else{
                return c - 1;
            }
        }else{
            if(i > c) {
                return c;
            }else{
                return c - 1;
            }
        }
    }
}

// 字节单位换算函数
export const byteConvert = function (bytes, unit = 'bytes') {
    if (isNaN(bytes)) {
        return '';
    }
    let symbols = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    symbols.splice(0, symbols.findIndex(item => item === unit));
    let exp = Math.floor(Math.log(bytes)/Math.log(2));
    if (exp < 1) {
        exp = 0;
    }
    let i = Math.floor(exp / 10);
    bytes = bytes / Math.pow(2, 10 * i);

    if (bytes.toString().length > bytes.toFixed(2).toString().length) {
        bytes = bytes.toFixed(2);
    }
    return bytes + symbols[i];
}

// 比较最小、最大取值
export const clamp = function(value, min, max) {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

// 版本号比较，v1 < v2 = -1；v1 > v2 = 1；v1 = v2 = 0
export const compareVersion = function(v1, v2) {
    let r;
    let i = 0;
    const arr1 = v1.replace(/[^0-9.]/, '').split('.');
    const arr2 = v2.replace(/[^0-9.]/, '').split('.');
    while (true) {
        const s1 = arr1[i];
        const s2 = arr2[i++];
        if (typeof s1 === 'undefined' || typeof s2 === 'undefined') {
            r = arr1.length - arr2.length;
            break;
        }
        if (s1 === s2) continue;
        r = s1 - s2;
        break;
    }
    return r > 0 ? 1 : r === 0 ? 0 : -1;
}

// 复制文本内容
export const copy = function(text, success, error) {
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    const $textarea = document.createElement('textarea');
    $textarea.style.fontSize = '12pt';
    $textarea.style.border = '0';
    $textarea.style.padding = '0';
    $textarea.style.margin = '0';
    $textarea.style.position = 'absolute';
    $textarea.style[isRTL ? 'right' : 'left'] = '-9999px';
    let yPosition = window.pageYOffset || document.documentElement.scrollTop;
    $textarea.style.top = `${yPosition}px`;
    $textarea.setAttribute('readonly', '');
    $textarea.value = text || '';
    document.body.appendChild($textarea);

    $textarea.select();
    // select($textarea);

    try {
        document.execCommand('copy');
        document.body.removeChild($textarea);
        if (success) success.call();
    } catch (err) {
        document.body.removeChild($textarea);
        if (error) error.call();
    }
}

/*  验证数据完整，并补全
    a: 标准数据
    b: 待验证数据
*/
export const verifyDataIntegrity = function(a, b){
    let obj1 = deepClone(a);
    let obj2 = deepClone(b);
    /* function recursive(s, t) {
        Object.keys(s).map((key) => {
            let v1 = s[key];
            let v2 = t[key];
            if (typeof v1 !== "object" && v2 === undefined) {
                t[key] = v1;
            } else if (typeof v1 === "object" && v2 === undefined) {
                t[key] = v1;
            } else if (typeof v1 === "object" && typeof v2 === "object") {
                recursive(v1, v2);
            }
        })
    }
    recursive(obj1, obj2); */
    return obj2;
}

// object快速赋值
export const objectAssignment = function(target, data) {
    let obj = {};
    for(let k in target) {
        obj[k] = data[k] || target[k];
    }
    return obj;
}

// 判断是否为空，包括''、null、[]、{}
export const isEmpty = function(value) {
    if(!value) return true;
    if(typeof value === 'object') {
        if(Object.keys(value).length === 0) return true;
    }
    return false;
}
// 获取对象{}指定key的值
export const getObjValue = function(obj, key) {
    if(!obj) return '';
    if(typeof obj !== 'object') return '';
    if(Array.isArray(obj)) return '';
    return obj[key];
}

export const tools = {
    guid,
    debounce,
    throttle,
    formatDate,
    getObjectClass,
    deepClone,
    hyphenate,
    colorToRGB,
    colorToHex,
    clamp,
    compareVersion,
    verifyDataIntegrity
}
