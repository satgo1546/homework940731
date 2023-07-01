# 又一个图片管理系统

![截图](screenshot.webp)

仓库名中的数字是在random.org上随机生成的，并没有特别的含义。

## 运行的方法

```sh
npm install
node index.js &
npm run dev
```

然后打开http://localhost:8010/。

最初数据库中没有图片，因此首先需要上传几张图片。

## 接口服务器

- 框架：Express.js
- 数据库：SQLite
- 文件存储：fs

提供下列接口。

- `GET /list?start=0&count=0` 返回`{"rows": [], "total": 0}`
- `POST /upload` 接收单一参数image，为图片文件
- `GET /update?id=1&order_num=6.28&visible=false`
- `GET /delete?id=1`
- `GET /00000000-0000-0000-0000-000000000000.jpg`

## 管理页面

- 框架：Element UI

## 浏览页面

- 基于CSS grid布局和ResizeObserver监听尺寸变化实现瀑布流
