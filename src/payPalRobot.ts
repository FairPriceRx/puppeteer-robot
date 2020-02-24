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

/*  eslint-disable no-unused-vars */
import { Page } from 'puppeteer';
import { PuppeteerRobot } from './robot';
import { Doer } from './doer';

const countryTelephoneCode = require('country-telephone-code');
const lookup = require('country-code-lookup');

class PayPalRobot extends PuppeteerRobot {
    public browser: any

    async fillLoginForm(login:string, pwd:string, page:Page) {
      return Doer.series(
        'Filling login form with login and password',
        async () => page.evaluate(() => {
          (document.querySelector('#email') as HTMLInputElement).value = '';
          return '';
        }),
        async () => this.type('#email', login),
        async () => page.$('#btnNext'),
        async (p:any) => {
          if (p) {
            return page.click('#btnNext');
          } return Promise.resolve(true);
        },
        async () => page.waitForSelector('#password'),
        async () => page.focus('#password'),
        async () => this.type('#password', pwd),
      );
    }

    async login(login:string, password:string) {
      // LOGIN
      const page:Page = await this.goto('https://www.paypal.com/us/signin');

      return Doer.series(
        'Login to PayPal',
        async () => page.setViewport({
          width: 1280,
          height: 1024,
          deviceScaleFactor: 0.75,
        }),

        async () => page.waitFor(700),
        async () => {
          console.log(page.url());
          if (page.url() === 'https://www.paypal.com/us/signin') {
            return Doer.series(
              'Filling login form',
              async () => this.fillLoginForm(login, password, page),
              // hitting login button
              async () => page.$eval('#btnLogin', (el:any) => el.click()),
              async () => page.waitFor(5000), // change to waitForNavigation
            );
          } return Promise.resolve(true);
        },
      );
    }

    async fillRecipientInformationFormHeader(order: any, page: Page): Promise<any> {
      return Doer.series('Fill Recipient Information Form Header',
        async () => page.waitForSelector('#recipientEmail'),
        async () => this.val('#recipientEmail', order.order_customer_email),
        async () => this.val('#bill_first_name', order.order_customer_name),
        async () => this.val('#bill_last_name', order.order_customer_surname),
        async () => page.select('#billing_phone_country', countryTelephoneCode(order.order_customer_country_code)[0] as string),
        async () => this.val('#bill_phone', order.order_customer_phone),
        async () => page.$eval('#saveToContactBook', (check:any) => check.click()));
    }

    async fillRecipientInformationFormBilling(order: any, page:Page):Promise<any> {
      return Doer.series('Fill Recipient Information Form Billing',
        async () => page.waitForSelector('#billing_country_code'),
        // setting Billing Info
        async () => page.select('#billing_country_code', order.order_customer_country_code),
        async () => page.waitFor(2000), // let state control change
        async () => (order.order_customer_country_code === 'US'
          ? this.type('#billing_state', order.order_customer_state) : Promise.resolve(true)),
        async () => this.val('#billing_city', order.order_customer_city),
        async () => this.val('#billing_line1', order.order_customer_address),
        async () => this.val('#billing_line2', order.order_customer_address2),
        async () => this.val('#billing_postal_code', order.order_customer_zip));
    }

    async fillRecipientInformationFormShipping(order:any, page: Page): Promise<any> {
      return Doer.series('Filling Shipping part of the form',
        async () => this.val('#shipping_first_name', order.order_shipping_first_name),
        async () => this.val('#shipping_last_name', order.order_shipping_last_name),
        async () => this.val('#shipping_country_code', order.order_shipping_country_code),
        async () => this.val('#shipping_line1', order.order_shipping_address_one),
        async () => this.val('#shipping_line2', order.order_shipping_address_two),
        async () => this.val('#shipping_city', order.order_shipping_city),
        async () => this.val('#shipping_state', order.order_shipping_state),
        async () => this.val('#shipping_postal_code', order.order_shipping_zip),
        async () => page.waitFor(200),
        async () => page.$eval('#saveShippingToContact', (check:any) => check.click()));
    }

    static async fillRecipientInformationFormLanguage(order: any, page: Page): Promise<any> {
      const langCountryCode = await page.$('#lang_country_code');
      if (langCountryCode) {
        await page.select('#lang_country_code', order.order_customer_country_code);
      }

      await page.select('#bill_language', 'en_US');
    }

    async fillRecipientInformationForm(order:any, page:Page):Promise<any> {
      await this.fillRecipientInformationFormHeader(order, page);

      await page.$eval('.reciEditHead.reciHead', (el:any) => el.click());
      await page.waitFor(700);

      await this.fillRecipientInformationFormBilling(order, page);

      await page.$eval('.reciEditHead.shipHead', (el:any) => el.click());
      await page.waitFor(700);

      await this.fillRecipientInformationFormShipping(order, page);

      await page.$eval('.reciEditHead.langHead', (el:any) => el.click());
      await page.waitFor(700);

      await PayPalRobot.fillRecipientInformationFormLanguage(order, page);
      //        await page.waitFor(60000 * 1)

      await page.$eval('#saveRecInfo', (check:any) => check.click());
      await page.waitFor(700);

      return Promise.resolve(true); // return fake `true
    }

    async fillOrderDetailsForm(order:any, page:Page):Promise<any> {
      await page.waitForSelector('#itemName_0');

      await this.val('#itemName_0', `Delivery Service #${order.order_id}`);
      await this.val('#itemQty_0', '1');
      await this.val('#itemPrice_0', order.order_subtotal);

      if (parseInt(order.order_subtotal, 10) > parseInt(process.env.MIN_DISCOUNT_AMOUNT, 10)) {
        await this.val('#invDiscount', process.env.DISCOUNT);
      }

      if (order.order_shipping_cost) {
        await this.val('#shippingAmount',
                           order.order_shipping_cost as string);
      }
      return Promise.resolve(true); // return fake true
    }

    async fillCreateInvoiceForm(order:any, page:Page):Promise<any> {
      // invoice information
      return Doer.series('Fill create Invocie Form',
        async () => page.waitForSelector('#invoiceNumber'),
        async () => this.val('#invoiceNumber', order.order_id),

        async () => this.val('#issueDate', order.order_date),
        async () => page.keyboard.down('Enter'),
        async () => page.keyboard.up('Enter'),
        async () => page.select('#invoiceTerms', 'noduedate'),

        async () => this.type('#reference', ''),

        async () => page.focus('input[placeholder="Email address or name"]'),
        async () => page.keyboard.type(order.order_customer_email),
        async () => page.keyboard.down('Tab'),
        async () => page.keyboard.up('Tab'));
    }

    async createOrder(order:any) {
      /* eslint-disable no-param-reassign */
      order.order_customer_country = lookup.byInternet(order.order_customer_country_code).country;

      const page:Page = await this.goto('https://www.paypal.com/invoice/create', { waitUntil: 'networkidle2' });
      // ORDER

      Doer.series(
        'Creating order',
        async () => page.setViewport({
          width: 1280,
          height: 1024,
        }),

        async () => this.fillCreateInvoiceForm(order, page),
        async () => page.waitForSelector('#addNewBilling'),
        async () => page.$eval('#addNewBilling', (el:any) => el.click()),
        async () => this.fillRecipientInformationForm(order, page),
        async () => this.fillOrderDetailsForm(order, page),
        async () => {
          if (await page.$('#sendSplitButton')) {
            await page.evaluate(() => {
              const el = document.querySelector('#sendSplitButton');
              el.scrollIntoView();
            });
            await page.$eval('#sendInvoice', (el:any) => el.click());
          }
        },
        async () => page.waitForNavigation(), // change to waitForNavigation
      );
    }

    /**
     * Logs out from PayPal and close browser
     */
    static async logout() {
      //        await this.currentPage.close();
    }
}

export { PayPalRobot };
