import { App } from '../src/app';
import { Doer } from '../src/doer';
import { expect } from 'chai';

describe('Doer class', () => {
	it('should create an instance', () => {
		const value = new Doer();
		expect(value).instanceOf(App);
	});
});
