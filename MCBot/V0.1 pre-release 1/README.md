# ChatBot in 落英乡坊（原H.O.P.E.）mc服务器

## 版本号：V0.1 pre-release 1

## 作者：YXY317Coder

## 很抱歉 V0.1 pre-release 1 的代码被我弄丢了
## We are sorry that the code for V0.1 pre-release 1 has been lost by us

*2026/4/18 12:15*

---

## 效果

 - 可以在服务器聊天栏中发送含 `&tell` 的文本来与bot进行聊天
 - 离线账号
 - 可自定义提示词（prompt）
 - 自定义玩家名称
 - 效果 ![alt text](image.png)

## 部署

 1. 下载 Node.js
 
 2. 在命令行（Win+R输入cmd）中输入
 ```bash
 npm install mineflayer
 npm install ws axios sharp
 ```
 （可能还需要npm其它库，但我忘记了）
 3. 前往 [讯飞平台](https://www.xfyun.cn/) 进行注册并[领取免费spark lite的api](https://blog.csdn.net/weixin_51390582/article/details/139815226)（其它ai的也可以）
 
 4. 获取到`APPID`，`APISecret`，`APIKey`后将其填入`login.js`的第4，5，6行
 
 5. 更改`login.js`第15行（用户名），第21行的内容（密码）（第8行的提示词可改可不改）
 
 6. 如需使用，可使用Node.js运行`login.js`。等控制台显示登录成功就可以在服务器聊天栏中发送含 `&tell` 的文本来与bot进行聊天啦

## 注意

 1. 不要频繁使用ai
 2. 由于是预发布版，可能bug较多，有bug可反馈（如无反馈通道可以向`YXY317Coder@qq.com`反馈）
 3. 原谅317写的代码有点石
 4. 部分使用ai生成（bush
 5. 你需要mc的离线账号（这个容易搞）
 6. 这个代码仅适用于落英乡坊服务器！！！如果你想加入服务器（服务器开了白名单，没加入白名单的账号不可进入服务器），可加入QQ群`729416878`或`377505417`，服务器[mc百科](https://mcmod.cn)页面为[落英乡坊服务器](https://play.mcmod.cn/sv20188594.html)

---

# ChatBot in Luoyingxiangfang (formerly H.O.P.E.) mc server
## Version: V0.1 pre-release
## Author: YXY317Coder

---

## Effect
 - You can send text containing `&tell` in the server chat bar to chat with the bot.
 - Offline account
 - Customizable prompt
 - Customizable player name.
 - [alt text](image.png)

## Deployment
 1. Download Node.js.
 2. Enter the commands `npm install mineflayer` and `npm install ws axios sharp` in the command line (Win+R to open the command prompt). (Note: Other npm libraries may also be required, but I have forgotten which ones.)
 3. Go to [iFlytek Platform](https://www.xfyun.cn/) to register and [obtain a free Spark Lite API key](https://blog.csdn.net/weixin_51390582/article/details/139815226) (or any other AI platform's API key).
 4. Obtain the `APPID`, `APISecret`, and `APIKey` and fill them in lines 4, 5, and 6 of `login.js`.
 5. Change the content of line 15 (username) and line 21 (password) in `login.js` (the prompt word in line 8 can be changed or left unchanged). 6. To use, run `login.js` using Node.js. Once the console displays successful login, you can send text containing `&tell` in the server chat to chat with the bot

## Tips
 1. Don't use AI frequently.
 2. As it is a pre-release version, there may be many bugs.If you encounter any, please provide feedback (if there is no feedback channel, you can send it to `YXY317Coder@qq.com`).
 3. Sorry for the code is a bit strange and it's all Chinese.
 4. Some parts are generated using AI (nah
 5. You need an offline account for Minecraft (this is easy to obtain)
 6. This code is only applicable to the Luoyingxiangfang server!!! If you want to join the server (the server has a whitelist, and accounts that have not been added to the whitelist cannot enter the server), you can join the QQ groups `729416878` or `377505417`. The server [mc Wiki](https://mcmod.cn) page is [Luoyingxiangfang Server](https://play.mcmod.cn/sv20188594.html)
