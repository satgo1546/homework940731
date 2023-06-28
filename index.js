const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const uuid = require('uuid')
const cors = require('cors')

const app = express()
app.use(cors())
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
    order_num REAL,
    visible BOOL
  );
`)

// 首页
app.get('/', (req, res) => {
  db.all(`SELECT * FROM images ORDER BY order_num ASC`, (err, rows) => {
    if (err) {
      console.error(err.message)
      return res.status(500).send('错误！')
    }

    res.send(`<!DOCTYPE html>
      <meta charset="utf-8">
      <title>画廊</title>
      <form method="post" action="/upload" enctype="multipart/form-data">
        <input type="file" name="image" required>
        <button type="submit">上传</button>
        <a href="/list?start=0&count=10">前10条记录</a>
      </form>
      <table border="2">
      ${rows.map(image => `
        <tr>
          <td>
            <img src="${image.filename}" width="100" height="100">
          </td>
          <td>
            <form method="get" action="/update">
              <input type="hidden" name="id" value="${image.id}">
              <input type="radio" name="visible" value="true" ${image.visible ? 'checked' : ''}>
              可见
              <input type="radio" name="visible" value="false" ${image.visible ? '' : 'checked'}>
              不可见
              次序 =
              <input name="order_num" value="${image.order_num}" autocomplete="off">
              <button type="submit">设置</button>
              <a href="/delete?id=${image.id}">删除</a>
            </form>
          </td>
        </tr>
      `).join('')}
      </table>
    `)
  })
})

// 列表接口
app.get('/list', (req, res) => {
  let start = parseInt(req.query.start)
  if (!(start >= 0 && Number.isFinite(start))) start = 0
  let count = parseInt(req.query.count)
  if (!(count >= 0 && Number.isFinite(count))) count = 1

  db.all(`SELECT * FROM images ORDER BY order_num ASC LIMIT ?, ?`, [start, count], (err, rows) => {
    if (err) {
      console.error(err.message)
      return res.status(500).send('错误！')
    }

    db.get(`SELECT COUNT(*) AS total FROM images`, (err, { total }) => {
      if (err) {
        console.error(err.message)
        return res.status(500).send('错误！')
      }

      res.contentType('application/json').send(JSON.stringify({rows,total}))
    })
  })
})

// 上传接口
app.post('/upload', upload.single('image'), (req, res) => {
  const { filename } = req.file
  db.run(`
    INSERT INTO images (filename, visible, order_num)
    VALUES (?, FALSE, (SELECT COALESCE(MAX(order_num), 0) + 1 FROM images))
  `, [filename], (err) => {
    if (err) {
      console.error(err.message)
      return res.status(500).send('错误！')
    }
    res.redirect('/')
  })
})

// 更新接口
app.get('/update', (req, res) => {
  const id = +req.query.id
  let order_num = +req.query.order_num
  if (!Number.isFinite(order_num)) order_num = null
  const visible = req.query.hasOwnProperty('visible') ? !/^0*$|^f/i.test(req.query.visible) : null
  db.run(`
    UPDATE images SET
    order_num = COALESCE(?, order_num),
    visible = COALESCE(?, visible)
    WHERE id = ?
  `, [order_num, visible, id], (err) => {
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
