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
import { Page, ElementHandle } from 'puppeteer'

const countryTelephoneCode = require('country-telephone-code')
const lookup = require('country-code-lookup')

class PayPalRobot extends PuppeteerRobot {
    public browser: any
    
	async fillLoginForm(login:string, pwd:string, page:Page){				
		return this.series(
			'Filling login form with login and password',
			async () => this.type('#email', login),
			async () => page.$('#btnNext'),
			async (p:any) => {
				if(p){
					return page.click("#btnNext")
				}
			},
			async () => page.waitFor(1000),
			async () => page.waitForSelector('#password'),
					async () => page.focus('#password'),
					async () => this.type('#password', pwd),
					async () => page.waitFor(1000),
					async () => page.$eval('#btnLogin', (el:any) => el.click()),
					async () => page.waitFor(5000) // change to waitForNavigation
		);
	}

	async login(login:string, password:string) {
		// LOGIN
		const that = this // common technique used to simplify REPL invocation
		const page = that.currentPage = await that.browser.newPage();
		await this.series(
            'Login to PayPal',			
			async () => page.goto('https://www.paypal.com/us/signin', { waitUntil: 'networkidle2' }),
			async () => page.setViewport({
				width: 1280,
				height: 1024,
				deviceScaleFactor: 1
			}),
			

			async () => page.waitFor(700),
			async () => this.fillLoginForm(login, password, page)
		)
	}

    async fillRecipientInformationForm_Header(order: any, page: Page): Promise<any> {
		await page.waitForSelector('#recipientEmail')
		
		await this.val('#recipientEmail', order.order_customer_email)
		await this.val('#bill_first_name', order.order_customer_name)
		await this.val('#bill_last_name', order.order_customer_surname)
		await page.select("#billing_phone_country", countryTelephoneCode(order.order_customer_country_code)[0] as string)
		await this.val('#bill_phone', order.order_customer_phone)
        return Promise.resolve(true) // returning fake `true`
    }
    
    async fillRecipientInformationForm_Billing(order:any, page:Page):Promise<any> {
		await page.waitForSelector('#billing_country_code')
        
		// setting Billing Info
		await page.select('#billing_country_code',
						  order.order_customer_country_code),

		await page.select('#billing_state',
						  order.order_customer_state)

		await this.val('#billing_city',
					   order.order_customer_city)
		
 		await this.val('#billing_line1',
					   order.order_customer_address)
		
		await this.val('#billing_line2',
					   order.order_customer_address2)
		
		await this.val('#billing_postal_code',
					   order.order_customer_zip)
        return Promise.resolve(true) // returning fake `true`
    }

    async fillRecipientInformationForm_Shipping(order:any, page: Page): Promise<any> {
		await page.$eval('#sameBillingShipping', (check:any) => check.click())
        return Promise.resolve(true) // returning fake `true`        
    }

    async fillRecipientInformationForm_Language(order: any, page: Page): Promise<any> {		
		const lang_country_code = await page.$('#lang_country_code')
		if(lang_country_code){
			await page.select('#lang_country_code', order.order_customer_country_code)
		}				

		await page.select('#bill_language', 'en_US')
        
        return Promise.resolve(true) // returning fake `true`        
    }
    
    async fillRecipientInformationForm(order:any, page:Page):Promise<any> {
        
        await this.fillRecipientInformationForm_Header(order, page)
        
		await page.$eval('.reciEditHead.reciHead', (el:any) => el.click())
		await page.waitFor(700)

        await this.fillRecipientInformationForm_Billing(order, page)
        
		await page.$eval('.reciEditHead.shipHead', (el:any) => el.click())
		await page.waitFor(700)

        await this.fillRecipientInformationForm_Shipping(order, page)

		await page.$eval('.reciEditHead.langHead', (el:any) => el.click())
		await page.waitFor(700)
        
        await this.fillRecipientInformationForm_Language(order, page)
        
		await page.$eval('#saveRecInfo', (check:any) => check.click())
		await page.waitFor(700)

		return Promise.resolve(true) // return fake `true
    }

    async fillOrderDetailsForm(order:any, page:Page):Promise<any> {
		await page.waitForSelector('#itemName_0')

		await this.val('#itemName_0', `Delivery Service #${order.order_id}`)
		await this.val('#itemQty_0', '1')
		await this.val('#itemPrice_0', order.order_total)

		if(parseInt(order.order_total) > parseInt(process.env.MIN_DISCOUNT_AMOUNT)){
			await this.val('#invDiscount', process.env.DISCOUNT)
		}

		if(order.order_shipping_cost){
			await this.val('#shippingAmount',
						   order.order_shipping_cost as string)
		}
        return Promise.resolve(true) // return fake true
    }
    
	async fillCreateInvoiceForm(order:any, page:Page):Promise<any> {
		// invoice information
		await this.val('#invoiceNumber', order.order_id)

		await this.val('#issueDate', order.order_date)
		await page.keyboard.down('Enter');
		await page.keyboard.up('Enter');
        await page.select('#invoiceTerms', 'noduedate')
		
		await this.type('#reference','')

		await page.focus('input[placeholder="Email address or name"]')
		await page.keyboard.type(order.order_customer_email)
		await page.keyboard.down('Tab');
		await page.keyboard.up('Tab');

        return Promise.resolve(true) // return fake `true`
	}

	async createOrder(order:any){
		const that = this // common technique used to simplify REPL invocation
		let page = that.currentPage
		order.order_customer_country
			= lookup.byInternet(order.order_customer_country_code).country
		
		// ORDER
		// await page.goto('https://www.paypal.com/invoice/manage', { waitUntil: 'networkidle0' });
		await page.goto('https://www.paypal.com/invoice/create', { waitUntil: 'networkidle2' });
		await this.fillCreateInvoiceForm(order, page)
        
		await page.waitFor(2000) // PP loads data
		await page.waitForSelector('#addNewBilling')

		await this.fillRecipientInformationForm(order, page);

        await this.fillOrderDetailsForm(order, page)
        
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
