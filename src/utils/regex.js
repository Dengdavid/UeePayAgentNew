import isEmail from "validator/es/lib/isEmail.js";
import isIP from "validator/es/lib/isIP.js";
import isURL from "validator/es/lib/isURL.js";
import matches from "validator/es/lib/matches.js";
export const isUrl = (val) => {
  let hostname = "";
  try {
    hostname = new URL(val).hostname.replace(/^\[|\]$/g, "");
  } catch {
    return false;
  }
  if (isIP(hostname)) return false;
  return isURL(val, {
    protocols: ["http", "https"],
    require_protocol: true, // 必须包含协议（如 https://）
    require_host: true, // 必须有主机名
    allow_fragments: true,
    allow_query_components: true,
  });
};
export const isRegex = (val, regexType, regexText = "") => {
  // 若值为空，视为通过（由 required 单独校验）
  if (val == null || val === "") {
    return true;
  }

  let regex;
  switch (regexType) {
    case "postal_code":
      regex = /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/;
      return matches(val, regex);

    case "email":
      return isEmail(val); // 注意：不传 regex

    case "website":
      return isUrl(val);
    case "ssn":
      regex = /^(?!000|666|9\d\d)\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/;
      return matches(val, regex);

    default:
      if (regexText) {
        return matches(val, regexText);
      }
      return true; // 无类型也无正则，视为通过
  }
};

export const regexFun = (val, regexType, regexText = "") => {
  if (!val) return true;
  const valArr = val
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
  return valArr.every((item) => isRegex(item, regexType, regexText));
};
