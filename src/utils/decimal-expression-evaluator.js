// decimal-expression-evaluator.js
// 高精度表达式计算器 —— 支持 "10 + 10 / 3" 等四则运算

import Decimal from "decimal.js";

// 设置内部计算精度（建议高于显示需求）
Decimal.set({
  precision: 60, // 有效数字位数
  rounding: Decimal.ROUND_HALF_UP, // 四舍五入
});

/**
 * 原始高精度计算（返回 Decimal 实例）
 * @param {string} expr - 表达式，如 "10 + 10 / 3"
 * @returns {Decimal}
 */
function evaluateExpression(expr) {
  if (typeof expr !== "string") {
    throw new TypeError("Expression must be a string");
  }

  expr = expr.replace(/\s+/g, "");
  if (expr === "") throw new Error("Empty expression");

  // 安全校验：只允许数字、小数点、+ - * / ( )
  if (!/^[\d.+\-*/()]+$/.test(expr)) {
    throw new Error("Invalid characters in expression");
  }

  const tokens = tokenize(expr);
  const rpn = infixToRPN(tokens);
  return evaluateRPN(rpn);
}

/**
 * 分词器：支持负数、小数
 */
function tokenize(str) {
  const tokens = [];
  let i = 0;

  while (i < str.length) {
    const char = str[i];

    if (/\d/.test(char) || char === ".") {
      let num = "";
      while (i < str.length && /[\d.]/.test(str[i])) {
        num += str[i++];
      }
      if ((num.match(/\./g) || []).length > 1) {
        throw new Error(`Invalid number: ${num}`);
      }
      tokens.push(num);
      continue;
    }

    if (["+", "-", "*", "/", "(", ")"].includes(char)) {
      if (
        char === "-" &&
        (tokens.length === 0 || tokens[tokens.length - 1] === "(")
      ) {
        let numStr = "-";
        i++;
        while (i < str.length && /[\d.]/.test(str[i])) {
          numStr += str[i++];
        }
        if (numStr === "-") throw new Error("Invalid minus sign");
        if ((numStr.match(/\./g) || []).length > 1) {
          throw new Error(`Invalid number: ${numStr}`);
        }
        tokens.push(numStr);
        continue;
      }
      tokens.push(char);
    }

    i++;
  }

  return tokens;
}

/**
 * 中缀转后缀（Shunting Yard）
 */
function infixToRPN(tokens) {
  const output = [];
  const stack = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

  for (const token of tokens) {
    if (/^-?\d*\.?\d+$/.test(token)) {
      output.push(new Decimal(token));
    } else if (token === "(") {
      stack.push(token);
    } else if (token === ")") {
      let found = false;
      while (stack.length) {
        const op = stack.pop();
        if (op === "(") {
          found = true;
          break;
        }
        output.push(op);
      }
      if (!found) throw new Error("Mismatched parentheses");
    } else if (["+", "-", "*", "/"].includes(token)) {
      while (
        stack.length &&
        stack[stack.length - 1] !== "(" &&
        precedence[stack[stack.length - 1]] >= precedence[token]
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    }
  }

  while (stack.length) {
    const op = stack.pop();
    if (op === "(" || op === ")") throw new Error("Mismatched parentheses");
    output.push(op);
  }

  return output;
}

/**
 * 计算后缀表达式
 */
function evaluateRPN(rpn) {
  const stack = [];

  for (const token of rpn) {
    if (token instanceof Decimal) {
      stack.push(token);
    } else {
      if (stack.length < 2) {
        throw new Error("Invalid expression: insufficient operands");
      }
      const b = stack.pop();
      const a = stack.pop();

      let result;
      switch (token) {
        case "+":
          result = a.plus(b);
          break;
        case "-":
          result = a.minus(b);
          break;
        case "*":
          result = a.times(b);
          break;
        case "/":
          if (b.isZero()) throw new Error("Division by zero");
          result = a.dividedBy(b);
          break;
        default:
          throw new Error(`Unknown operator: ${token}`);
      }
      stack.push(result);
    }
  }

  if (stack.length !== 1) {
    throw new Error("Invalid expression: too many operands");
  }

  return stack[0];
}

/**
 * 高精度表达式计算 + 格式化输出
 * @param {string} expr - 表达式，如 "10 + 10 / 3"
 * @param {number | 'auto' | null} [dp='auto'] - 小数位控制
 *   - number: 固定位数（四舍五入），如 2 → "13.33"
 *   - 'auto': 自动去除尾零（默认）
 *   - null/undefined: 返回完整高精度字符串
 * @returns {string}
 */
function evaluateAndFormat(expr, dp = "auto") {
  const result = evaluateExpression(expr);

  if (typeof dp === "number") {
    return result.toFixed(dp);
  } else if (dp === "auto") {
    let str = result.toString();
    if (str.includes(".")) {
      str = str.replace(/\.?0+$/, ""); // 移除尾随零和可能的小数点
    }
    return str || "0";
  } else {
    return result.toString();
  }
}

// ======================
// 导出模块
// ======================
export { evaluateExpression, evaluateAndFormat };

// 浏览器全局挂载（兼容 <script> 引入）
if (typeof window !== "undefined" && window.Decimal) {
  window.DecimalExpressionEvaluator = {
    evaluateExpression,
    evaluateAndFormat,
  };
  // 或单独挂载（可选）：
  // window.evaluateExpression = evaluateExpression;
  // window.evaluateAndFormat = evaluateAndFormat;
}
