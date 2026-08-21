/**
 * 生成随机字符串，首字母大写
 * @param {Number} minLength 最小长度
 * @param {Number} maxLength 最大长度
 * @returns {String} 随机字符串
 */
function generateRandomString(minLength = 4, maxLength = 10) {
  // 随机长度
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  
  // 生成随机字母
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const uncommonCombinations = ['x', 'z', 'q', 'j', 'v', 'k', 'w', 'y'];
  const doubleConsonants = ['tt', 'zz', 'xx', 'kk', 'ff', 'gg', 'pp', 'rr', 'nn', 'mm'];
  const consonantClusters = ['tz', 'xr', 'qw', 'zh', 'vk', 'pz', 'jx', 'wr', 'sz', 'zv'];
  
  // 第一个字母大写
  result += characters.charAt(Math.floor(Math.random() * characters.length)).toUpperCase();
  
  // 其余字母
  for (let i = 1; i < length; i++) {
    // 有5%的概率使用双辅音
    if (Math.random() < 0.05 && i < length - 1) {
      result += doubleConsonants[Math.floor(Math.random() * doubleConsonants.length)];
      i++; // 跳过下一个字符位置，因为已经添加了两个字符
    }
    // 有10%的概率使用辅音簇
    else if (Math.random() < 0.10 && i < length - 1) {
      result += consonantClusters[Math.floor(Math.random() * consonantClusters.length)];
      i++; // 跳过下一个字符位置，因为已经添加了两个字符
    }
    // 有15%的概率使用不常见字母
    else if (Math.random() < 0.15) {
      result += uncommonCombinations[Math.floor(Math.random() * uncommonCombinations.length)];
    } else {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }
  
  return result;
}

/**
 * 随机生成持卡人名字
 * @returns {Object} 包含名字(firstName)和姓氏(lastName)的对象
 */
export function generateRandomName() {
  // 生成随机名字，长度3-8
  const firstName = generateRandomString(3, 8);
  
  // 生成随机姓氏，长度4-10
  const lastName = generateRandomString(4, 10);
  
  return {
    firstName: firstName,
    lastName: lastName
  };
} 