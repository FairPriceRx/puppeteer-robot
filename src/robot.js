const puppeteer = require('puppeteer');
const ProxyChain = require('proxy-chain');

const { all } = Promise;

class PuppeteerRobot {
		constructor(opts) {
				this.opts = opts
		}

		async init(){
				const args = this.opts.args || []
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
				const el = await page.$(id);
				return Promise.all([
						page.focus(id),
						//el.click({ clickCount: 3}),
						page.evaluate((id) => document.querySelector(id).value = '', id),						
						page.type(id, val, { delay: 25 })
				])
		}
		
		/**
		 * Helper method that correctly sets value via typing
		 * on INPUT/SELECT elements. If element is not found
		 * no problem is thrown
		 */
		async safeType(page, id, val){
				if(page.$(id) != null){
//						await page.hover(id)
						await page.type(id ,val)
				}
		}
		/**
		 * Helper method that correctly sets value via typing
		 * on INPUT/SELECT elements. If element is not found
		 * no problem is thrown
		 */
		async safeClick(page, id){
				if(page.$(id) != null){
						const el = await page.$(id)
						let elPos = await page.evaluate((el) => {
								const {top, left} = el.getBoundingClientRect();
								return {top, left};
						}, el);

						await page.mouse.move(elPos.left + 2, elPos.top + 2);
						await page.mouse.down(elPos.left + 2, elPos.top + 2);
						await page.mouse.up();
				}
		}
		
}

module.exports = { PuppeteerRobot }
