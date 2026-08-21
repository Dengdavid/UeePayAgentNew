/**
 * 下载指定 URL 的文件（支持跨域，无需 CORS）
 * @param {string} url - 文件的完整 URL
 * @param {string} [filename] - 可选：自定义文件名（含扩展名）
 */
export const downloadUrl = (url, filename = "") => {
  // 1. 自动提取文件名（处理 URL 编码和查询参数）
  const inferredFilename =
    decodeURIComponent(
      url
        .split("?")[0] // 去掉查询参数 ?v=123
        .split("/") // 按 / 分割
        .pop() // 取最后一段（如 "New%20York.png"）
    ) || "download";

  const finalFilename = filename || inferredFilename;

  // 2. 创建临时 <a> 标签
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename; // ⚠️ 注意：Safari 忽略此属性（见下方说明）
  // 3. 安全 & 兼容性设置
  a.rel = "noopener";
  a.target = "_blank"; // 避免影响当前页面

  // 4. 触发点击（关键：必须添加到 DOM）
  document.body.appendChild(a);

  // 5. 使用 setTimeout 确保在 Safari 中生效
  setTimeout(() => {
    a.click();
    document.body.removeChild(a);
  }, 0);
};
