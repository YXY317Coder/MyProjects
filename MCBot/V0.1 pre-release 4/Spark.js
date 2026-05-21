const crypto = require('crypto');
const WebSocket = require('ws');
const axios = require('axios');
const { URL, URLSearchParams } = require('url');
const fs = require('fs');
// const sharp = require('sharp'); // 替代PIL的图像处理库

class Spark {
    /**
     * 构造函数
     * @param {string} appid - 应用ID
     * @param {string} api_secret - API密钥
     * @param {string} api_key - API Key
     * @param {Array} Personality - 人格设定/系统提示词
     */
    constructor(appid, api_secret, api_key, Personality) {
        this.appid = appid;
        this.api_secret = api_secret;
        this.api_key = api_key;
        this.gpt_url = "wss://spark-api.xf-yun.com/v1/chat";
        this.tti_url = "https://spark-api.cn-huabei-1.xf-yun.com/v1/tti";
        this.domain = "lite";
        this.Personality = Personality;
        this.msgs = "";
        this.history = "";
        this.flag = true;
        this.ws = null;
    }

    /**
     * 生成WebSocket连接所需的鉴权参数
     * @param {string} host - 主机名
     * @param {string} path - 路径
     * @returns {Object} 鉴权参数对象
     */
    _generateAuthParams(host, path) {
        const now = new Date();
        const date = now.toUTCString();
        
        // 生成签名
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
        const signatureSha = crypto.createHmac('sha256', this.api_secret)
            .update(signatureOrigin)
            .digest();
        const signatureShaBase64 = signatureSha.toString('base64');
        
        // 生成Authorization
        const authorizationOrigin = `api_key="${this.api_key}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureShaBase64}"`;
        const authorization = Buffer.from(authorizationOrigin).toString('base64');
        
        return {
            authorization: authorization,
            date: date,
            host: host
        };
    }

    /**
     * 生成请求参数
     * @param {string} query - 用户查询
     * @returns {Object} 请求参数
     */
    _genParams(query) {
        const text = [
            ...this.Personality,
            ...this.history,
            { role: "user", content: query }
        ];
        
        return {
            header: {
                app_id: this.appid,
                uid: "1234"
            },
            parameter: {
                chat: {
                    domain: this.domain,
                    temperature: 0.5,
                    max_tokens: 4096,
                    auditing: "default"
                }
            },
            payload: {
                message: {
                    text: text
                }
            }
        };
    }

    /**
     * 文本对话方法
     * @param {string} prompt - 用户输入
     * @param {Array} history - 历史对话记录
     * @returns {Promise<string>} AI回复内容
     */
    async ask(prompt, history) {
        //console.log(prompt,history);
        return new Promise((resolve, reject) => {
            this.flag = true;
            this.msgs = "";
            this.history = history;
            
            try {
                const urlObj = new URL(this.gpt_url);
                const host = urlObj.host;
                const path = urlObj.pathname;
                
                // 生成鉴权参数
                const authParams = this._generateAuthParams(host, path);
                const queryParams = new URLSearchParams(authParams).toString();
                const wsUrl = `${this.gpt_url}?${queryParams}`;
                
                // 创建WebSocket连接
                this.ws = new WebSocket(wsUrl, {
                    rejectUnauthorized: false // 类似Python的ssl.CERT_NONE
                });
                
                this.ws.on('open', () => {
                    const data = JSON.stringify(this._genParams(prompt));
                    this.ws.send(data);
                });
                
                this.ws.on('message', (message) => {
                    const data = JSON.parse(message);
                    const code = data.header.code;
                    
                    if (code !== 0) {
                        this.ws.close();
                        reject(new Error(`请求错误: ${code}, ${JSON.stringify(data)}`));
                    } else {
                        const choices = data.payload.choices;
                        const status = choices.status;
                        const content = String(choices.text[0].content);
                        if (content != 'undefined'){
                            this.msgs += content;
                        }
                        
                        if (status === 2) {
                            this.flag = false;
                            this.ws.close();
                            resolve(this.msgs);
                        }
                    }
                });
                
                this.ws.on('error', (error) => {
                    reject(error);
                });
                
                this.ws.on('close', () => {
                    // 连接关闭处理
                });
                
                // 设置超时
                setTimeout(() => {
                    if (this.flag) {
                        this.ws.close();
                        reject(new Error('请求超时'));
                    }
                }, 30000);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // /**
    //  * 文生图方法 (Text-to-Image)
    //  * @param {string} prompt - 图像描述
    //  * @returns {Promise<void>}
    //  */
    // async tti(prompt) {
    //     try {
    //         const urlObj = new URL(this.tti_url);
    //         const host = urlObj.host;
    //         const path = urlObj.pathname;
            
    //         const now = new Date();
    //         const date = now.toUTCString();
            
    //         // 生成签名
    //         const signatureOrigin = `host: ${host}\ndate: ${date}\nPOST ${path} HTTP/1.1`;
    //         const signatureSha = crypto.createHmac('sha256', this.api_secret)
    //             .update(signatureOrigin)
    //             .digest();
    //         const signatureShaBase64 = signatureSha.toString('base64');
            
    //         // 生成Authorization
    //         const authorizationOrigin = `api_key="${this.api_key}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureShaBase64}"`;
    //         const authorization = Buffer.from(authorizationOrigin).toString('base64');
            
    //         const params = new URLSearchParams({
    //             host: host,
    //             date: date,
    //             authorization: authorization
    //         }).toString();
            
    //         const url = `${this.tti_url}?${params}`;
            
    //         const body = {
    //             header: {
    //                 app_id: this.appid,
    //                 uid: "123456789"
    //             },
    //             parameter: {
    //                 chat: {
    //                     domain: "lite",
    //                     width: 640,
    //                     height: 480
    //                 }
    //             },
    //             payload: {
    //                 message: {
    //                     text: [{
    //                         role: "user",
    //                         content: prompt
    //                     }]
    //                 }
    //             }
    //         };
            
    //         const response = await axios.post(url, body, {
    //             headers: {
    //                 'content-type': 'application/json'
    //             }
    //         });
            
    //         const data = response.data;
    //         const code = data.header.code;
            
    //         if (code !== 0) {
    //             console.error(`请求错误: ${code}, ${JSON.stringify(data)}`);
    //             throw new Error(`文生图请求失败: ${code}`);
    //         } else {
    //             const text = data.payload.choices.text;
    //             const imageContent = text;
    //             const imageBase = imageContent.content;
                
    //             // 解码Base64图片数据
    //             const imgBuffer = Buffer.from(imageBase, 'base64');
                
    //             // 保存原始图片
    //             await fs.promises.writeFile('1.jpg', imgBuffer);
                
    //             // 使用sharp处理图片（旋转90度并调整尺寸）
    //             await sharp('1.jpg')
    //                 .rotate(90, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    //                 .resize(240, 320)
    //                 .toFile('1.png');
                
    //             console.log('图片生成和处理完成');
    //         }
            
    //     } catch (error) {
    //         console.error('文生图处理失败:', error);
    //         throw error;
    //     }
    // }
}

// 导出模块
module.exports = Spark;