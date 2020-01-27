/**
 * @name Puppeteer Robot (proxy capable)
 *
 * @desc Allow browse using proxy (anonymous or authenticated)

ORDER SAMPLE:

{
  "order_id": "721",
  "order_date": "13/01/2020",
  "order_total": "641.00",
  "order_payment_method": "Direct bank transfer",
  "order_customer_email": "webmaster.t.hrytsenko@gmail.com",
  "order_customer_phone": "0980004433",
  "order_customer_name": "Taras",
  "order_customer_surname": "Hrytsenko",
  "order_customer_address": "Test street",
  "order_customer_country": "Ukraine",
  "order_customer_city": "Kyiv",
  "order_customer_zip": "023333",
  "order_items": [
    {
      "item_name": "Namenda 20 mg 60 capsules (Generic Memantine Hydrochloride)",
      "item_quantity": 1,
      "item_total": "165"
    },
    {
      "item_name": "Alphagan 1.5 mg/ml - 5ml 1 eye drops (Generic Brimonidine Tartrate)",
      "item_quantity": 2,
      "item_total": "236"
    },
    {
      "item_name": "Eliquis 2.5 mg 60 tablets (Generic Apixaban)",
      "item_quantity": 1,
      "item_total": "240"
    }
  ]
}

 */

const PuppeteerRobot = require('./robot')
const countryTelephoneCode=require('country-telephone-code')
const lookup = require('country-code-lookup')
require('dotenv-flow').config()

class PayPalRobot extends PuppeteerRobot {
		constructor(opts) {
				super(opts);
		}

		async login(login, password) {
				// LOGIN
				const that = this // common technique used to simplify REPL invocation
				const page = that.currentPage = await that.browser.newPage();
				await page.goto('https://www.paypal.com/us/signin', { waitUntil: 'networkidle2' });

				await page.waitFor(700)
				await that.safeSetVal(page, '#email', process.env.PP_LOGIN)
				const btnNext = await page.waitForSelector('#btnNext', {
						visible: true,
				})
				if(btnNext){
						await page.click("#btnNext")
				}
				await page.waitFor(1200)
				await that.safeSetVal(page, '#password',process.env.PP_PASSWD)

				await page.$eval('#btnLogin', el => el.click());				
		}

		async createOrder(order){
				const that = this // common technique used to simplify REPL invocation
				let page = that.currentPage
				order.order_customer_country_code
						= lookup.byCountry(order.order_customer_country).internet
				
				// ORDER
				await page.goto('https://www.paypal.com/invoice/manage', { waitUntil: 'networkidle0' });
				await page.goto('https://www.paypal.com/invoice/create', { waitUntil: 'networkidle2' });

				// invoice information
				await that.safeSetVal(page, '#invoiceNumber',order.order_id)

				await that.safeSetVal(page, '#issueDate',order.order_date)
				await page.keyboard.down('Enter');
				await page.keyboard.up('Enter');
				
				await that.safeType(page,'#reference','')

				await page.focus('input[placeholder="Email address or name"]')
				await page.keyboard.type(order.order_customer_email)
				await page.keyboard.down('Tab');
				await page.keyboard.up('Tab');

				await page.waitFor(2000) // PP loads data
				await page.waitForSelector('#addNewBilling')
				await page.$eval('#addNewBilling', el => el.click())
				await page.waitFor(700)

				await page.waitForSelector('#recipientEmail')
				
				await that.safeSetVal(page, '#recipientEmail', order.order_customer_email)
				await that.safeSetVal(page, '#bill_first_name', order.order_customer_name)
				await that.safeSetVal(page, '#bill_last_name', order.order_customer_surname)
				await page.select("#billing_phone_country", new String(countryTelephoneCode(order.order_customer_country_code)))
				await that.safeSetVal(page, '#bill_phone', order.order_customer_phone)
				await page.$eval('.reciEditHead.reciHead', el => el.click())
				await page.waitFor(700)
				
				await page.select('#billing_country_code', order.order_customer_country_code)

//				await that.safeType(page,'#billing_state', order.order_customer_state)
				await that.safeSetVal(page, '#billing_city', 'Ternopil')
				
				await that.safeSetVal(page, '#billing_line1', order.order_customer_address)
//				await that.safeSetVal(page, '#billing_line2', '')
				
				await that.safeSetVal(page, '#billing_postal_code', order.order_customer_zip)

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
						await page.select('#lang_country_code', order.order_customer_country_code)
				}				

				await page.select('#bill_language', 'en_US')
				await page.$eval('#saveRecInfo', check => check.click())
				await page.waitFor(700)

				await that.safeSetVal(page, '#itemName_0', `Delivery Service #[${order.order_id}]`)
				await that.safeSetVal(page, '#itemQty_0', '1')
				await that.safeSetVal(page, '#itemPrice_0', order.order_total)

				if(parseInt(order.order_total) > parseInt(process.env.MIN_DISCOUNT_AMOUNT)){
						await that.safeSetVal(page, '#invDiscount', process.env.DISCOUNT)
				}
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
