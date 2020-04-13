import { Page } from 'puppeteer';
import { should, expect, use } from 'chai';
import { Doer } from '../src/doer';
import { PayPalRobot } from '../src/payPalRobot';

const countryTelephoneCode = require('country-telephone-code');

import chaiAsPromised = require('chai-as-promised');

describe('PayPalRobot', () => {
    let robot:PayPalRobot;

    before('initialize App and Robot', () => {
        use(chaiAsPromised);
        should();

        robot = new PayPalRobot({
            proxyUrl: process.env.PROXY_CFG,
            headless: true,
            slowMo: 25,
            args: [
                '--force-device-scale-factor=0.5',
                '--display=:1',
            ],
        });
        return robot.init()
    });

    after('cleanup browser instance', () => {
        console.log('Clearning browser, exitting puppeteer')
        return robot.browser.close()
    });

    it('should create an instance of Robot', () => {
        expect(robot).instanceOf(PayPalRobot);
        expect(robot).has.property('opts').not.null;
    });

    it('should launch browser with some args', async function () {
        expect(robot).has.property('opts').not.null;
        expect(robot).has.property('browser').not.null;
    });

    it('should create order for non-ISO country GB', async function () {
        this.timeout(5000);
        expect(robot.createOrder(require('./resources/order_1832.json'))).should.be.rejected;
    });

    it('should open Login test page and fill data, click buttons', async function () {
        this.timeout(60000); // for that we should NOT use arrow functions
        let page:Page;
        return Doer
            .series('loading test page',
                    async () => robot.goto(`file://${process.cwd()}/test/resources/Login.html`),
                    async (p:any) => (page = p).setViewport({
                        width: 2048,
                        height: 2048,
                        deviceScaleFactor: 0.5,
                    }),

                    async () => page.$eval('#btnLogin',
                                           (btnLogin:any, expect:any) => btnLogin.onclick = (evt:any) => {
                                               evt.stopPropagation();
                                               return false;
                                           }),
                    async () => robot.fillLoginForm('LOGIN', 'PWD', page),
                    async () => (await robot.val('#email')).should.equal('LOGIN'),
                    async () => (await robot.val('#password')).should.equal('PWD'));
    });

    it('should open CreateInvoice test page and fill data, click buttons', async function () {
        this.timeout(60000); // for that we should NOT use arrow functions
        let page:Page; let
        order:any;
        robot.fillRecipientInformationForm = (order:any, page:Page):Promise<any> =>
            // overriding with empty function
            Promise.resolve(true); // return fake `true`


        return Doer
            .series('loading Invoice page',
                    async () => robot.goto(`file://${process.cwd()}/test/resources/Invoice.html`),
                    async (p:any) => (page = p).setViewport({
                        width: 2048,
                        height: 2048,
                        deviceScaleFactor: 0.5,
                    }),
                    async () => page.$eval('#sendInvoice',
                                           (btnLogin:any, expect:any) => btnLogin.onclick = (evt:any) => {
                                               evt.stopPropagation();
                                               return false;
                                           }),
                    async () => order = require('./resources/order_brad.json'),
                    async (order:any) => robot.fillCreateInvoiceForm(order, page),
                    async () => Doer.series(
                        'Testing header invoice data',
                        async () => robot.val('#invoiceNumber').should.eventually.equal(order.order_id),
                        async () => robot.val('#issueDate').should.eventually.equal(order.order_date),
                        async () => robot.val('#invoiceTerms').should.eventually.equal('noduedate'),
                        // email
                        async () => robot.val('input[placeholder="Email address or name"]').should.eventually.equal(order.order_customer_email),
                        async () => Doer.series(
                            'Testing details invoice data',
                            async () => robot.fillOrderDetailsForm(order, page),
                            async () => robot.val('#itemName_0').should.eventually.equal(`Delivery Service #${order.order_id}`),
                            async () => robot.val('#itemQty_0').should.eventually.equal('1'),
                            async () => robot.val('#itemPrice_0').should.eventually.equal(order.order_subtotal),
                        ),
                    ));
    });

    it('should open RecipientInformationHeader test page and fill data, click buttons', async function () {
        this.timeout(60000); // for that we should NOT use arrow functions
        let page:Page; let
        order:any;
        return Doer
            .series('loading Invoice_RecipientInformation page',
                    async () => page = await robot.goto(`file://${process.cwd()}/test/resources/Invoice_RecipientInformation.html`),
                    async (page:any) => page.setViewport({
                        width: 2048,
                        height: 2048,
                        deviceScaleFactor: 0.5,
                    }),
                    async () => page.$eval('#saveRecInfo',
                                           (btnLogin:any, expect:any) => btnLogin.onclick = (evt:any) => {
                                               evt.stopPropagation();
                                               return false;
                                           }),
                    async () => order = require('./resources/order_brad.json'),
                    async (order:any) => robot.fillRecipientInformationFormHeader(order, page),
                    // Testing values
                    async () => Doer.series(
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
                        //                        async () => robot.delay(30000)
                    ));
    });

    it('should open RecipientInformation_Billing, fill data, click buttons',
       async function () {
           this.timeout(60000); // for that we should NOT use arrow functions
           let page:Page; let
           order:any;
           return Doer
               .series('loading Invoice_RecipientInformation_Billing page',
                       async () => page = await robot.goto(`file://${process.cwd()}/test/resources/Invoice_RecipientInformation_Billing.html`),
                       async (page:any) => page.setViewport({
                           width: 2048,
                           height: 2048,
                           deviceScaleFactor: 0.5,
                       }),
                       async () => order = require('./resources/order_brad.json'),
                       async (order:any) => robot.fillRecipientInformationFormBilling(order, page),
                       // Testing values

                       async () => Doer.series(
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
                       ));
       });
    it('should open RecipientInformation_Shipping, fill data, click buttons',
       async function () {
           this.timeout(60000); // for that we should NOT use arrow functions
           let page:Page; let
           order:any;
           return Doer
               .series('loading Invoice_RecipientInformation_Billing page',
                       async () => page = await robot.goto(`file://${process.cwd()}/test/resources/Invoice_RecipientInformation_Shipping.html`),
                       async (page:any) => page.setViewport({
                           width: 2048,
                           height: 2048,
                           deviceScaleFactor: 0.5,
                       }),
                       async () => order = require('./resources/order_brad.json'),
                       async (order:any) => robot.fillRecipientInformationFormShipping(order, page),
                       async () => Doer.series(
                           'Testing Shipping Info page',
                           async () => robot.val('#shipping_country_code')
                               .should.eventually.equal(order.order_shipping_country_code),
                           async () => robot.val('#shipping_state')
                               .should.eventually.equal(order.order_shipping_state),
                           async () => robot.val('#shipping_city')
                               .should.eventually.equal(order.order_shipping_city),
                           async () => robot.val('#shipping_line1')
                               .should.eventually.equal(order.order_shipping_address_one),
                           async () => robot.val('#shipping_line2')
                               .should.eventually.equal(order.order_shipping_address_two),
                           async () => robot.val('#shipping_postal_code')
                               .should.eventually.equal(order.order_shipping_zip),
                       ));
       });

    // TODO: add test that makes sure screenshot is created
});
