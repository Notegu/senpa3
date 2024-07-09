const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { Client, GatewayIntentBits } = require('discord.js');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const Lock = require('async-lock');
const lock = new Lock();
let processingMessage = false;
let messageQueue = []; // قائمة لتخزين الرسائل المعلقة

const TOKEN = 'MTI0NTU5MTEyNzkzMTc0ODM5NQ.GhI4zL.o9NPkropn3K4ZTbLli5b4Sn6ieIfsEunU_Mp04';
const CHANNEL_ID = '1259937389082710106';
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let driver;

client.login(TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

(async function main() {
    try {
        let options = new chrome.Options();
        const extensionPath = path.resolve(__dirname, 'Buster.crx');
        const extensionBase64 = fs.readFileSync(extensionPath, { encoding: 'base64' });
        options.addExtensions(Buffer.from(extensionBase64, 'base64'));

        options.addArguments(
            'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            '--window-size=1920,1080',
            '--start-maximized',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars'
        );
        options.excludeSwitches(["enable-automation"]);

        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

        let url = 'https://senpa.io/web/';
        console.log(`Opening ${url}`);
        await driver.get(url);

        await driver.sleep(12000);

        await driver.wait(until.elementLocated(By.id('captcha-overlay')), 3000);
        await driver.findElement(By.id('captcha-overlay')).click();

        try {
            console.log("Switching to the reCAPTCHA iframe...");
            const iframe = await driver.findElement(By.xpath('//iframe[@title="recaptcha challenge expires in two minutes"]'));
            await driver.switchTo().frame(iframe);
            console.log("Switched to the reCAPTCHA iframe successfully.");

            await driver.sleep(12000);
            console.log("Finding the button inside the reCAPTCHA iframe...");
            const button = await driver.findElement(By.css('div.button-holder.help-button-holder'));
            await button.click();
            console.log("Clicked on the button inside the reCAPTCHA iframe successfully.");
        } catch (error) {
            console.log("No button found inside the reCAPTCHA iframe.");
        } finally {
            console.log("Switching back to the default content...");
            await driver.switchTo().defaultContent();
        }

        await driver.sleep(10000);

        console.log("Waiting for the close button to appear...");
        await driver.wait(until.elementLocated(By.className('close-button')), 3000);
        await driver.findElement(By.className('close-button')).click();

        await driver.sleep(1000);

        console.log("Waiting for server list to load...");
        let serverList = await driver.wait(until.elementLocated(By.id('server-list')), 3000);

        console.log("Finding BETA server...");
        let servers = await serverList.findElements(By.className('list-row'));
        console.log(`Found ${servers.length} servers.`);
        for (let server of servers) {
            let text = await server.getText();
            console.log(`Checking server: ${text}`);
            if (text.includes('BETA')) {
                console.log("BETA server found, clicking...");
                await server.click();
                break;
            }
        }

        console.log("Waiting for the login button to appear...");
        await driver.wait(until.elementLocated(By.id('btnLoginDisc')), 20000);
        await driver.findElement(By.id('btnLoginDisc')).click();

        await driver.wait(async () => {
            const handles = await driver.getAllWindowHandles();
            return handles.length === 2;
        }, 20000);

        const handles = await driver.getAllWindowHandles();
        const newWindowHandle = handles[1];
        await driver.switchTo().window(newWindowHandle);

        await driver.sleep(2500);
        await driver.wait(until.elementLocated(By.id('uid_8')), 20000);
        await driver.findElement(By.id('uid_8')).sendKeys('hmstfymad@gmail.com');

        await driver.sleep(3000);
        await driver.wait(until.elementLocated(By.id('uid_10')), 20000);
        await driver.findElement(By.id('uid_10')).sendKeys('DARKXMewa1990');

        await driver.sleep(2000);
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.sleep(5000);

        const originalWindowHandle = handles[0];
        await driver.switchTo().window(originalWindowHandle);
        

        await driver.sleep(12000);
        await driver.wait(until.elementLocated(By.id('captcha-overlay')), 10000);
        await driver.findElement(By.id('captcha-overlay')).click();

        try {
            console.log("Switching to the reCAPTCHA iframe...");
            const iframe = await driver.findElement(By.xpath('//iframe[@title="recaptcha challenge expires in two minutes"]'));
            await driver.switchTo().frame(iframe);
            console.log("Switched to the reCAPTCHA iframe successfully.");

            await driver.sleep(12000);
            console.log("Finding the button inside the reCAPTCHA iframe...");
            const button = await driver.findElement(By.css('div.button-holder.help-button-holder'));
            await button.click();
            console.log("Clicked on the button inside the reCAPTCHA iframe successfully.");
        } catch (error) {
            console.log("No button found inside the reCAPTCHA iframe.");
        } finally {
            console.log("Switching back to the default content...");
            await driver.switchTo().defaultContent();
        }

        async function servertimer() {
            let timerElement = await driver.findElement(By.css('p.server-timer'));
        
            // تعيين متغير لتتبع ما إذا انتهى الوقت أم لا
            let timeIsUp = false;
        
            // فحص الوقت كل ثانية
            let interval = setInterval(async () => {
                let currentTimerText = await timerElement.getText();
                console.log(`الوقت المتبقي: ${currentTimerText}`);
        
                // التحقق مما إذا كان الوقت انتهى
                if (currentTimerText === "00:00:00") {
                    timeIsUp = true;
                    clearInterval(interval); // إيقاف التفقد
                    console.log("انتهى الوقت.");
                    await driver.sleep(12000);
        
                    // البدء في التفاعل مع reCAPTCHA
                    await driver.wait(until.elementLocated(By.id('captcha-overlay')), 30000);
                    await driver.findElement(By.id('captcha-overlay')).click();
        
                    try {
                        console.log("التبديل إلى إطار reCAPTCHA...");
                        const iframe = await driver.findElement(By.xpath('//iframe[@title="recaptcha challenge expires in two minutes"]'));
                        await driver.switchTo().frame(iframe);
                        console.log("تم التبديل بنجاح إلى إطار reCAPTCHA.");
                        await driver.sleep(12000);
        
                        console.log("البحث عن الزر داخل إطار reCAPTCHA...");
                        const button = await driver.findElement(By.css('div.button-holder.help-button-holder'));
                        await button.click();
                        console.log("نقر على الزر داخل إطار reCAPTCHA بنجاح.");
                    } catch (error) {
                        console.log("لم يتم العثور على الزر داخل إطار reCAPTCHA.");
                    } finally {
                        console.log("التبديل مرة أخرى إلى المحتوى الافتراضي...");
                        await driver.switchTo().defaultContent();
                    }
                }
            }, 1000); // كل ثانية
        }
        
        // استدعاء الدالة للبدء في تنفيذ العمليات
        servertimer();
        
        
        


        const channel = await client.channels.fetch(CHANNEL_ID);

        while (true) {
            let messages = await driver.findElements(By.css('#chat-room-inner .current-chat-room div[msg]:not([data-processed="true"])'));

            for (let message of messages) {
                let time = await message.findElement(By.css('.time')).getText();
                let nick = await message.findElement(By.css('.nick')).getText();
                let text = await message.findElement(By.css('.message')).getText();

                await driver.executeScript('arguments[0].setAttribute("data-processed", "true");', message);

                console.log(`Time: ${time}, Nick: ${nick}, Text: ${text}`);
                console.log("-----------------------------------------");

                await channel.send(`[${time}] ***${nick}*** *${text}*`);
            }
        }
    } catch (e) {
        console.error(`An error occurred: ${e}`);
    } finally {
        console.log("Closing the browser.");
        //await driver.quit();
        console.log("Browser closed.");
    }
})();

client.on('messageCreate', async message => {
    if (message.channel.id === CHANNEL_ID && !message.author.bot) {
        let nickname = message.member.displayName || message.author.username;
        let content = message.content;

        if (processingMessage) {
            // إضافة الرسالة إلى قائمة الانتظار إذا كانت هناك معالجة حالية
            messageQueue.push({ nickname, content });
            console.log('Added message to queue:', message.content);
            return;
        }

        processingMessage = true;

        try {
            // Delete the message after processing
            await message.delete();
            const logMessage = `Message from ${nickname}: ${content}\n`;
            fs.appendFileSync('messages.log', logMessage, (err) => {
                if (err) throw err;
            });

            // Process the message on the web page
            let nameInput = await driver.findElement(By.id('name'));
            await nameInput.clear();

            try {
                await driver.actions().sendKeys(nameInput, nickname, Key.SPACE).perform();
            } catch (sendKeysError) {
                console.error('Error sending keys for nickname:', sendKeysError);
                nickname = 'Discord'; // Fallback nickname
                await nameInput.clear();
                await driver.actions().sendKeys(nameInput, nickname, Key.SPACE).perform();
            }

            await driver.findElement(By.tagName('body')).sendKeys(Key.ENTER);

            let chatInput = await driver.wait(until.elementLocated(By.css('input.chat-input.active')), 5000);
            await chatInput.sendKeys(content);
            await driver.sleep(1000);
            await driver.findElement(By.tagName('body')).sendKeys(Key.ENTER);

            // معالجة الرسائل المخزنة إذا كانت هناك
            while (messageQueue.length > 0) {
                const queuedMessage = messageQueue.shift();
                console.log('Processing queued message:', queuedMessage.content);
                await processMessage(queuedMessage.nickname, queuedMessage.content);
            }

        } catch (error) {
            console.error('Error interacting with the web page:', error);
        } finally {
            processingMessage = false;
        }
    }
});

async function processMessage(nickname, content) {
    try {
        // Process the message on the web page
        let nameInput = await driver.findElement(By.id('name'));
        await nameInput.clear();

        try {
            await driver.actions().sendKeys(nameInput, nickname, Key.SPACE).perform();
        } catch (sendKeysError) {
            console.error('Error sending keys for nickname:', sendKeysError);
            nickname = 'Discord'; // Fallback nickname
            await nameInput.clear();
            await driver.actions().sendKeys(nameInput, nickname, Key.SPACE).perform();
        }

        await driver.findElement(By.tagName('body')).sendKeys(Key.ENTER);

        let chatInput = await driver.wait(until.elementLocated(By.css('input.chat-input.active')), 5000);
        await chatInput.sendKeys(content);
        await driver.sleep(1000);
        await driver.findElement(By.tagName('body')).sendKeys(Key.ENTER);

            } catch (error) {
                console.error('Error interacting with the web page:', error);
            }
    }
