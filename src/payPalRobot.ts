/**
 * @name PayPal Robot
 *
 * @desc Automate PayPal order creatinon

ORDER SAMPLE:
{
  "order_id": "1380",
  "order_date": "02/06/2020",
  "order_total": "84.00",
  "order_subtotal": "84",
  "order_shipping_cost": "0.00",
  "order_payment_method": "PayPal/Stripe/AliPay",
  "order_customer_email": "gutsal.arsen@gmail.com",
  "order_customer_phone": "+380965996328",
  "order_customer_name": "Арсен",
  "order_customer_surname": "Гуцал",
  "order_customer_address": "Гаи Шевченковские",
  "order_customer_address2": "Шляхтинецкая 3",
  "order_customer_country_code": "UA",
  "order_customer_state": "Тернополь",
  "order_customer_city": "Тернополь",
  "order_customer_zip": "46001",
  "order_billing_first_name": "Арсен",
  "order_billing_last_name": "Гуцал",
  "order_billing_address_one": "Гаи Шевченковские",
  "order_billing_address_two": "Шляхтинецкая 3",
  "order_billing_country_code": "UA",
  "order_billing_state": "Тернополь",
  "order_billing_city": "Тернополь",
  "order_billing_zip": "46001",
  "order_shipping_first_name": "Арсен",
  "order_shipping_last_name": "Гуцал",
  "order_shipping_address_one": "Гаи Шевченковские",
  "order_shipping_address_two": "Шляхтинецкая 3",
  "order_shipping_country_code": "UA",
  "order_shipping_state": "Тернополь",
  "order_shipping_city": "Тернополь",
  "order_shipping_zip": "46001",
  "order_items": [
    {
      "item_name": "Apriso 800 mg 60 tablets (Generic Mesalamine)",
      "item_quantity": "1",
      "item_total": "84"
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
            async () => page.evaluate(() => (document.querySelector('#email') as HTMLInputElement).value = ''),
			async () => this.type('#email', login),
			async () => page.$('#btnNext'),
			async (p:any) => {
				if(p){
					return page.click("#btnNext")
				}
			},
			async () => page.waitForSelector('#password'),
			async () => page.focus('#password'),
			async () => this.type('#password', pwd)
        )
	}

	async login(login:string, password:string) {
		// LOGIN
		const that = this // common technique used to simplify REPL invocation
		let page:Page
		await this.series(
            'Login to PayPal',			
			async () => page = await this.goto('https://www.paypal.com/us/signin'),
			async () => page.setViewport({
				width: 1280,
				height: 1024,
				deviceScaleFactor: 0.75
			}),
			
			async () => page.waitFor(700),
			async () => {
                console.log(page.url());
                if(page.url() === 'https://www.paypal.com/us/signin'){
                    return this.series(
                        'Filling login form',
                        async () => this.fillLoginForm(login, password, page),
                        // hitting login button
                        async () => page.$eval('#btnLogin', (el:any) => el.click()),
						async () => page.waitFor(5000), // change to waitForNavigation
                    )
				}
			},
		)
	}

    async fillRecipientInformationForm_Header(order: any, page: Page): Promise<any> {
		await page.waitForSelector('#recipientEmail')
		
		await this.val('#recipientEmail', order.order_customer_email)
		await this.val('#bill_first_name', order.order_customer_name)
		await this.val('#bill_last_name', order.order_customer_surname)
		await page.select("#billing_phone_country", countryTelephoneCode(order.order_customer_country_code)[0] as string)
		await this.val('#bill_phone', order.order_customer_phone)
		await page.$eval('#saveToContactBook', (check:any) => check.click())
        return Promise.resolve(true) // returning fake `true`
    }
    
    async fillRecipientInformationForm_Billing(order:any, page:Page):Promise<any> {
		await page.waitForSelector('#billing_country_code')
        
		// setting Billing Info
		await page.select('#billing_country_code',
						  order.order_customer_country_code),
        
        await page.waitFor(2000) // let state control change

        if(order.order_customer_country_code === 'US'){
            // trying to set state for US only
		    await this.type('#billing_state',
						    order.order_customer_state)
        }

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
        return this.series('Filling Shipping part of the form',
                    async () => this.val('#shipping_first_name', order.order_shipping_first_name),
                    async () => this.val('#shipping_last_name', order.order_shipping_last_name),
                    async () => this.val('#shipping_country_code', order.order_shipping_country_code),
                    async () => this.val('#shipping_line1', order.order_shipping_address_one),
                    async () => this.val('#shipping_line2', order.order_shipping_address_two),
                    async () => this.val('#shipping_city', order.order_shipping_city),
                    async () => this.val('#shipping_state', order.order_shipping_state),
                    async () => this.val('#shipping_postal_code', order.order_shipping_zip),
                           async () => page.waitFor(200),
                           async () => page.$eval('#saveShippingToContact', (check:any) => check.click()))
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
        //        await page.waitFor(60000 * 1)

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
		order.order_customer_country
			= lookup.byInternet(order.order_customer_country_code).country

		let page:Page
		// ORDER
        this.series(
            'Creating order',
            async () => await this.goto('https://www.paypal.com/invoice/create', { waitUntil: 'networkidle2' }),

            async () => page = that.currentPage,
			async () => page.setViewport({
				width: 1280,
				height: 1024
			}),
            
            async () => this.fillCreateInvoiceForm(order, page),        
            async () => page.waitForSelector('#addNewBilling'),
            async () => page.$eval('#addNewBilling', (el:any) => el.click()),
            async () => this.fillRecipientInformationForm(order, page),
            async () => this.fillOrderDetailsForm(order, page),
            async () => {
		        if(await page.$('#sendSplitButton')){
			        await page.evaluate(() => {
				        var el = document.querySelector('#sendSplitButton')
				        el.scrollIntoView()
			        })
			        await page.$eval("#sendInvoice", (el:any) => el.click())
		        }
            },
			async () => page.waitForNavigation(), // change to waitForNavigation
        )
	}
	/**
	 * Logs out from PayPal and close browser
	 */
	async logout(){
//		await this.currentPage.close();
	}
}

export { PayPalRobot }
