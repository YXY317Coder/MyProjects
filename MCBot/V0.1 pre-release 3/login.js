const mineflayer = require('mineflayer');
const Spark = require('./Spark.js');
const safeEval = require('safe-eval');
const fs = require('fs');
const path = require('path');
const settings = JSON.parse(fs.readFileSync(path.join(__dirname,'settings.json'),'utf-8'));

const spark = new Spark(
  settings.APPID,
  settings.APISecret,
  settings.APIKey,
  [{ role: "system", content: settings.text }]
);

const connecttype = settings.connecttype; //1
const logout = settings.logout; //false

const directoryPath = path.join(__dirname,'log');
if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true });
}
/*
// 方法1：写入空字符串 → 创建空文件
fs.writeFileSync(path.join(directoryPath, 'empty.txt'), '', 'utf8');

// 方法2：使用 fs.openSync + fs.closeSync（更底层，性能略优）
const fd = fs.openSync(path.join(directoryPath, 'empty2.txt'), 'w');
fs.closeSync(fd);

// 方法3：使用 fs.appendFileSync 追加空内容（适合追加场景）
fs.appendFileSync(path.join(directoryPath, 'empty3.txt'), '', 'utf8');
*/
const bot = mineflayer.createBot({
  host: settings.host, 
  port: settings.port, 
  username: settings.username, //用户名
  version: settings.version,
  auth: settings.auth,
  plugins: ['chat','time','sleep','findBlock']
});

let password = settings.password;
let loginAttempted = false;
let loginTimer = null;
const logDirectory = settings.logDirectory;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 登录成功处理
bot.on('login', () => {
  console.log('✅ 成功连接到服务器！');
  
  // 设置定时器，5秒后如果还没登录就尝试发送密码
  loginTimer = setTimeout(() => {
    if (!loginAttempted) {
      console.log('⏰ 连接后5秒未收到登录提示，主动发送登录命令...');
      bot.chat(password);
      loginAttempted = true;
    }
  }, 5000);
});

function connect(obj,message) {
  if (connecttype === 1){
    var st = "";
    for (var i = 0;i < obj.length;i++){
      st = st + obj[i].text;
    }
    return st;
  }
  return message;
}

function pure(text){
  bot.chat(text);
}

function getSafeFilename(mytype) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (mytype === 2){
    return `${year}-${month}-${day} talk.txt`;
  }
  return `${year}-${month}-${day} log.txt`;
}

// function autochat(thing,to){
//   let temp = "[bot admin] " + thing;
//   if (to == ""){
//     bot.chat(temp);
//   }
//   else{
//     bot.chat("/tell " + to + " " + temp);
//   }
// }

function logWithTimestamp(message,type) {
  const filename = getSafeFilename(type);
  const timestampMs = Date.now();
  const formattedTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    millisecond: '3-digit'
  });

  const logContent = `[${timestampMs}] [${Math.floor(timestampMs / 1000)}] ${formattedTime} | ${message}`;
  const filePath = path.join(logDirectory, filename);

  // ✅ 自动创建文件（无需判断是否存在）
  fs.appendFileSync(filePath, logContent + '\n', 'utf8');
  //console.log(`📌 已写入日志: ${filename}`);
}

/*
def ask(thing):
    spark_prompt = thing
    spark_answer = spark.ask(spark_prompt,spark_history)
    spark_history.append({"role": "user", "content": spark_prompt})
    spark_history.append({"role": "assistant", "content": spark_answer})
    while(spark_amount*2<len(spark_history)):
        spark_history.pop(0)
    return spark_answer

*/

function isStringInteger(str) {
  return /^(?:-?\d+|0)$/.test(str);
}

let spark_history = settings.history;
let max_history_pairs = settings.history_pairs;
let mode = settings.mode;
let playerlist = [];

async function justask(thing) {
  try {
      // 调用Spark API，传入当前问题和历史记录
      const spark_answer = await spark.ask(thing, []);
      return spark_answer;
  } catch (error) {
      console.error("对话失败:", error);
      return "抱歉，我遇到了问题，请稍后再试。";
  }
}

async function ask(thing,type) {
  try {
      // 调用Spark API，传入当前问题和历史记录
      const spark_answer = await spark.ask(thing, spark_history);
      if (type === 1){
        spark_history.push({ role: "user", content: thing });
        spark_history.push({ role: "assistant", content: spark_answer });
      
      // 限制历史记录长度，移除最旧的对话
        while (spark_history.length > max_history_pairs * 2) {
            spark_history.shift(); // 移除数组第一个元素（最旧的）
        }
      
      }
      return spark_answer;
      // 将本轮对话添加到历史记录
  } catch (error) {
      console.error("对话失败:", error);
      return "抱歉，我遇到了问题，请稍后再试。";
  }
}

async function DoAns(thing,type1,user,type2){
  if (thing.includes("[ ") && thing.includes(" ]")){
    thing = thing.split("]")[Number(type1)]; //加入了时间戳
  }
  console.log(thing);
  const responses = await ask(thing.replace("&tell", "").replace("&whisper", ""),1);
  if (type2 === 2){
    bot.chat("/tell " + user + " [bot self] " + responses);
  }
  else{
    bot.chat("[bot self] " + responses);
  }
}

// 在主程序中设置一个定时器
setInterval(() => {
  // 只有在夜晚且未处于睡觉状态时才尝试
  if (bot.time.isNight && !bot.isSleeping) {
    const bed = bot.findBlock({
      matching: block => block.name.includes('bed'),
      maxDistance: 8
    });
    
    if (bed) {
      bot.sleep(bed).catch(err => {
        console.log('睡觉失败:', err.message);
      });
      if (bot.isSleeping){
        bot.chat("*睡觉");
      }
    }
  }
}, 5000); // 每5秒检查一次

function readLogByDate(dateStr, logDir) {
  const files = fs.readdirSync(logDir);
  const targetFile = files.find(f => f.includes(dateStr));
  if (!targetFile) throw new Error(`未找到日期为 ${dateStr} 的日志文件`);
  
  return fs.readFileSync(`${logDir}\\${targetFile}`, 'utf8');
}

// 初始化内容为空
let lastContent = '';

// 监视文件变化
fs.watchFile(path.join(__dirname, 'do.txt'), (curr, prev) => {
    if (curr.mtime !== prev.mtime) { // 如果修改时间改变，则认为文件被修改
        fs.readFile(path.join(__dirname, 'do.txt'), 'utf8', (err, content) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            if (content !== lastContent) { // 如果内容确实改变了
                abc(content.split('\n')); // 调用函数处理新内容
                lastContent = content; // 更新最后已知内容
            }
        });
    }
});

function abc(content) {
  for (let i = 0;i < content.length;i++){
    bot.chat("[System] " + content[i]);
    sleep(1500);
  }
}

function isJsonString(str) {
  try {
      JSON.parse(str);
      return true;
  } catch (e) {
      return false;
  }
}

// 监听服务器消息（非玩家聊天）
bot.on('message', async (jsonMsg) => {
  const message = jsonMsg.toString();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  const nowtime = `[${year}-${month}-${day} ${hour}:${minute}:${second}]`
  if (loginAttempted){ //记录log
    const date = new Date();
    if ("unsigned" in JSON.parse(JSON.stringify(jsonMsg, null, 2))){
      logWithTimestamp(connect(JSON.parse(JSON.stringify(jsonMsg, null, 2),message).unsigned.json.with[0].extra),1);
      logWithTimestamp(connect(JSON.parse(JSON.stringify(jsonMsg, null, 2),message).unsigned.json.with[0].extra),2);
    }
    else{
      if (message.includes(" whispers ")){
        logWithTimestamp(message,2);
      }
      logWithTimestamp(message,1);
    }
  }
  if (loginAttempted && "unsigned" in JSON.parse(JSON.stringify(jsonMsg, null, 2))) {
    var optext = connect(JSON.parse(JSON.stringify(jsonMsg, null, 2)).unsigned.json.with[0].extra,message);
    console.log(nowtime,optext); //玩家消息
    if (optext.includes("&set history ")){ //以后用settings.txt替换
      if (optext.split("&set history ")[1].split(" ")[0] === 'clear'){
        spark_history = [];
        bot.chat("[bot记忆已清空]");
      }
      else if (isStringInteger(optext.split("&set history ")[1].split(" ")[0])){
        max_history_pairs = parseInt(optext.split("&set history ")[1].split(" ")[0],10);
        bot.chat("[bot记忆长度已更改为 " + max_history_pairs + "]");
      }
      else{
        bot.chat("[&set history 指令使用方法有问题]");
      }
    }
    else if (optext.includes("&set mode ")){
      if (optext.split("&set mode ")[1].split(" ")[0] === 'call'){
        mode = 1;
        bot.chat("[bot对话模式已设为：召唤（默认）]");
      }
      else if (optext.split("&set mode ")[1].split(" ")[0] === 'monitor'){
        mode = 2;
        bot.chat("[bot对话模式已设为：监听]");
      }
      else{
        bot.chat("[&set mode 指令使用方法有问题]");
      }
    } //setting.txt
    else if (optext.includes("&tp ")){
      bot.chat(`/tpa ${optext.split('&tp')[1].split(" ")[1]}`);
    }
    else if (optext.includes("&talk ")){
      if ((message.split("&talk ")[1] + " ").split(" ")[1] == ""){
        bot.chat("[bot admin " + message.split(" ")[0] + "] " + message.split("&talk ")[1].split(" ")[0]);
      }
      else{
        let temp = [];
        if (message.split("&talk ")[1].split(" ")[1] == "any"){
          temp = Array.from(Object.keys(bot.players)).sort();
        }
        else{
          temp = JSON.parse(message.split("&talk ")[1].split(" ")[1]);
        }
        for (let i = 0;i < temp.length;i++){
          if (temp[i] != 'TOS317'){
            bot.chat("/tell " + temp[i] + " [bot admin " + message.split(" ")[0] + "] " + message.split("&talk ")[1].split(" ")[0]);
          }
          await sleep(1050);
        }
      }
    }
    else if (optext.includes("&pure ")){
      pure(optext.split("&pure ")[1]);
    }
    else if (optext.includes("&eval ")){
      let inp = {};
      if (optext.split("&eval ")[1].includes("|") && isJsonString(optext.split("&eval ")[1].split("|")[0])){
        inp = JSON.parse(optext.split("&eval ")[1].split("|")[1]);
      }
      try{
        bot.chat("[bot self] " + safeEval(optext.split("&eval ")[1].split("|")[0],inp));
      }
      catch{
        bot.chat("[bot self] 表达式错误");
      }
    }
    // else if (optext == "&space"){
    //   bot.chat("\n \n");
    // }
    else if (mode === 1){
      if (optext.includes("&tell")){
        DoAns(nowtime + " " + optext,2,"",1);
      }
      else if (optext.includes("&whisper")){
        DoAns(nowtime + " " + optext,2,optext.match(/<(.*?)>/)[1],2);
      }
    }
    else if (mode === 2){
      if (optext.match(/<(.*?)>/)[1] != 'TOS317'){
        console.log(optext.match(/<(.*?)>/)[1]);
        let lastfile = readLogByDate(getSafeFilename(2), logDirectory).split("\n");
          // if (lastfile.length > 50){
          //   lastfile = lastfile.slice(-50);
          // }
          lastfile = "对话：“"/* + JSON.stringify(lastfile)*/ + optext + "”你是TOS317/bot，请***仅在当前对话***判断是否要进行“插嘴”，插入对话。如果要回复y；如果不合适（比如玩家找别人聊天，没找你：“yu，我的铁锭呢”）回复n"; //实际上只做了y的代码
          (async () => {
            try {
              let ans = await ask(lastfile,0);
              console.log("对话状态", ans);
              if ((ans + "。").split("。")[0] == 'y'){
                DoAns("回复玩家消息，现在不回答y或n：" + /*JSON.stringify(readLogByDate(getSafeFilename(2), logDirectory).split("\n"))*/ optext, 1, "",1);
              }
            } catch (error) {
              console.error("对话失败:", error);
            }
          })();
      }
    }
  }
  else{
    console.log(nowtime,message);
    if (mode === 1){
      if (message.includes(" whispers ")){
        if (message.includes("&tell")){
          DoAns(nowtime + " " + message,2,"",1);
        }
        else if (message.includes("&whisper")){
          DoAns(nowtime + " " + message,2,message.split(' ')[0],2);
        }
        else if (message.includes("&set ")){
          console.log(message.split(' ')[0]);
          if (message.includes("&set history ")){ //以后用settings.txt替换
            if (message.split("&set history ")[1].split(" ")[0] === 'clear'){
              spark_history = [];
              bot.chat(`/tell ${message.split(' ')[0]} [bot记忆已清空]`);
            }
            else if (isStringInteger(message.split("&set history ")[1].split(" ")[0])){
              max_history_pairs = parseInt(optext.split("&set history ")[1].split(" ")[0],10);
              bot.chat(`/tell ${message.split(' ')[0]} [bot记忆长度已更改为 " + max_history_pairs + "]`);
            }
            else{
              bot.chat(`/tell ${message.split(' ')[0]} [&set history 指令使用方法有问题]`);
            }
          }
        }
        else if (message.includes("&set mode ")){
          if (message.split("&set mode ")[1].split(" ")[0] === 'call'){
            mode = 1;
            bot.chat(`/tell ${message.split(' ')[0]} [bot对话模式已设为：召唤（默认）]`);
          }
          else if (message.split("&set mode ")[1].split(" ")[0] === 'monitor'){
            mode = 2;
            bot.chat(`/tell ${message.split(' ')[0]} [bot对话模式已设为：监听]`);
          }
          else{
            bot.chat(`/tell ${message.split(' ')[0]} [&set mode 指令使用方法有问题]`);
          }
        } //setting.txt
        else if (message.includes("&talk ")){
          if ((message.split("&talk ")[1] + " ").split(" ")[1] == ""){
            bot.chat("[bot admin " + message.split(" ")[0] + "] " + message.split("&talk ")[1].split(" ")[0]);
          }
          else{
            let temp = [];
            if (message.split("&talk ")[1].split(" ")[1] == "any"){
              temp = Array.from(Object.keys(bot.players)).sort();
            }
            else{
              temp = JSON.parse(message.split("&talk ")[1].split(" ")[1]);
            }
            for (let i = 0;i < temp.length;i++){
              if (temp[i] != 'TOS317'){
                bot.chat("/tell " + temp[i] + " [bot admin " + message.split(" ")[0] + "] " + message.split("&talk ")[1].split(" ")[0]);
              }
              // await sleep(1000);
            }
          }
        }
        else if (message.includes("&tp ")){
          bot.chat(`/tpa ${message.split('&tp')[1].split(" ")[1]}`);
        }
        else if (message.includes("&pure ")){
          pure(message.split("&pure ")[1]);
        }
        else if (message.includes("&eval ")){
          let inp = {};
          if (message.split("&eval ")[1].includes("|") && isJsonString(message.split("&eval ")[1].split("|")[0])){
            inp = JSON.parse(message.split("&eval ")[1].split("|")[1]);
          }
          try{
            bot.chat("/tell " + message.split(' ')[0] + " [bot self]" + safeEval(message.split("&eval ")[1].split("|")[0],inp));
          }
          catch{
            bot.chat("/tell" + message.split(' ')[0] + " [bot self]表达式错误");
          }
        }
        // else if (message == "&space"){
        //   bot.chat(" ");
        // }
      }
    }
    else if (mode === 2){
      if (message.includes(" whispers ")){
        if (message.split(' ')[0] != 'TOS317'){
          let lastfile = readLogByDate(getSafeFilename(2), logDirectory).split("\n");
          // if (lastfile.length > 50){
          //   lastfile = lastfile.slice(-50);
          // }
          lastfile = "对话：“"/* + JSON.stringify(lastfile)*/ + message + "”你是TOS317/Bot，请***仅在当前对话***判断是否要进行“插嘴”，插入对话。如果要回复y；如果不合适（比如玩家找别人聊天，没找你：“yu，我的铁锭呢”）回复n"; //实际上只做了y的代码
          (async () => {
            try {
              let ans = await ask(lastfile,0);
              console.log("对话状态", ans);
              if ((ans + "。").split("。")[0] == 'y'){
                setTimeout(DoAns("回复玩家消息，现在不回答y或n：" + /*JSON.stringify(readLogByDate(getSafeFilename(2), logDirectory).split("\n"))*/ message, 1, "",1), /*150*/0); //0.15s延时
              }
            } catch (error) {
              console.error("对话失败:", error);
            }
          })();
        }
      }
    }
  }
  // 检查服务器消息中的登录提示
  const serverLoginPrompts = [
    '请登录',
    '需要登录',
    'please login',
    '/login'
  ];
  
  const lowerMessage = message.toLowerCase();
  if (serverLoginPrompts.some(prompt => lowerMessage.includes(prompt.toLowerCase()))) {
    console.log(`🔔 服务器消息包含登录提示: "${message}"`);
    
    if (!loginAttempted) {
      console.log('📤 根据服务器消息发送登录密码...');
      bot.chat(password);
      console.log(bot.players);
      playerlist = Array.from(Object.keys(bot.players)).sort();
      loginAttempted = true;
      console.log(playerlist);
      if (loginTimer) {
        clearTimeout(loginTimer);
        loginTimer = null;
      }
    }
  }
});

// 处理被踢出情况
bot.on('kicked', (reason) => {
  console.log(`🚫 被服务器踢出: ${JSON.stringify(reason)}`);
  
  // // 如果是未登录被踢，可以尝试重新连接
  // if (JSON.stringify(reason).includes('login') || JSON.stringify(reason).includes('登录') || JSON.stringify(reason).includes('未登录')) {
  //   console.log('🔄 检测到因未登录被踢出，5秒后重新连接...');
  //   setTimeout(() => {
  //     console.log('🔄 尝试重新连接...');
  //     // 这里可以添加重新连接逻辑
  //   }, 5000);
  // }

  sleep(1500);
  process.exit(1);
  //enter some code
});

bot.on('playerJoined', (player) => {
  if (loginAttempted && player.username != 'TOS317'){
    if (JSON.stringify(Array.from(Object.keys(bot.players)).sort()) !== JSON.stringify(playerlist)){
      playerlist = Array.from(Object.keys(bot.players)).sort();
      //console.log(player.username + " joined",playerlist);
      console.log(playerlist);
      bot.chat("/tell Team1387_317 " + player.username + " joined");
      if (logout){
        bot.chat("[" + player.username + " joined]");
      }
      logWithTimestamp("[" + player.username + " joined]",1);
    }
  }
});

// 连接断开处理
bot.on('end', (reason) => {
  console.log(`🔌 与服务器断开连接: ${reason}`);
  
  // 清除定时器
  if (loginTimer) {
    clearTimeout(loginTimer);
    loginTimer = null;
  }
  
  loginAttempted = false;
});

// 错误处理
bot.on('error', (err) => {
  console.error('❌ 连接错误:', err.message);
});

// 添加心跳检测
setInterval(() => {
  if (bot.player) {
    console.log('💓 连接正常，位置:', bot.player.entity.position);
  }
}, 30000); // 每30秒输出一次状态
 