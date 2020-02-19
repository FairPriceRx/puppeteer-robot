import { PayPalRobot } from '../src/payPalRobot'
import { Page } from 'puppeteer'
const countryTelephoneCode = require('country-telephone-code')

import {should, expect, use} from "chai"
import chaiAsPromised = require("chai-as-promised");                                                        

describe('PayPalRobot', () => {
    let robot:PayPalRobot

    before('initialize App and Robot', () => {
        use(chaiAsPromised)
        should()
        
		robot = new PayPalRobot({
			proxyUrl: process.env.PROXY_CFG,
			headless: false,
			slowMo: 25,
			args: [
				'--force-device-scale-factor=0.5',
				'--display=:1'
			]
		})
    })

	after('cleanup browser instance', () => {
		if(robot.browser)
			robot.browser.close()
	})
	
	it('should create an instance of Robot', () => {
		expect(robot).instanceOf(PayPalRobot)
		expect(robot).has.property('opts').not.null;
	});

	it('should launch browser with some args', async function(){
		this.timeout(5000)				
		await robot.init()
		expect(robot).has.property('opts').not.null;
		expect(robot).has.property('browser').not.null;
	});

	it('should open Login test page and fill data, click buttons', async function(){
		this.timeout(60000) // for that we should NOT use arrow functions
		await robot.init()
		let page:Page;
		return robot
			.series('loading test page',
					async () => robot.goto('file://' + process.cwd() + '/test/resources/Login.html'),
					async (p) => (page = p).setViewport({
						width: 2048,
						height: 2048,
						deviceScaleFactor: 0.5
					}),
					
					async () => page.$eval('#btnLogin',
										   (btnLogin:any, expect:any) =>
										   btnLogin.onclick = (evt:any) => {
											   evt.stopPropagation();
											   return false
										   }),										
					async () => robot.fillLoginForm('LOGIN', 'PWD', page),
					async () => (await robot.val('#email')).should.equal('LOGIN'),
					async () => (await robot.val('#password')).should.equal('PWD')
				   )
	})
	
	it('should open CreateInvoice test page and fill data, click buttons', async function(){
		this.timeout(60000) // for that we should NOT use arrow functions
		await robot.init()
		let page:Page, order:any;
		robot.fillRecipientInformationForm = (order:any, page:Page):Promise<any> => {
			// overriding with empty function
			return Promise.resolve(true) // return fake `true`												
		}
        
		return robot
			.series('loading Invoice page',
					async () => robot.goto('file://' + process.cwd() + '/test/resources/Invoice.html'),
					async (p) => (page = p).setViewport({
						width: 2048,
						height: 2048,
						deviceScaleFactor: 0.5
					}),										
					async () => page.$eval('#sendInvoice',
										   (btnLogin:any, expect:any) =>
										   btnLogin.onclick = (evt:any) => {
											   evt.stopPropagation();
											   return false
										   }),
					async () => order = require('./resources/order_brad.json'),
					async (order) => robot.fillCreateInvoiceForm(order, page),
					async () => robot.series(
						'Testing header invoice data',
						async () => robot.val('#invoiceNumber').should.eventually.equal(order.order_id),
						async () => robot.val('#issueDate').should.eventually.equal(order.order_date),
						async () => robot.val('#invoiceTerms').should.eventually.equal('noduedate'),
						// email
						async () => robot.val('input[placeholder="Email address or name"]').should.eventually.equal(order.order_customer_email),                        
						async () => robot.series(
							'Testing details invoice data',
							async () => robot.fillOrderDetailsForm(order, page),
							async () => robot.val('#itemName_0').should.eventually.equal(`Delivery Service #${order.order_id}`),
							async () => robot.val('#itemQty_0').should.eventually.equal('1'),
							async () => robot.val('#itemPrice_0').should.eventually.equal(order.order_total)
						),
					))
	})

	it('should open RecipientInformation_Header test page and fill data, click buttons', async function(){
		this.timeout(60000) // for that we should NOT use arrow functions
		await robot.init()
		let page:Page, order:any;
		return robot
			.series('loading Invoice_RecipientInformation page',
					async () => page = await robot.goto('file://' + process.cwd() + '/test/resources/Invoice_RecipientInformation.html'),
					async (page) => page.setViewport({
						width: 2048,
						height: 2048,
						deviceScaleFactor: 0.5
					}),
					async () => page.$eval('#saveRecInfo',
										   (btnLogin:any, expect:any) =>
										   btnLogin.onclick = (evt:any) => {
											   evt.stopPropagation();
											   return false
										   }),
					async () => order = require('./resources/order_brad.json'),
					async (order) => robot.fillRecipientInformationForm_Header(order, page),
					// Testing values
					async () => robot.series(
						'Testing recipient information form',
						async () => robot.val('#recipientEmail'),
						async (it:any) => it.should.equal(order.order_customer_email),
						async () => robot.val('#bill_first_name'),
						async (it:any) => it.should.equal(order.order_customer_name),
						async () => robot.val('#bill_last_name'),
						async (it:any) => it.should.equal(order.order_customer_surname),
						async () => robot.val('#billing_phone_country'),
						async (it:any) => it.should.equal(countryTelephoneCode(order.order_customer_country_code)[0]),
						async () => robot.val('#bill_phone'),
						async (it:any) => it.should.equal(order.order_customer_phone),
                        //												async () => robot.delay(30000)
					)
				   )
	})

	it('should open RecipientInformation_Billing, fill data, click buttons',
	   async function() {
		   this.timeout(60000) // for that we should NOT use arrow functions
		   await robot.init()
		   let page:Page, order:any;
		   return robot
			   .series('loading Invoice_RecipientInformation_Billing page',
					   async () => page = await robot.goto('file://' + process.cwd() + '/test/resources/Invoice_RecipientInformation_Billing.html'),
					   async (page) => page.setViewport({
						   width: 2048,
						   height: 2048,
						   deviceScaleFactor: 0.5
					   }),
					   async () => order = require('./resources/order_brad.json'),
					   async (order) => robot.fillRecipientInformationForm_Billing(order, page),
					   // Testing values
					   
					   async () => robot.series(
						   'Testing Billing Info page',
						   async () => robot.val('#billing_country_code'),
						   async (it:any) => it.should.equal(order.order_customer_country_code),
						   async () => robot.val('#billing_state'),
						   async (it:any) => it.should.equal(order.order_customer_state),
						   async () => robot.val('#billing_city'),
						   async (it:any) => it.should.equal(order.order_customer_city),
						   async () => robot.val('#billing_line1'),
						   async (it:any) => it.should.equal(order.order_customer_address),
						   async () => robot.val('#billing_line2'),
						   async (it:any) => it.should.equal(order.order_customer_address2),
						   async () => robot.val('#billing_postal_code'),
						   async (it:any) => it.should.equal(order.order_customer_zip),
					   ))												
	   })
	it('should open RecipientInformation_Shipping, fill data, click buttons',
	   async function() {
		   this.timeout(60000) // for that we should NOT use arrow functions
		   await robot.init()
		   let page:Page, order:any;
		   return robot
			   .series('loading Invoice_RecipientInformation_Billing page',
					   async () => page = await robot.goto('file://' + process.cwd() + '/test/resources/Invoice_RecipientInformation_Shipping.html'),
					   async (page) => page.setViewport({
						   width: 2048,
						   height: 2048,
						   deviceScaleFactor: 0.5
					   }),
					   async () => order = require('./resources/order_brad.json'),
					   async (order) => robot.fillRecipientInformationForm_Shipping(order, page),
					   async () => robot.series(
						   'Testing Shipping Info page',
						   async () => robot.val('#shipping_country_code').should.eventually.equal(order.order_shipping_country_code),
						   async () => robot.val('#shipping_state').should.eventually.equal(order.order_shipping_state),
						   async () => robot.val('#shipping_city').should.eventually.equal(order.order_shipping_city),
						   async () => robot.val('#shipping_line1').should.eventually.equal(order.order_shipping_address_one),
						   async () => robot.val('#shipping_line2').should.eventually.equal(order.order_shipping_address_two),
						   async () => robot.val('#shipping_postal_code').should.eventually.equal(order.order_shipping_zip)
					   ))												
	   })

	// TODO: add test that makes sure screenshot is created
})
