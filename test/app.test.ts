import { App } from '../src/app';
import { PuppeteerRobot } from '../src/robot';
import { expect } from 'chai';

describe('Awesome app', () => {
	it('should create an instance', () => {
		const value = new App();
		expect(value).instanceOf(App);
	});
	it('should create an instance of Robot', () => {
			const value = new PuppeteerRobot({});
		expect(value).instanceOf(PuppeteerRobot);
	});
});
