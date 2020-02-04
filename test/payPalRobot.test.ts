import { PayPalRobot } from '../src/payPalRobot'

import * as chai from "chai";
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

// Then either:
var expect = chai.expect;
// or:
var assert = chai.assert;
// or:
chai.should();
// according to your preference of assertion style

describe('PayPalRobot', () => {
    let robot:PayPalRobot
		
    beforeEach('initialize App and Robot', () => {
				robot = new PayPalRobot({
						proxyUrl: process.env.PROXY_CFG,
						headless: false,
						slowMo: 25,
						args: [
								'--force-device-scale-factor=1.0',
								'--display=:1'
						]
				})

    })

		afterEach('cleanup browser instance', () => {
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
        console.log('opts:', robot.opts)
				expect(robot).has.property('browser').not.null;
		});

		it('should open Login test page and fill data, click buttons', async function(){
				this.timeout(60000)
				await robot.init()
				let page:any;
				return robot
						.series('loading test page',
										async () => robot.goto('file://' + process.cwd() + '/test/resources/Login.html'),
										async (p) => (page = p).$eval('#btnLogin',
																							 (btnLogin:any, expect:any) => 																				 btnLogin.onclick = (evt:any) => {
																									 evt.stopPropagation();
																									 return false
																							 }),										
										async () => robot.fillLoginForm('LOGIN', 'PWD', page),
										async () => (await robot.val('#email')).should.equal('LOGIN'),
										async () => (await robot.val('#password')).should.equal('PWD')
									 )
		})
		// TODO: add test that makes sure screenshot is created
})
