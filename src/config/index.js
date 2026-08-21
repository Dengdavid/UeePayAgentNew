import packJson from "../../package.json";

// 是否开发环境 env
export const env = import.meta.env.DEV ? "develop" : "build";
// 模式 mode，由命名中的--mode决定
export const mode = import.meta.env.MODE;

/* API地址 */
// 默认开发环境地址
let url = "https://open-api.ivcc.me/api";

// 环境变量里的URL
if (import.meta.env.VITE_API_URL) {
  url = import.meta.env.VITE_API_URL;
}

// 特定模式指定URL
if (mode !== "development" && mode !== "production") {
  // 示例 testMode
  if (mode === "testMode") {
    url = "https://api-staging.ueepay.com/api";
    // url = "http://192.168.50.103:8787/api";
  }
}

export const host = url;

export const version = packJson.version;
