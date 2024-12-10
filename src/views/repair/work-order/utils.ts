/**
 * @description 从图片 url 中获取图片名
 */
export const getPictureName = (url?: string) => {
  if (!url) return
  const match = url.match(/\w+\.(jpg|png|jpeg)$/)
  if (match) {
    return match[0]
  } else {
    console.error('未找到图片名')
  }
}
