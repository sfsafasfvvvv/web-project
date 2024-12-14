<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- About Us -->
        <div class="footer-section">
          <h3>About Us</h3>
          <p>Campus Marketplace is a dedicated platform for university students to trade second-hand items, providing a safe and convenient trading environment.</p>
          <div class="qrcode-group">
            <div class="qrcode-item">
              <img src="@/assets/images/wechat-qr.png" alt="WeChat Official Account">
              <span>WeChat Official</span>
            </div>
            <div class="qrcode-item">
              <img src="@/assets/images/miniapp-qr.png" alt="Mini Program">
              <span>Mini Program</span>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h3>Quick Links</h3>
          <ul class="footer-links">
            <li>
              <router-link to="/">Home</router-link>
            </li>
            <li>
              <router-link to="/categories">Categories</router-link>
            </li>
            <li>
              <router-link to="/publish">Sell Item</router-link>
            </li>
            <li>
              <router-link to="/help">Help Center</router-link>
            </li>
            <li>
              <router-link to="/about">About Us</router-link>
            </li>
          </ul>
        </div>

        <!-- Help Center -->
        <div class="footer-section">
          <h3>Help Center</h3>
          <ul class="footer-links">
            <li>
              <router-link to="/help/guide">Getting Started</router-link>
            </li>
            <li>
              <router-link to="/help/safety">Safety Guide</router-link>
            </li>
            <li>
              <router-link to="/help/rules">Trading Rules</router-link>
            </li>
            <li>
              <router-link to="/help/feedback">Feedback</router-link>
            </li>
            <li>
              <router-link to="/help/contact">Contact Us</router-link>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-section">
          <h3>Contact Us</h3>
          <ul class="contact-info">
            <li>
              <el-icon><Message /></el-icon>
              <span>Email: support@example.com</span>
            </li>
            <li>
              <el-icon><Phone /></el-icon>
              <span>Phone: 400-123-4567</span>
            </li>
            <li>
              <el-icon><Clock /></el-icon>
              <span>Hours: Mon-Sun 9:00-22:00</span>
            </li>
          </ul>
          <div class="social-links">
            <a href="#" title="Weibo" class="social-link">
              <el-icon><Position /></el-icon>
            </a>
            <a href="#" title="WeChat" class="social-link">
              <el-icon><ChatDotRound /></el-icon>
            </a>
            <a href="#" title="QQ" class="social-link">
              <el-icon><Service /></el-icon>
            </a>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-info">
          <p>&copy; {{ currentYear }} Campus Marketplace. All rights reserved.</p>
          <p class="footer-legal">
            <a href="/terms">Terms of Service</a>
            <span class="divider">|</span>
            <a href="/privacy">Privacy Policy</a>
            <span class="divider">|</span>
            <a href="/disclaimer">Disclaimer</a>
          </p>
        </div>
        <div class="footer-cert">
          <img src="@/assets/images/cert1.png" alt="Certification 1">
          <img src="@/assets/images/cert2.png" alt="Certification 2">
          <img src="@/assets/images/cert3.png" alt="Certification 3">
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import {
  Message,
  Phone,
  Clock,
  Position,
  ChatDotRound,
  Service
} from '@element-plus/icons-vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style lang="scss" scoped>
.footer {
  background: var(--bg-secondary);
  padding: 80px 0 30px;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 60px;
  margin-bottom: 60px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

.footer-section {
  h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    color: var(--text-primary);
    position: relative;
    padding-bottom: 12px;

    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 2px;
      background: var(--primary-color);
    }
  }

  p {
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 24px;
    font-size: 15px;
  }
}

.qrcode-group {
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
}

.qrcode-item {
  text-align: center;

  img {
    width: 120px;
    height: 120px;
    margin-bottom: 10px;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  span {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.footer-links {
  list-style: none;
  padding: 0;
  
  li {
    margin-bottom: 14px;
    
    a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 15px;
      display: inline-block;
      
      &:hover {
        color: var(--primary-color);
        transform: translateX(5px);
      }
    }
  }
}

.contact-info {
  list-style: none;
  padding: 0;
  margin-bottom: 24px;
  
  li {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    color: var(--text-secondary);
    font-size: 15px;
    
    .el-icon {
      font-size: 20px;
      color: var(--primary-color);
    }
  }
}

.social-links {
  display: flex;
  gap: 16px;
  
  .social-link {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
    
    &:hover {
      background: var(--primary-color);
      color: white;
      transform: translateY(-3px);
    }
    
    .el-icon {
      font-size: 20px;
    }
  }
}

.footer-bottom {
  padding-top: 30px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
}

.footer-info {
  p {
    margin-bottom: 10px;
    font-size: 14px;
  }
}

.footer-legal {
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }

  a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;
    font-size: 14px;

    &:hover {
      color: var(--primary-color);
    }
  }

  .divider {
    color: var(--border-color);
  }
}

.footer-cert {
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: center;
  }

  img {
    height: 40px;
    opacity: 0.8;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }
  }
}
</style> 