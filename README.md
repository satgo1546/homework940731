# 又一个图片管理系统

仓库名中的数字是在random.org上随机生成的，并没有特别的含义。

## 运行的方法

```sh
npm install
node index.js &
npm run dev
```

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
