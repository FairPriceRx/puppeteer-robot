/**
 * @name PayPal Robot
 *
 * @desc Automate PayPal order creatinon

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


import { PuppeteerRobot } from './robot'

const countryTelephoneCode = require('country-telephone-code')
const lookup = require('country-code-lookup')

class PayPalRobot extends PuppeteerRobot {
    public browser: any
    
	async login(login:string, password:string) {
		// LOGIN
		const that = this // common technique used to simplify REPL invocation
		const page = that.currentPage = await that.browser.newPage();
		await this.series(
            'Login to PayPal',
			async () => page.setViewport({
				width: 1280,
				height: 1024,
				deviceScaleFactor: 1
			}),
			
			async () => page.goto('https://www.paypal.com/us/signin',
							   { waitUntil: 'networkidle2' }),
			

			async () => page.waitFor(700),
			async () => that.val('#email',
									 process.env.PP_LOGIN),
			async () => page.$('#btnNext')
				.then((p:any) => {
					if(p){
						return page.click("#btnNext")
					} else return Promise.resolve()
				}),
			async () => page.waitFor(1000),
			async () => page.$('#password')
				.then((p:any) => {
					if(p){
						return that.series(
                            'Entering password and hitting [LOGIN] button',
							async () => that.type('#password',
												   process.env.PP_PASSWD),
							async () => page.waitFor(1000),
							async () => page.$eval('#btnLogin',
												(el:any) =>
												el.click()),
							async () => page.waitFor(5000) // change to waitForNavigation
						)
					} else return Promise.resolve()
				})
		)
	}

	async createOrder(order:any){
		const that = this // common technique used to simplify REPL invocation
		let page = that.currentPage
		order.order_customer_country
			= lookup.byInternet(order.order_customer_country_code).country
		
		// ORDER
		// await page.goto('https://www.paypal.com/invoice/manage', { waitUntil: 'networkidle0' });
		await page.goto('https://www.paypal.com/invoice/create', { waitUntil: 'networkidle2' });

		// invoice information
		await that.val('#invoiceNumber', order.order_id)

		await that.val('#issueDate', order.order_date)
		await page.keyboard.down('Enter');
		await page.keyboard.up('Enter');
		await page.select('#invoiceTerms', 'noduedate')
		
		await that.type('#reference','')

		await page.focus('input[placeholder="Email address or name"]')
		await page.keyboard.type(order.order_customer_email)
		await page.keyboard.down('Tab');
		await page.keyboard.up('Tab');

		await page.waitFor(2000) // PP loads data
		await page.waitForSelector('#addNewBilling')
		await page.$eval('#addNewBilling', (el:any) => el.click())
		await page.waitFor(700)

		await page.waitForSelector('#recipientEmail')
		
		await that.val('#recipientEmail', order.order_customer_email)
		await that.val('#bill_first_name', order.order_customer_name)
		await that.val('#bill_last_name', order.order_customer_surname)
		await page.select("#billing_phone_country", new String(countryTelephoneCode(order.order_customer_country_code)))
		await that.val('#bill_phone', order.order_customer_phone)
		await page.$eval('.reciEditHead.reciHead', (el:any) => el.click())
		await page.waitFor(700)

		// setting Billing Info

		await page.select('#billing_country_code',
						  order.order_customer_country_code),

		await that.type('#billing_state',
							order.order_customer_state)

		await that.val('#billing_city',
							  order.order_customer_city)
		
 		await that.val('#billing_line1',
							  order.order_customer_address)
		
		await that.val('#billing_line2',
							  order.order_customer_address2)
		
		await that.val('#billing_postal_code',
							  order.order_customer_zip)
		
		await page.$eval('.reciEditHead.shipHead', (el:any) => el.click())
		await page.waitFor(700)
		await page.$eval('#sameBillingShipping', (check:any) => check.click())

		await page.$eval('.reciEditHead.langHead', (el:any) => el.click())
		await page.waitFor(700)
		
		const lang_country_code =
			await page.$('#lang_country_code', {
				visible: true
			})
		if(lang_country_code){
			await page.select('#lang_country_code', order.order_customer_country_code)
		}				

		await page.select('#bill_language', 'en_US')
		await page.$eval('#saveRecInfo', (check:any) => check.click())
		await page.waitFor(700)
		
		await page.waitForSelector('#itemName_0')

		await that.val('#itemName_0', `Delivery Service #[${order.order_id}]`)
		await that.val('#itemQty_0', '1')
		await that.val('#itemPrice_0', order.order_total)

		if(parseInt(order.order_total) > parseInt(process.env.MIN_DISCOUNT_AMOUNT)){
			await that.val('#invDiscount', process.env.DISCOUNT)
		}

		if(order.order_shipping_cost){
			await that.val('#shippingAmount',
								  order.order_shipping_cost as string)
		}

		if(await page.$('#sendSplitButton')){
			await page.evaluate(() => {
				var el = document.querySelector('#sendSplitButton')
				el.scrollIntoView()
			})
			await page.$eval("#sendInvoice", (el:any) => el.click())
		}
	}
	/**
	 * Logs out from PayPal and close browser
	 */
	async logout(){
		await this.browser.close();
	}		
}

export { PayPalRobot }
