<template>
  <div class="publish-page">
    <div class="container">
      <div class="publish-container">
        <div class="publish-main">
          <h2 class="page-title">Post Item</h2>
          <p class="page-subtitle">Fill in the item details to let more students discover your product</p>

          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="120px"
            class="publish-form"
            @submit.prevent="handleSubmit"
          >
            <!-- Product Images -->
            <el-form-item label="Images" prop="images" required>
              <el-upload
                v-model:file-list="formData.images"
                action="/api/upload"
                list-type="picture-card"
                :limit="9"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :before-upload="beforeUpload"
              >
                <div class="upload-placeholder" :style="{ background: '#f5f5f5' }">
                  <el-icon><Plus /></el-icon>
                </div>
                <template #tip>
                  <div class="upload-tip">
                    Supports JPG and PNG formats, up to 9 images, max 2MB each
                  </div>
                </template>
              </el-upload>
            </el-form-item>

            <!-- Product Title -->
            <el-form-item label="Title" prop="title" required>
              <el-input
                v-model="formData.title"
                placeholder="Enter product title (2-30 characters)"
                maxlength="30"
                show-word-limit
              />
            </el-form-item>

            <!-- Product Category -->
            <el-form-item label="Category" prop="category" required>
              <el-cascader
                v-model="formData.category"
                :options="categories"
                :props="{
                  expandTrigger: 'hover',
                  value: 'value',
                  label: 'label'
                }"
                placeholder="Select product category"
                clearable
              />
            </el-form-item>

            <!-- Product Price -->
            <el-form-item label="Price" required>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item prop="price">
                    <el-input-number
                      v-model="formData.price"
                      :min="0"
                      :precision="2"
                      :step="0.01"
                      placeholder="Selling price"
                    >
                      <template #prefix>$</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="originalPrice">
                    <el-input-number
                      v-model="formData.originalPrice"
                      :min="0"
                      :precision="2"
                      :step="0.01"
                      placeholder="Original price (optional)"
                    >
                      <template #prefix>$</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form-item>

            <!-- Product Condition -->
            <el-form-item label="Condition" prop="condition" required>
              <el-radio-group v-model="formData.condition">
                <el-radio-button label="100">Brand New</el-radio-button>
                <el-radio-button label="95">Like New</el-radio-button>
                <el-radio-button label="90">Very Good</el-radio-button>
                <el-radio-button label="80">Good</el-radio-button>
                <el-radio-button label="70">Acceptable</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <!-- Trading Methods -->
            <el-form-item label="Trading Method" prop="tradeMethods" required>
              <el-checkbox-group v-model="formData.tradeMethods">
                <el-checkbox label="face">Meet on Campus</el-checkbox>
                <el-checkbox label="pickup">Campus Pickup Point</el-checkbox>
                <el-checkbox label="express">Shipping</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- Trading Location -->
            <el-form-item
              label="Location"
              prop="location"
              required
              v-if="needLocation"
            >
              <el-cascader
                v-model="formData.location"
                :options="locations"
                :props="{
                  expandTrigger: 'hover',
                  value: 'value',
                  label: 'label'
                }"
                placeholder="Select trading location"
                clearable
              />
            </el-form-item>

            <!-- Product Description -->
            <el-form-item label="Description" prop="description" required>
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="6"
                placeholder="Please describe the condition, usage experience, purchase source, etc. (10-1000 characters)"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>

            <!-- Product Tags -->
            <el-form-item label="Tags" prop="tags">
              <el-tag
                v-for="tag in formData.tags"
                :key="tag"
                closable
                :disable-transitions="false"
                @close="handleClose(tag)"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                class="tag-input"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
              />
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput"
              >
                + Add Tag
              </el-button>
              <div class="form-tip">
                Maximum 5 tags, each tag up to 10 characters
              </div>
            </el-form-item>

            <!-- Submit Buttons -->
            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="loading"
                size="large"
              >
                Post Item
              </el-button>
              <el-button
                size="large"
                @click="handlePreview"
              >
                Preview
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="publish-side">
          <div class="tips-card">
            <h3>Posting Tips</h3>
            <ul class="tips-list">
              <li>
                <el-icon><InfoFilled /></el-icon>
                <span>Product images should be real and clear</span>
              </li>
              <li>
                <el-icon><InfoFilled /></el-icon>
                <span>Title should be concise, description should be detailed</span>
              </li>
              <li>
                <el-icon><InfoFilled /></el-icon>
                <span>Price should be reasonable, no fake original prices</span>
              </li>
              <li>
                <el-icon><InfoFilled /></el-icon>
                <span>No prohibited items or false information</span>
              </li>
            </ul>
          </div>

          <div class="contact-card">
            <h3>Need Help?</h3>
            <p>If you encounter any issues while posting, you can:</p>
            <el-button type="primary" text>
              <el-icon><Service /></el-icon>
              Contact Support
            </el-button>
            <el-button type="primary" text>
              <el-icon><QuestionFilled /></el-icon>
              View Help
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview -->
    <el-dialog v-model="previewVisible" title="Image Preview">
      <div 
        class="preview-image" 
        :style="{ 
          background: '#f5f5f5',
          width: '100%',
          height: '400px',
          borderRadius: '12px'
        }"
      ></div>
    </el-dialog>

    <!-- Preview Dialog -->
    <el-dialog
      v-model="productPreviewVisible"
      title="Product Preview"
      width="800px"
      class="preview-dialog"
    >
      <div class="preview-content">
        <div class="preview-header">
          <h2>{{ formData.title }}</h2>
          <div class="preview-price">
            <span class="current-price">${{ formData.price }}</span>
            <span class="original-price" v-if="formData.originalPrice">
              ${{ formData.originalPrice }}
            </span>
          </div>
        </div>

        <div class="preview-info">
          <div class="info-item">
            <label>Category:</label>
            <span>{{ getCategoryText(formData.category) }}</span>
          </div>
          <div class="info-item">
            <label>Condition:</label>
            <span>{{ getConditionText(formData.condition) }}</span>
          </div>
          <div class="info-item">
            <label>Trading Method:</label>
            <span>{{ getTradeMethodsText(formData.tradeMethods) }}</span>
          </div>
          <div class="info-item" v-if="needLocation">
            <label>Location:</label>
            <span>{{ getLocationText(formData.location) }}</span>
          </div>
        </div>

        <div class="preview-description">
          <h3>Description</h3>
          <p>{{ formData.description }}</p>
        </div>

        <div class="preview-tags" v-if="formData.tags.length">
          <h3>Tags</h3>
          <div class="tags-list">
            <el-tag
              v-for="tag in formData.tags"
              :key="tag"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  InfoFilled,
  Service,
  QuestionFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// Form data
const formRef = ref(null)
const formData = ref({
  images: [],
  title: '',
  category: [],
  price: '',
  originalPrice: '',
  condition: '',
  tradeMethods: [],
  location: [],
  description: '',
  tags: []
})

// Form validation rules
const rules = {
  images: [
    { required: true, message: 'Please upload at least one image', trigger: 'change' }
  ],
  title: [
    { required: true, message: 'Please enter product title', trigger: 'blur' },
    { min: 2, max: 30, message: 'Length should be 2 to 30 characters', trigger: 'blur' }
  ],
  category: [
    { required: true, message: 'Please select product category', trigger: 'change' }
  ],
  price: [
    { required: true, message: 'Please enter selling price', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Price must be greater than 0', trigger: 'blur' }
  ],
  condition: [
    { required: true, message: 'Please select product condition', trigger: 'change' }
  ],
  tradeMethods: [
    { required: true, message: 'Please select at least one trading method', trigger: 'change' },
    { type: 'array', min: 1, message: 'Please select at least one trading method', trigger: 'change' }
  ],
  location: [
    { required: true, message: 'Please select trading location', trigger: 'change' }
  ],
  description: [
    { required: true, message: 'Please enter product description', trigger: 'blur' },
    { min: 10, max: 1000, message: 'Length should be 10 to 1000 characters', trigger: 'blur' }
  ]
}

// Category options
const categories = [
  {
    value: 'books',
    label: 'Books',
    children: [
      { value: 'textbook', label: 'Textbooks' },
      { value: 'reference', label: 'Study Materials' },
      { value: 'literature', label: 'Literature' }
    ]
  },
  {
    value: 'electronics',
    label: 'Electronics',
    children: [
      { value: 'phone', label: 'Phones' },
      { value: 'computer', label: 'Computers' },
      { value: 'accessories', label: 'Accessories' }
    ]
  },
  {
    value: 'daily',
    label: 'Daily Necessities',
    children: [
      { value: 'clothing', label: 'Clothing' },
      { value: 'cosmetics', label: 'Cosmetics' },
      { value: 'food', label: 'Food' }
    ]
  },
  {
    value: 'sports',
    label: 'Sports & Fitness',
    children: [
      { value: 'equipment', label: 'Equipment' },
      { value: 'clothing', label: 'Sportswear' },
      { value: 'shoes', label: 'Sports Shoes' }
    ]
  }
]

// Location options
const locations = [
  {
    value: 'campus1',
    label: 'Main Campus',
    children: [
      { value: 'library', label: 'Library' },
      { value: 'student_center', label: 'Student Center' },
      { value: 'cafeteria', label: 'Cafeteria' }
    ]
  },
  {
    value: 'campus2',
    label: 'Secondary Campus',
    children: [
      { value: 'dorm', label: 'Dormitory' },
      { value: 'gym', label: 'Gymnasium' },
      { value: 'classroom', label: 'Classroom Building' }
    ]
  }
]

// Tag input
const inputVisible = ref(false)
const inputValue = ref('')
const InputRef = ref(null)

// Loading state
const loading = ref(false)

// Computed
const needLocation = computed(() => {
  return formData.value.tradeMethods.includes('face') || formData.value.tradeMethods.includes('pickup')
})

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // TODO: Call API to submit product
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('Product posted successfully')
    router.push('/user/published')
  } catch (error) {
    console.error('Failed to submit:', error)
    ElMessage.error('Failed to post product')
  } finally {
    loading.value = false
  }
}

const handlePreview = () => {
  // TODO: Implement preview functionality
  ElMessage.info('Preview feature coming soon')
}

const handlePictureCardPreview = (file) => {
  // TODO: Implement image preview
}

const handleRemove = (file) => {
  // TODO: Implement image removal
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('Only image files are allowed')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('Image size cannot exceed 2MB')
    return false
  }
  return true
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value?.input?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    if (formData.value.tags.length >= 5) {
      ElMessage.warning('Maximum 5 tags allowed')
      return
    }
    if (inputValue.value.length > 10) {
      ElMessage.warning('Tag length cannot exceed 10 characters')
      return
    }
    formData.value.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

const handleClose = (tag) => {
  formData.value.tags = formData.value.tags.filter(t => t !== tag)
}

// Helper functions
const getCategoryText = (category) => {
  if (!category?.length) return ''
  // TODO: Implement category text conversion
  return category.join(' > ')
}

const getConditionText = (condition) => {
  const conditions = {
    '100': 'Brand New',
    '95': 'Like New',
    '90': 'Very Good',
    '80': 'Good',
    '70': 'Acceptable'
  }
  return conditions[condition] || ''
}

const getTradeMethodsText = (methods) => {
  if (!methods?.length) return ''
  const methodMap = {
    face: 'Meet on Campus',
    pickup: 'Campus Pickup Point',
    express: 'Shipping'
  }
  return methods.map(m => methodMap[m]).join(', ')
}

const getLocationText = (location) => {
  if (!location?.length) return ''
  // TODO: Implement location text conversion
  return location.join(' > ')
}
</script>

<style lang="scss" scoped>
.publish-page {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.publish-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.publish-main {
  background: var(--bg-white);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.publish-form {
  .el-form-item {
    margin-bottom: 24px;
  }
  
  .upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--text-secondary);
  }
  
  .upload-tip {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;
  }
  
  .tag-input {
    width: 90px;
    margin-left: 8px;
    vertical-align: bottom;
  }
  
  .button-new-tag {
    margin-left: 8px;
    height: 32px;
    padding-top: 0;
    padding-bottom: 0;
  }
  
  .form-tip {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;
  }
}

.publish-side {
  .tips-card,
  .contact-card {
    background: var(--bg-white);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
  }
  
  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--text-secondary);
      
      .el-icon {
        margin-top: 3px;
        color: var(--warning-color);
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .contact-card {
    p {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }
    
    .el-button {
      width: 100%;
      margin-bottom: 8px;
      justify-content: flex-start;
      
      .el-icon {
        margin-right: 8px;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .publish-page {
    padding: 20px 0;
  }
  
  .publish-container {
    grid-template-columns: 1fr;
  }
  
  .publish-main {
    padding: 20px;
  }
  
  .page-title {
    font-size: 20px;
  }
}
</style> 