/**
 * @name Puppeteer Robot (proxy capable)
 *
 * @desc Allow browse using proxy (anonymous or authenticated)
 */

const PuppeteerRobot = require('./robot')
require('dotenv').config()

class PayPalRobot extends PuppeteerRobot {
		constructor(opts) {
				super(opts);
		}

		async login(login, password) {
				// LOGIN
				const that = this // common technique used to simplify REPL invocation
				const page = that.currentPage = await that.browser.newPage();
				await page.goto('https://www.paypal.com/us/signin', { waitUntil: 'networkidle2' });
				
				await that.safeSetVal(page, '#email', process.env.PP_LOGIN)
				const btnNext = await page.waitForSelector('#btnNext', {
						visible: true,
				})
				if(btnNext){
						await page.click("#btnNext")
				}
				await page.waitFor(700)
				await page.screenshot({ path: 'step1.png' })
				await that.safeSetVal(page, '#password',process.env.PP_PASSWD)
				await page.screenshot({ path: 'step2.png' })

				await page.$eval('#btnLogin', el => el.click());				
		}

		async createOrder(order){
				const that = this // common technique used to simplify REPL invocation
				let page = that.currentPage
				// ORDER
				await page.goto('https://www.paypal.com/invoice/manage', { waitUntil: 'networkidle0' });
				await page.goto('https://www.paypal.com/invoice/create', { waitUntil: 'networkidle2' });


				// await page.click('#categoryCode')
				// await page.click('#enhancedDropdownBody_SHIPPABLE')


				// invoice information
				await that.safeSetVal(page, '#invoiceNumber',order.order_id)

				await that.safeSetVal(page, '#issueDate',order.order_date)
				await page.keyboard.down('Enter');
				await page.keyboard.up('Enter');
				
				await page.type('#reference','')

				await page.focus('input[placeholder="Email address or name"]')
				await page.keyboard.type('archer79@yopmail.com')
				await page.keyboard.down('Tab');
				await page.keyboard.up('Tab');

				await page.waitFor(2000) // PP loads data
				await page.waitForSelector('#addNewBilling')
				await page.$eval('#addNewBilling', el => el.click())
				await page.waitFor(700)

				await page.waitForSelector('#recipientEmail')
				
				await that.safeSetVal(page, '#recipientEmail', 'archer79@yopmail.com')
				await that.safeSetVal(page, '#bill_first_name', 'Arsen')
				await that.safeSetVal(page, '#bill_last_name', 'Gutsal')
				await page.type("#billing_phone_country", "Ukraine")
				await that.safeSetVal(page, '#bill_phone', '0965996328')
				await page.$eval('.reciEditHead.reciHead', el => el.click())
				await page.waitFor(700)
				
				await page.select('#billing_country_code', 'UA')

				await page.type('#billing_state', "Ternopil")
				await that.safeSetVal(page, '#billing_city', 'Ternopil')
				
				await that.safeSetVal(page, '#billing_line1', 'Schlyahtynecka')
				await that.safeSetVal(page, '#billing_line2', 'bld. 3')
				
				await that.safeSetVal(page, '#billing_postal_code', '47715')

				await page.$eval('.reciEditHead.shipHead', el => el.click())
				await page.waitFor(700)
				await page.$eval('#sameBillingShipping', check => check.click())

				await page.$eval('.reciEditHead.langHead', el => el.click())
				await page.waitFor(700)
				
				const lang_country_code =
							await page.$('#lang_country_code', {
									visible: true
							})
				if(lang_country_code){
						await page.type('#lang_country_code', 'Ukraine')
				}				

				await page.select('#bill_language', 'en_US')
				await page.$eval('#saveRecInfo', check => check.click())
				await page.waitFor(700)				

				await that.safeSetVal(page, '#itemName_0', `Delivery Service #[${order.order_id}]`)
				order.order_items.forEach(async (item, idx) => {						
						await that.safeSetVal(page, '#itemQty_0', '1')
						await that.safeSetVal(page, '#itemPrice_' + idx, item.item_total)

						// attempting to add more rows
						if((page.$("#itemName_" + (idx + 1)) == null)
							 &&
							 (idx < order.order_items.length)){
								await page.$eval('#addMoreItem', check => check.click())
						}
						await page.waitForSelector("#itemName_" + (idx + 1))
				})

				
		}
		/**
		 * Logs out from PayPal and close browser
		 */
		async logout(){
				await this.browser.close();
		}		
}

(async() => {
		let botPP = new PayPalRobot({
				proxyUrl: process.env.PROXY_CFG,
				headless: false,
				slowMo: 25
		})
		await botPP.init()
		await botPP.login(process.env.PP_LOGIN, process.env.PP_PASSWD)
		
		await botPP.createOrder(require('./order_json.json'))
})
