/**
 * https://my.linkpreview.net/
 */
const LINK_PREVIEW_KEY = '1b0a8f90ebb830670d1b66add1c18684'

/**
 * 请求页面基础meta信息
 * @param url 
 * @returns 
 */
const fetchMetadata = async (url: string) => {
  try {
    const response = await fetch(
      `https://api.linkpreview.net/?key=${LINK_PREVIEW_KEY}&q=${encodeURIComponent(url)}`
    )
    if (!response.ok) {
      throw new Error('Fetch meta was not ok')
    }
    const data = await response.json()
    return { title: data.title, description: data.description, image: data.image, url: data.url }
  } catch (e) {
    const { hostname, href } = new URL(url)
    return {
      title: hostname,
      description: '',
      image: '/favicon.ico',
      url: href,
    }
  }
}

export { fetchMetadata }
