require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// 中间件
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err))

// 路由
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/products', require('./routes/products'))
app.use('/api/messages', require('./routes/messages'))

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join', (userId) => {
    socket.join(userId)
    console.log('User joined room:', userId)
  })

  socket.on('message', (data) => {
    io.to(data.receiverId).emit('message', {
      senderId: data.senderId,
      content: data.content,
      timestamp: new Date()
    })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal Server Error' })
})

// 启动服务器
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 