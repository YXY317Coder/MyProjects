Example Plugin: easyNPC

In a MCBot Plugin, you need at least 2 files:

 - `settings.json`
 - `YourPluginName.js`

`plugin/YourPluginName/YourPluginName.js`: 

1. `const mineflayer = require('mineflayer');`
2. make a function named func as a trigger
```javascript
function func(name,settings,bot,...args){
    if (name === 'xxx'){
        ...
    }
    else if (name === 'xxx'){
        ...
    }
    ...
}
```
3. `module.exports = func;`
4. Code

---

`settings.json`: 

```json
{
    "func": [
        "xxx", ...
    ],
    "script": [
        "trigger", ...
    ]
}
```
`xxx`: When the trigger is activated, `func("xxx",settings,bot,...);

`trigger`:
```markdown
spawn()
error(err)
end(reason)
kicked(reason)
blockUpdate(oldBlock,newBlock)
playerJoined(player)
playerLeft(player)
playerUpdated(player)
message(jsonMsg)

special triggers(only use in LuoYinXiangFang):
login()
strictplayerJoined(player)
playerMessage(message)
playerWhisper(message)
```
