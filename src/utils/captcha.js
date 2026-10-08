/**
 * 坐标按后端协议使用 AES-128-ECB / PKCS7，再编码为 Base64。
 * Web Crypto 仅提供 CBC：每个分块用零 IV 加密并取第一块，等价于 ECB，
 * 避免新增加密依赖；密钥只保留在本次滑块流程的内存中。
 */
export const encryptCaptchaPoint = async (point, secretKey) => {
  const encoder = new TextEncoder()
  const keyBytes = encoder.encode(secretKey)
  if (keyBytes.length !== 16) throw new Error('Invalid captcha key')
  const plain = encoder.encode(JSON.stringify(point))
  const padding = 16 - plain.length % 16
  const padded = new Uint8Array(plain.length + padding)
  padded.set(plain)
  padded.fill(padding, plain.length)
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-CBC', false, ['encrypt'])
  const encrypted = new Uint8Array(padded.length)
  for (let position = 0; position < padded.length; position += 16) {
    const block = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: new Uint8Array(16) },
      key,
      padded.slice(position, position + 16),
    )
    encrypted.set(new Uint8Array(block).slice(0, 16), position)
  }
  return btoa(String.fromCharCode(...encrypted))
}
