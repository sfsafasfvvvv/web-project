// 图片类型枚举
export const ImageType = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml'
}

// 图片处理配置
const defaultConfig = {
  // 默认图片类型
  defaultType: ImageType.JPEG,
  
  // 默认图片质量（0-1）
  defaultQuality: 0.8,
  
  // 默认最大尺寸
  maxWidth: 1920,
  maxHeight: 1080,
  
  // 默认最大文件大小（MB）
  maxFileSize: 5,
  
  // 默认缩略图尺寸
  thumbnailWidth: 200,
  thumbnailHeight: 200,
  
  // 默认水印配置
  watermark: {
    text: '',
    font: '16px Arial',
    color: 'rgba(255, 255, 255, 0.5)',
    position: 'bottom-right',
    margin: 10
  }
}

class ImageService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // 加载图片
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = typeof src === 'string' ? src : URL.createObjectURL(src)
    })
  }

  // 创建画布
  createCanvas(width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  }

  // 获取图片信息
  async getImageInfo(file) {
    const img = await this.loadImage(file)
    return {
      width: img.width,
      height: img.height,
      type: file.type,
      size: file.size,
      aspectRatio: img.width / img.height
    }
  }

  // 压缩图片
  async compress(file, options = {}) {
    const {
      maxWidth = this.config.maxWidth,
      maxHeight = this.config.maxHeight,
      quality = this.config.defaultQuality,
      type = this.config.defaultType
    } = options

    const img = await this.loadImage(file)
    let { width, height } = img

    // 调整尺寸
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width)
      width = maxWidth
    }
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height)
      height = maxHeight
    }

    // 创建画布
    const canvas = this.createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)

    // 转换为Blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, type, quality)
    })

    return new File([blob], file.name, { type })
  }

  // 创建缩略图
  async createThumbnail(file, options = {}) {
    const {
      width = this.config.thumbnailWidth,
      height = this.config.thumbnailHeight,
      quality = this.config.defaultQuality,
      type = this.config.defaultType
    } = options

    const img = await this.loadImage(file)
    const aspectRatio = img.width / img.height

    // 计算缩略图尺寸
    let targetWidth = width
    let targetHeight = height

    if (width / height > aspectRatio) {
      targetWidth = Math.round(height * aspectRatio)
    } else {
      targetHeight = Math.round(width / aspectRatio)
    }

    // 创建画布
    const canvas = this.createCanvas(targetWidth, targetHeight)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

    // 转换为Blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, type, quality)
    })

    return new File([blob], `thumb_${file.name}`, { type })
  }

  // 裁剪图片
  async crop(file, options = {}) {
    const {
      x = 0,
      y = 0,
      width,
      height,
      quality = this.config.defaultQuality,
      type = this.config.defaultType
    } = options

    const img = await this.loadImage(file)

    // 创建画布
    const canvas = this.createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

    // 转换为Blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, type, quality)
    })

    return new File([blob], `crop_${file.name}`, { type })
  }

  // 旋转图片
  async rotate(file, angle, options = {}) {
    const {
      quality = this.config.defaultQuality,
      type = this.config.defaultType
    } = options

    const img = await this.loadImage(file)
    const { width, height } = img

    // 计算旋转后的尺寸
    const radian = (angle * Math.PI) / 180
    const sin = Math.abs(Math.sin(radian))
    const cos = Math.abs(Math.cos(radian))
    const newWidth = Math.floor(width * cos + height * sin)
    const newHeight = Math.floor(height * cos + width * sin)

    // 创建画布
    const canvas = this.createCanvas(newWidth, newHeight)
    const ctx = canvas.getContext('2d')

    // 移动到画布中心
    ctx.translate(newWidth / 2, newHeight / 2)
    ctx.rotate(radian)
    ctx.drawImage(img, -width / 2, -height / 2)

    // 转换为Blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, type, quality)
    })

    return new File([blob], `rotate_${file.name}`, { type })
  }

  // 添加水印
  async addWatermark(file, options = {}) {
    const {
      text = this.config.watermark.text,
      font = this.config.watermark.font,
      color = this.config.watermark.color,
      position = this.config.watermark.position,
      margin = this.config.watermark.margin,
      quality = this.config.defaultQuality,
      type = this.config.defaultType
    } = options

    const img = await this.loadImage(file)
    const { width, height } = img

    // 创建画布
    const canvas = this.createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // 绘制原图
    ctx.drawImage(img, 0, 0)

    // 设置水印样式
    ctx.font = font
    ctx.fillStyle = color
    ctx.textBaseline = 'middle'

    // 计算水印位置
    const textWidth = ctx.measureText(text).width
    const textHeight = parseInt(font)
    let x, y

    switch (position) {
      case 'top-left':
        x = margin
        y = margin + textHeight / 2
        break
      case 'top-right':
        x = width - textWidth - margin
        y = margin + textHeight / 2
        break
      case 'bottom-left':
        x = margin
        y = height - margin - textHeight / 2
        break
      case 'bottom-right':
        x = width - textWidth - margin
        y = height - margin - textHeight / 2
        break
      case 'center':
        x = (width - textWidth) / 2
        y = height / 2
        break
      default:
        x = margin
        y = margin + textHeight / 2
    }

    // 绘制水印
    ctx.fillText(text, x, y)

    // 转换为Blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, type, quality)
    })

    return new File([blob], `watermark_${file.name}`, { type })
  }

  // 调整图片尺寸
  async resize(file, options = {}) {
    const {
      width,
      height,
      maintainAspectRatio = true,
      quality = this.config.defaultQuality,
      type = this.config.defaultType
    } = options

    const img = await this.loadImage(file)
    const aspectRatio = img.width / img.height

    // 计算目标尺寸
    let targetWidth = width
    let targetHeight = height

    if (maintainAspectRatio) {
      if (width && !height) {
        targetHeight = Math.round(width / aspectRatio)
      } else if (height && !width) {
        targetWidth = Math.round(height * aspectRatio)
      } else if (width / height > aspectRatio) {
        targetWidth = Math.round(height * aspectRatio)
      } else {
        targetHeight = Math.round(width / aspectRatio)
      }
    }

    // 创建画布
    const canvas = this.createCanvas(targetWidth, targetHeight)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

    // 转换为Blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, type, quality)
    })

    return new File([blob], `resize_${file.name}`, { type })
  }

  // 转换图片格式
  async convert(file, type = this.config.defaultType, quality = this.config.defaultQuality) {
    const img = await this.loadImage(file)
    const { width, height } = img

    // 创建画布
    const canvas = this.createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    // 转换为Blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, type, quality)
    })

    const extension = type.split('/')[1]
    const newName = file.name.replace(/\.[^.]+$/, `.${extension}`)
    return new File([blob], newName, { type })
  }

  // 应用滤镜
  async applyFilter(file, filter, options = {}) {
    const {
      quality = this.config.defaultQuality,
      type = this.config.defaultType
    } = options

    const img = await this.loadImage(file)
    const { width, height } = img

    // 创建画布
    const canvas = this.createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, width, height)
    const { data } = imageData

    // 应用滤镜
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      switch (filter) {
        case 'grayscale':
          const gray = (r + g + b) / 3
          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
          break
        case 'sepia':
          data[i] = r * 0.393 + g * 0.769 + b * 0.189
          data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168
          data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131
          break
        case 'invert':
          data[i] = 255 - r
          data[i + 1] = 255 - g
          data[i + 2] = 255 - b
          break
        // 添加更多滤镜...
      }
    }

    // 更新图像数据
    ctx.putImageData(imageData, 0, 0)

    // 转换为Blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, type, quality)
    })

    return new File([blob], `filter_${file.name}`, { type })
  }

  // 创建预览URL
  createPreviewUrl(file) {
    return URL.createObjectURL(file)
  }

  // 释放预览URL
  revokePreviewUrl(url) {
    URL.revokeObjectURL(url)
  }

  // 验证图片
  async validateImage(file, options = {}) {
    const {
      maxFileSize = this.config.maxFileSize,
      allowedTypes = Object.values(ImageType),
      minWidth,
      minHeight,
      maxWidth = this.config.maxWidth,
      maxHeight = this.config.maxHeight
    } = options

    // 验证文件类型
    if (!allowedTypes.includes(file.type)) {
      throw new Error('不支持的图片格式')
    }

    // 验证文件大小
    if (file.size > maxFileSize * 1024 * 1024) {
      throw new Error(`图片大小不能超过${maxFileSize}MB`)
    }

    // 验证图片尺寸
    const img = await this.loadImage(file)
    const { width, height } = img

    if (minWidth && width < minWidth) {
      throw new Error(`图片宽度不能小于${minWidth}像素`)
    }
    if (minHeight && height < minHeight) {
      throw new Error(`图片高度不能小于${minHeight}像素`)
    }
    if (maxWidth && width > maxWidth) {
      throw new Error(`图片宽度不能超过${maxWidth}像素`)
    }
    if (maxHeight && height > maxHeight) {
      throw new Error(`图片高度不能超过${maxHeight}像素`)
    }

    return true
  }
}

// 创建图片服务实例
export const image = new ImageService()

export default image 