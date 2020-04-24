import * as puppeteer from 'puppeteer';
/*  eslint-disable no-unused-vars */
import { Browser, Page } from 'puppeteer';
import { Doer } from './doer';

const ProxyChain:any = require('proxy-chain');

/**
 * Abstract class extends Doer, implements @google puppeteer based Robot
*/
class PuppeteerRobot extends Doer {
  public opts:any

  public browser: Browser

    public currentPage: Page

    /**
     * Constructs object using {opts}
     * @param {any} opts - options object to be used upon construction
     */
    constructor(opts:any) {
      super();
      this.opts = opts || [];
    }

    /**
     * Initialize instances by launching browser
     * @returns {Promise<any>} Promise object to wait for
     */
    async init():Promise<any> {
      this.opts.args = this.opts.args || [];
      const { args } = this.opts;
      if (this.opts.proxyUrl) {
        const newProxyUrl = await ProxyChain.anonymizeProxy(this.opts.proxyUrl);
        console.log(newProxyUrl);
        args.push(`--proxy-server=${newProxyUrl}`);
      }

      if (this.opts.userDataDir) {
        args.push(`--user-data-dir=${this.opts.userDataDir}`);
      }

      const launchOpts = {
        headless: this.opts.headless,
				slowMo: this.opts.slowMo,
				defaultViewport:this.opts.defaultViewport,
        args,
      };

      console.log('Launching Puppeteer with options', launchOpts);
      this.browser = await puppeteer.launch(launchOpts);
    }

    /**
     * Redirects 0-th page to url provided
     * @param {string} url to redirect to
     * @param {any} opts - optional options object to be used with Browser::goto
     * @returns {Promise<Page>} Promise to wait for
     */
    async goto(url:string, opts?:any):Promise<Page> {
      [this.currentPage] = (await this.browser.pages());
      await this.currentPage.goto(url, opts || { waitUntil: 'networkidle2' });
      return this.currentPage;
    }

    /**
   * Helper method that correctly sets value
   * on INPUT element
   * @param {string} id of element to lookup
   * @param {strirg} value to be set
   * @returns {Promise<any>} Promise to wait for
   */
    async val(id:string, value?:string):Promise<any> {
      const el = await this.currentPage.$(id);
      if ((el != null)
       && (value != null)) {
        return this.currentPage
          .evaluate((_id:string, _val:string) => {
            (document.querySelector(_id) as HTMLInputElement)
              .value = _val;
            return _val;
          }, id, value);
      }
      return this.currentPage.$eval(id, (_el:HTMLInputElement) => _el.value);
    }

    /**
   * Helper method that correctly sets value via typing
   * on INPUT/SELECT elements. If element is not found
   * no problem is thrown
   * @param {string} id of element to lookup
   * @param {strirg} value to be set
   * @returns {Promise<any>} Promise to wait for
   */
    async type(id:string, value:string):Promise<any> {
      if ((value !== null) && (value !== undefined) && (value !== '')
           // setting value only if different from existing one
           && (value !== await this.val(id))) {
        return Doer.series(
          `Cleanup input control and setting ${value} value`,
          // async () => this.currentPage.evaluate((id:any) => {
          //    let el = document.querySelector(id);
          //    if(el)
          //        el.value = ''
          // }, id),
          // async () => this.currentPage.waitFor(1000),
          async () => this.currentPage.focus(id),
          async () => this.currentPage.type(id, value, { delay: 25 }),
        );
      } return Promise.resolve(true);
    }

    /**
   * Helper method that correctly sets value via typing
   * on INPUT/SELECT elements. If element is not found
   * no problem is thrown
   * @param {string} id of element to lookup
   * @returns {Promise<any>} Promise to wait for
   */
    async click(id:string):Promise<any> {
      if (this.currentPage.$(id) != null) {
        const el:any = await this.currentPage.$(id);
        const elPos = await this.currentPage.evaluate((_el:any) => {
          const { top, left } = _el.getBoundingClientRect();
          return { top, left };
        }, el);

        await this.currentPage.mouse.move(elPos.left + 2, elPos.top + 2);
        await this.currentPage.mouse.down();
        await this.currentPage.mouse.up();
      }
    }
}

export { PuppeteerRobot };
