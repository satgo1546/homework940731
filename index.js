const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const uuid = require('uuid')

const app = express()
const db = new sqlite3.Database('gallery.db')

// 不存在uploads文件夹时创建
// 递归选项有消除“文件夹已存在”错误的副作用
fs.mkdirSync('uploads', { recursive: true })
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + path.extname(file.originalname))
    }
  })
})

// 创建表结构
db.run(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    order_num REAL
  );
`)

// 首页
app.get('/', (req, res) => {
  let page = parseInt(req.query.page)
  if (!(page >= 0 && Number.isFinite(page))) page = 0
  const LIMIT = 10

  db.all(`SELECT * FROM images ORDER BY order_num ASC LIMIT ?, ?`, [page * LIMIT, LIMIT], (err, rows) => {
    if (err) {
      console.error(err.message)
      return res.status(500).send('错误！')
    }

    db.get(`SELECT COUNT(*) AS total FROM images`, (err, { total }) => {
      if (err) {
        console.error(err.message)
        return res.status(500).send('错误！')
      }

      const totalPages = Math.ceil(total / LIMIT)
      res.send(`<!DOCTYPE html>
        <meta charset="utf-8">
        <title>画廊</title>
        <form method="post" action="/upload" enctype="multipart/form-data">
          <input type="file" name="image" required>
          <button type="submit">上传</button>
        </form>
        ${rows.map(image => `
            <form method="get" action="/reorder">
              <img src="${image.filename}" width="100" height="100">
              <input type="hidden" name="id" value="${image.id}">
              <input name="order_num" value="${image.order_num}" autocomplete="off">
              <button type="submit">设置次序</button>
              <a href="/delete?id=${image.id}">删除</a>
            </form>
          `).join('')}
        ${Array(totalPages).fill()
          .map((_, i) => i === page ? `<span>${i}</span>` : `<a href="?page=${i}">${i}</a>`)
          .join(' ')}
      `)
    })
  })
})

// 上传接口
app.post('/upload', upload.single('image'), (req, res) => {
  const { filename } = req.file
  db.run(`INSERT INTO images (filename, order_num) VALUES (?, (SELECT COALESCE(MAX(order_num), 0) + 1 FROM images))`, [filename], (err) => {
    if (err) {
      console.error(err.message)
      return res.status(500).send('错误！')
    }
    res.redirect('/')
  })
})

// 重排接口
app.get('/reorder', (req, res) => {
  const id = +req.query.id
  const order_num = +req.query.order_num
  db.run(`UPDATE images SET order_num = ? WHERE id = ?`, [order_num, id], (err) => {
    if (err) {
      console.error(err.message)
      return res.status(500).send('错误！')
    }
    res.redirect('/')
  })
})

// 删除接口
app.get('/delete', (req, res) => {
  const id = +req.query.id
  db.get(`DELETE FROM images WHERE id = ? RETURNING filename`, [id], (err, { filename }) => {
    if (err) {
      console.error(err.message)
      return res.status(500).send('错误！')
    }
    fs.unlink(path.join('uploads', filename), () => { })
    res.redirect('/')
  })
})

// 图片接口
app.use(express.static('uploads'))

const port = 40731
app.listen(port, () => {
  console.log(`服务器已启动：http://localhost:${port}/`)
})
