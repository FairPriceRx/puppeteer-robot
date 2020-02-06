import * as puppeteer from 'puppeteer'

import { Browser, Page } from 'puppeteer'
const ProxyChain:any = require('proxy-chain')

const { all } = Promise
import { Doer, AsyncFunction } from './doer'

class PuppeteerRobot extends Doer {
	public opts:any
	public browser:Browser
    public currentPage: any
    
	constructor(opts:any) {
        super()
    	this.opts = opts || []
	}

	async init(){
		this.opts.args = this.opts.args || []
        const args = this.opts.args
		if(this.opts.proxyUrl){
			const newProxyUrl = await ProxyChain.anonymizeProxy(this.opts.proxyUrl);
			console.log(newProxyUrl);
			args.push(`--proxy-server=${newProxyUrl}`);
		}
		
		if(this.opts.userDataDir){
			args.push(`--user-data-dir=${this.opts.userDataDir}`)
		}
		
		const launchOpts = {
			headless: this.opts.headless,
			slowMo: this.opts.slowMo,
			args: args
		}
		
        //  	    console.log('Launching Puppeteer with options', launchOpts)
		this.browser = await puppeteer.launch(launchOpts)
	}

    async goto(url:string, opts?:any):Promise<Page> {
		this.currentPage = await this.browser.newPage()
		await this.currentPage.goto(url,opts?opts:{ waitUntil: 'networkidle2' })
		return this.currentPage
    }

	/**
	 * Helper method that correctly sets value
	 * on INPUT element
	 */
	async val(id:string, val?:string){
		const el = await this.currentPage.$(id);
		if((el != null)
		   && (val != '' && val != null)){
            return this.currentPage
                .evaluate((id:string, val:string) =>
                          (document.querySelector(id) as HTMLInputElement)
                          .value = val, id, val)
		} else {
            return this.currentPage.$eval(id, (el:HTMLInputElement) => el.value)
        }
	}
	
	/**
	 * Helper method that correctly sets value via typing
	 * on INPUT/SELECT elements. If element is not found
	 * no problem is thrown
	 */
	async type(id:string, val:string){
		if((val != null) && (val != undefined) && (val != '') &&
           // setting value only if different from existing one
           (val != await this.val(id))){
            return
            this.series(
                `Cleanup input control and setting ${val} value`,
                async () => this.currentPage.evaluate((id) => {
										let el = document.querySelector(id);
										if(el)
												el.value = ''
								}, id),
                async () => this.currentPage.waitFor(1000),
                async () => this.currentPage.focus(id),
                async () => this.currentPage.type(id, val, {delay: 25})
            )
		}
	}
	/**
	 * Helper method that correctly sets value via typing
	 * on INPUT/SELECT elements. If element is not found
	 * no problem is thrown
	 */
	async click(id:string){
		if(this.currentPage.$(id) != null){
			const el:any = await this.currentPage.$(id)
			let elPos = await this.currentPage.evaluate((el:any) => {
				const {top, left} = el.getBoundingClientRect();
				return {top, left};
			}, el);

			await this.currentPage.mouse.move(elPos.left + 2, elPos.top + 2);
			await this.currentPage.mouse.down(elPos.left + 2, elPos.top + 2);
			await this.currentPage.mouse.up();
		}
	}	
}

export { PuppeteerRobot }
