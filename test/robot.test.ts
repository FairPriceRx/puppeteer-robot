import { PuppeteerRobot } from '../src/robot' 
import { expect } from 'chai'

describe('Awesome app', () => {
    let robot:PuppeteerRobot
    beforeEach('initialize App and Robot', () => {
				robot = new PuppeteerRobot({});
    })
		
		it('should create an instance of Robot', () => {
				expect(robot).instanceOf(PuppeteerRobot)
				expect(robot).has.property('opts').not.null;
		});

		it('should launch browser with some args', async () => {
				await robot.init()
				expect(robot).has.property('opts').not.null;
        console.log('opts:', robot.opts)
				expect(robot).has.property('browser').not.null;
		});
});
