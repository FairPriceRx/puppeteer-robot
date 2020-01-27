/**
 * @name Browse using proxy
 *
 * @desc Allow browse using proxy (anonymous or authenticated)
 */

const ProxyChain = require('proxy-chain');
const puppeteer = require('puppeteer');

(async() => {
		const env = {
				PP_LOGIN:'miljkovic1994@gmail.com',
				PP_PASSWD: 'n9%UAJxvvs!!8RTW*?Y'
		};
		
		const oldProxyUrl = 'http://Selsupport:E2w4DaQ@154.16.127.23:45785';
		const newProxyUrl = await ProxyChain.anonymizeProxy(oldProxyUrl);
		console.log(newProxyUrl);
		const browser = await puppeteer.launch({
				headless: false,
				args: [
						`--proxy-server=${newProxyUrl}`, // through proxy
						`--user-data-dir=PUP` // in specific dir
				],
		});
		// Do your magic here...
		// const page = await browser.newPage();
		// await page.goto('https://www.paypal.com/us/signin', { waitUntil: 'networkidle2' });
		await page.focus("#email")
		await page.keyboard.type(env.PP_LOGIN)	
		//await page.click("#btnNext")	
		await page.screenshot({ path: 'step1.png' })
		await page.focus("#password")
		await page.keyboard.type(env.PP_PASSWD)		
		await page.screenshot({ path: 'step2.png' })
		// await page.click("#btnLogin")
		// miljkovic1994@gmail.com
		// n9%UAJxvvs!!8RTW*?Y
		//await browser.close();
})()
