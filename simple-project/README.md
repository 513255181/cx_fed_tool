#webpack-project

> pug(new name of jade), sass and webpack

## Usage

- 页面命名规则  `*.page.pug`

- 模块命名规则  `*.pug`

## Build & Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8880
cd 项目路径
node dev-server.js

# build for production with minification
cd 项目路径
node build.js
```

## Announcements

- 为了使得jade中的src引用的图片能够被webpack加载解析，需按如下格式书写

```html
div
    img(src=require("./my/image.png"))
```

- 为了使sass中通过url引入的图片被webpack加载解析，需按如下格式书写

```css
background: url(../img/count_down.png) //相对路径
```

