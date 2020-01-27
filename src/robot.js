const puppeteer = require('puppeteer');
const ProxyChain = require('proxy-chain');

class PuppeteerRobot {
		constructor(opts) {
				this.opts = opts
		}

		async init(){
				const args = []
				if(this.opts.proxyUrl){
						const newProxyUrl = await ProxyChain.anonymizeProxy(this.opts.proxyUrl);
						console.log(newProxyUrl);
						args.push(`--proxy-server=${newProxyUrl}`);
				}
				
				if(this.opts.userDataDir){
						args.push(`--user-data-dir=${this.opts.userDataDir}`)
				}
				
				this.browser = await puppeteer.launch({
						headless: this.opts.headless,
						slowMo: this.opts.slowMo,
						args: args
				})
		}

		/**
		 * Helper method that correctly sets value
		 * on INPUT element
		 */
		async safeSetVal(page, id, val){
				await page.focus(id)
				await page.$eval(id, el => el.value = '')
				await page.type(id ,val)
		}
}

module.exports = PuppeteerRobot
