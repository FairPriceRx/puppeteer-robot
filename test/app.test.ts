import { App } from '../src/app';
import { PuppeteerRobot } from '../src/robot';
import { expect } from 'chai';

describe('Awesome app', () => {
    let app:App
    beforeEach('initialize App and Robot', () => {
				app = new App();
    })
    
		it('should create an instance', () => {
				expect(app).instanceOf(App);
				expect(app).has.property('botPP').not.null;
		});
		
		it('should create an instance of Robot', () => {
				expect(app.botPP).instanceOf(PuppeteerRobot);
				expect(app.botPP).has.property('opts').not.null;
		});

		it('should launch browser with some args', async () => {
				await app.init()
				expect(app.botPP).has.property('opts').not.null;
        console.log('opts:', app.botPP.opts)
				expect(app.botPP).has.property('browser').not.null;
		});
});
