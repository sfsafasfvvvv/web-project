import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 格式化日期
export const formatDate = (date, pattern = 'yyyy-MM-dd HH:mm:ss') => {
  if (!date) return ''
  return format(new Date(date), pattern)
}

// 格式化相对时间
export const formatRelativeTime = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: zhCN
  })
}

// 格式化金额
export const formatPrice = (price) => {
  if (typeof price !== 'number') return '0.00'
  return price.toFixed(2)
}

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 防抖函数
export const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流函数
export const throttle = (fn, delay) => {
  let timer = null
  let start = Date.now()
  return function (...args) {
    const current = Date.now()
    const remaining = delay - (current - start)
    clearTimeout(timer)
    if (remaining <= 0) {
      fn.apply(this, args)
      start = Date.now()
    } else {
      timer = setTimeout(() => {
        fn.apply(this, args)
        start = Date.now()
      }, remaining)
    }
  }
}

// 深拷贝
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  const clone = Array.isArray(obj) ? [] : {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key])
    }
  }
  return clone
}

// 生成随机ID
export const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2)
}

// 验证手机号
export const isValidPhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 验证邮箱
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 验证密码强度
export const checkPasswordStrength = (password) => {
  const strength = {
    score: 0,
    level: 'weak',
    suggestions: []
  }

  if (password.length < 8) {
    strength.suggestions.push('密码长度至少为8位')
  } else {
    strength.score += 1
  }

  if (/[A-Z]/.test(password)) {
    strength.score += 1
  } else {
    strength.suggestions.push('建议包含大写字母')
  }

  if (/[a-z]/.test(password)) {
    strength.score += 1
  } else {
    strength.suggestions.push('建议包含小写字母')
  }

  if (/[0-9]/.test(password)) {
    strength.score += 1
  } else {
    strength.suggestions.push('建议包含数字')
  }

  if (/[!@#$%^&*]/.test(password)) {
    strength.score += 1
  } else {
    strength.suggestions.push('建议包含特殊字符')
  }

  if (strength.score < 3) {
    strength.level = 'weak'
  } else if (strength.score < 4) {
    strength.level = 'medium'
  } else {
    strength.level = 'strong'
  }

  return strength
}

// 压缩图片
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    type = file.type
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type }))
          },
          type,
          quality
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

// 获取文件扩展名
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

// 判断是否为移动设备
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// 获取浏览器信息
export const getBrowser = () => {
  const ua = navigator.userAgent
  let browser = 'unknown'
  let version = 'unknown'

  // Edge
  if (/Edge\/(\d+)/.test(ua)) {
    browser = 'edge'
    version = RegExp.$1
  }
  // Chrome
  else if (/Chrome\/(\d+)/.test(ua)) {
    browser = 'chrome'
    version = RegExp.$1
  }
  // Firefox
  else if (/Firefox\/(\d+)/.test(ua)) {
    browser = 'firefox'
    version = RegExp.$1
  }
  // Safari
  else if (/Safari\/(\d+)/.test(ua)) {
    browser = 'safari'
    if (/Version\/(\d+)/.test(ua)) {
      version = RegExp.$1
    }
  }
  // IE
  else if (/MSIE (\d+)/.test(ua)) {
    browser = 'ie'
    version = RegExp.$1
  }

  return {
    browser,
    version
  }
}

// 复制文本到剪贴板
export const copyToClipboard = (text) => {
  return navigator.clipboard.writeText(text)
}

// 下载文件
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 获取URL参数
export const getUrlParams = (url = window.location.href) => {
  const params = {}
  const searchParams = new URL(url).searchParams
  for (const [key, value] of searchParams) {
    params[key] = value
  }
  return params
}

// 滚动到顶部
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

// 判断元素是否在视口内
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
}

// 获取随机颜色
export const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

// 生成随机字符串
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 格式化数字（添加千分位）
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 解析URL
export const parseUrl = (url) => {
  const parser = document.createElement('a')
  parser.href = url
  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    hash: parser.hash
  }
}

// 获取设备类型
export const getDeviceType = () => {
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

// 格式化时间间隔
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}秒`)

  return parts.join('')
} 