const mineflayer = require('mineflayer')
const Spark = require('./Spark.js')
const spark = new Spark
  'YourAPPID'
  'YourAPISecret'
  'YourAPIKey'
  [{ role: "system", content: "你是一个minecraft服务器里的ai，不能进行任何实质性操作（只能对话），你可以回答玩家的问题。玩家没提到的你不需要回答。字数尽量控制在20字以内" }
)
const bot = mineflayer.createBot(
  host: 'may.mc6.cn'
  port: 35294
  username: 'TOS317'
  version: '1.21.11'
  auth: 'offline'
  plugins: ['chat'
})
let password = '/login YXY94270303'
let loginAttempted = false
let loginTimer = null

bot.on('login', () => 
  console.log('✅ 成功连接到服务器！')
  
  loginTimer = setTimeout(() => 
    if (!loginAttempted) 
      console.log('⏰ 连接后5秒未收到登录提示，主动发送登录命令...')
      bot.chat(password)
      loginAttempted = true
    
  }, 5000)
})
function connect(obj) 
  var st = ""
  for (var i = 0;i < obj.length;i++)
    st = st + obj[i].text
  
  return st

async function DoAns(thing)
  let index = thing.indexOf(']'); 
  if (index !== -1) 
    thing = thing.slice(index + 1); 
  
  const responses = await spark.ask(thing.replace(/&tell/g, ""), [])
  bot.chat(responses)


bot.on('message', (jsonMsg) => 
  const message = jsonMsg.toString()
  if (loginAttempted && "unsigned" in JSON.parse(JSON.stringify(jsonMsg, null, 2))) 
    var optext = connect(JSON.parse(JSON.stringify(jsonMsg, null, 2)).unsigned.json.with[0].extra)
    console.log(optext); 
    if (optext.includes("&tell"))
      DoAns(optext)
    
  
  
  const serverLoginPrompts = 
    '请登录'
    '需要登录'
    'please login'
    '/login
  ]
  const lowerMessage = message.toLowerCase()
  if (serverLoginPrompts.some(prompt => lowerMessage.includes(prompt.toLowerCase()))) 
    console.log(`🔔 服务器消息包含登录提示: "${message}"`)
    if (!loginAttempted) 
      console.log('📤 根据服务器消息发送登录密码...')
      bot.chat(password)
      loginAttempted = true
      if (loginTimer) 
        clearTimeout(loginTimer)
        loginTimer = null
      
    
  
})

bot.on('kicked', (reason) => 
  console.log(`🚫 被服务器踢出: ${reason}`)
  
  if (reason.includes('login') || reason.includes('登录') || reason.includes('未登录')) 
    console.log('🔄 检测到因未登录被踢出，5秒后重新连接...')
    setTimeout(() => 
      console.log('🔄 尝试重新连接...')
      
    }, 5000)
  
})

bot.on('end', (reason) => 
  console.log(`🔌 与服务器断开连接: ${reason}`)
  
  if (loginTimer) 
    clearTimeout(loginTimer)
    loginTimer = null
  
  loginAttempted = false
})

bot.on('error', (err) => 
  console.error('❌ 连接错误:', err.message)
})

setInterval(() => 
  if (bot.player) 
    console.log('💓 连接正常，位置:', bot.player.entity.position)
  
}, 30000); 
