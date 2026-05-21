const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');
const settings = JSON.parse(fs.readFileSync(path.join(__dirname,'NPC.json'),'utf-8'));
let entitylist = [];
let checkpointlist = [];
let checkbuttonlist = [];
const lastButtonStates = {};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/*
const buttonPositions = [
    { x: -23837, y: 150, z: 1027, name: '1' },
    { x: -23835, y: 150, z: 1027, name: '2' }
];

const lastButtonStates = {};

function func(name,settings,bot,...args){
    if (name === 'start'){
        start(bot);
    }
    else if (name === 'act'){
        // console.log("act",args[0],args[0].split("> "));
        act(bot,args[0],true);
    }
    else if (name === 'change'){
        change(bot,args[0],args[1]);
    }
}

function start(bot){
    console.log('Bot spawned. Initializing button listeners...');
    buttonPositions.forEach(pos => {
        const key = `${pos.x},${pos.y},${pos.z}`;
        const block = bot.blockAt({ x: pos.x, y: pos.y, z: pos.z });
        if (block) {
            lastButtonStates[key] = block.state?.powered || false;
        } else {
            lastButtonStates[key] = false;
        }
    });
}

async function act(bot,thing,type){
    if (type){
        if (thing.split("> ")[1] == 'hi' && thing.match(/<(.*?)>/)[1] != bot.username){
            bot.chat('hi');
            await sleep(1050);
            bot.chat('press button to continue');
        }
    }
    else{
        if (thing == 'button_1'){
            bot.chat('button_1 pressed');
        }
        else if (thing == 'button_2'){
            bot.chat('button_2 pressed');
        }
    }
}

function buttonpressed(bot,name){
    if (name == "1"){
        act(bot,"button_1",false);
    }
    else if (name == "2"){
        act(bot,"button_2",false);
    }
}

function change(bot,oldBlock,newBlock){
    if (!newBlock) return;
    const posKey = `${newBlock.position.x},${newBlock.position.y},${newBlock.position.z}`;
    const targetButton = buttonPositions.find(p => 
        p.x === newBlock.position.x && 
        p.y === newBlock.position.y && 
        p.z === newBlock.position.z
    );
    if (targetButton) {
        // console.log(newBlock);
        const isPowered = newBlock._properties?.powered === true;
        const wasPowered = lastButtonStates[posKey] === true;
        if (isPowered && !wasPowered) {
            // console.log(`Detected button press at ${targetButton.name}`);
            buttonpressed(bot,targetButton.name);
        }
        lastButtonStates[posKey] = isPowered;
    }
}
*/
class entity{
    /**
     * 初始化
     * @param {int} id 在settings中的下标
     */
    constructor(id) {
        this.bot = mineflayer.createBot({
            host: settings[id].basic.host, 
            port: settings[id].basic.port, 
            username: settings[id].basic.username,
            version: settings[id].basic.version,
            auth: settings[id].basic.auth,
            plugins: ['chat','time','sleep','findBlock']
        });
        this.id = id;
        this.login = false;
        this.channel = 0;
        this.bot.on("blockUpdate",async (oldBlock,newBlock) => {
            func("change",settings,this.bot,oldBlock,newBlock);
        });
    }
    /**
     * 初始化（登录bot，耗时2.1秒）
     */
    async start(){
        // 移除立即的 chat 调用，改为监听 spawn 事件
        return new Promise((resolve, reject) => {
            this.bot.once('spawn', () => {
                // 确保机器人完全生成后再发送聊天信息
                setTimeout(() => {
                    this.bot.chat(settings[this.id].basic.password);
                    setTimeout(() => {
                        this.login = true;
                        resolve(); // 标记启动完成
                    }, 1050);
                }, 500); // 可选的短延迟，确保稳定性
            });
    
            // 可选：添加登录失败或错误的处理
            this.bot.on('error', (err) => {
                console.error(`Bot ${settings[this.id].basic.username} error:`, err);
                reject(err);
            });
        });
    }
    async act(cham){
        try{
            console.log(cham);
            this.channel = cham;
            if (cham === 0){
                return;
            }
            for (let j = 0;j < checkpointlist[cham].next.length;j++){
                entitylist[checkpointlist[cham].from].bot.chat((checkpointlist[cham].next[j] + "||").split("||")[Math.floor(Math.random() * ((checkpointlist[cham].next[j] + "||").split("||").length - 1))]);
                await sleep(1050);
            }
        }
        catch{
            await sleep(525);
            console.log("NPC.json 配置可能有问题，需调试");
            this.bot.chat("NPC.json 配置可能有问题，需调试");
            await sleep(525);
        }
    }
}

/**
 * 配置并登陆所有NPC
 */
async function start(bot){
    for (let i = 0;i < settings.length;i++){
        entitylist.push(new entity(i));
        for (let j = 0;j < settings[i].act.length;j++){
            let temparr = settings[i].act[j];
            temparr.from = i,temparr.locate = j;
            checkpointlist.push(temparr);
        }
        for (let j = 0;j < settings[i].button.length;j++){
            let temparr = settings[i].button[j];
            temparr.from = i,temparr.locate = j;
            checkbuttonlist.push(temparr);
        }
        await entitylist[i].start();
        console.log(settings[i].basic.username," is ready");
    }
    console.log('Bot spawned. Initializing button listeners...');
    for (let i = 0;i < checkbuttonlist.length;i++){
        const pos = checkbuttonlist[i];
        const key = `${pos.x},${pos.y},${pos.z}`;
        const block = bot.blockAt(pos.x,pos.y,pos.z);
        if (block) {
            lastButtonStates[key] = block.state?.powered || false;
        } else {
            lastButtonStates[key] = false;
        }
    }
}

/**
 * 触发器
 * @param {string} name start / act / change
 * @param {JSON} settings
 * @param {import('mineflayer').Bot} bot
 */
async function func(name,settings,bot,...args){
    if (name === 'start'){
        start(bot);
    }
    else if (name === 'act'){
        if (args[0].includes("> ")){
            for (let i = 0;i < checkpointlist.length;i++){
                if (checkpointlist[i].type == "talk" && checkpointlist[i].message.includes(args[0].split("> ")[1].toLowerCase())){
                    // for (let j = 0;j < checkpointlist[i].next.length;j++){
                    //     entitylist[checkpointlist[i].from].bot.chat(checkpointlist[i].next[j]);
                    //     await sleep(1050);
                    // }
                    entitylist[checkpointlist[i].from].act(checkpointlist[i].locate);
                }
            }
        }
    }
    else if (name === 'change'){
        let newBlock = args[1];
        if (!newBlock) return;
        const posKey = `${newBlock.position.x},${newBlock.position.y},${newBlock.position.z}`;
        let targetButton = {};
        for (let i = 0;i < checkbuttonlist.length;i++){
            // console.log(checkbuttonlist[i].z,newBlock.position.z);
            if (checkbuttonlist[i].x === newBlock.position.x && checkbuttonlist[i].y === newBlock.position.y && checkbuttonlist[i].z === newBlock.position.z){
                // console.log(checkbuttonlist[i]);
                targetButton = checkbuttonlist[i];
                const isPowered = newBlock._properties?.powered === true;
                const wasPowered = lastButtonStates[posKey] === true;
                if (isPowered && !wasPowered) {
                    console.log(`Detected button press at ${targetButton.id}`);
                    buttonpressed(targetButton.id,targetButton.from);
                }
                lastButtonStates[posKey] = isPowered;
            }
        }
    }
}

function buttonpressed(buttonid,buttonfrom){
    for (let i = 0;i < checkpointlist.length;i++){
        console.log(checkpointlist[i],buttonid,buttonfrom);
        if (checkpointlist[i].type === "button" && checkpointlist[i].from === buttonfrom && checkpointlist[i].message.includes(buttonid)){
            entitylist[buttonfrom].act(checkpointlist[i].next[entitylist[buttonfrom].channel]);
        }
    }
}

module.exports = func;