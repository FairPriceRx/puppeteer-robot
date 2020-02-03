import * as puppeteer from 'puppeteer';
const ProxyChain = require('proxy-chain');

const { all } = Promise;

import { Doer, AsyncFunction } from './doer'

class PuppeteerRobot extends Doer {
	protected opts:any
	protected browser:any    
    
	constructor(opts:any) {
        super()
    	this.opts = opts || []
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
	async safeSetVal(page:any, id:string, val:string){
		const el = await page.$(id);
		if((el != null)
		   && (val != '' && val != null)){
			return this.doInSeries([
				async () =>
                    page.focus(id),
				async () =>
                    page.evaluate((id:string, val:string) =>
                                  (document.querySelector(id) as HTMLInputElement).value = val, id, val),
                //								page.type(id, val, { delay: 25 })
			])
		}
	}
	
	/**
	 * Helper method that correctly sets value via typing
	 * on INPUT/SELECT elements. If element is not found
	 * no problem is thrown
	 */
	async safeType(page:any, id:string, val:string){
		if((page.$(id) != null) &&
		   (val != null) && (val != '')){
			return page.type(id, val)
		}
	}
	/**
	 * Helper method that correctly sets value via typing
	 * on INPUT/SELECT elements. If element is not found
	 * no problem is thrown
	 */
	async safeClick(page:any, id:string){
		if(page.$(id) != null){
			const el:any = await page.$(id)
			let elPos = await page.evaluate((el:any) => {
				const {top, left} = el.getBoundingClientRect();
				return {top, left};
			}, el);

			await page.mouse.move(elPos.left + 2, elPos.top + 2);
			await page.mouse.down(elPos.left + 2, elPos.top + 2);
			await page.mouse.up();
		}
	}

	async doInSeries(tasks:AsyncFunction[]){
		return tasks.reduce((promiseChain:Promise<any>, currentTask:AsyncFunction) => {
			return promiseChain
				.then((chainResults:any[]) =>
					  currentTask()
					  .then((currentResult:any) =>
							[ ...chainResults, currentResult ])
					 );
		}, Promise.resolve([]))				
	}
	
}

export { PuppeteerRobot }
