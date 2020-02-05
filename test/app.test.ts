import { App } from '../src/app'
import { PuppeteerRobot } from '../src/robot'
import { expect } from 'chai'

import * as http from 'http'

describe('Awesome app', () => {
    let app:App
    beforeEach('initialize App and Robot', () => {
				app = new App()
    })
    
		it('should create an instance', () => {
				expect(app).instanceOf(App)
				expect(app).has.property('botPP').not.null
		});
		
		it('should create an instance of Robot', () => {
				expect(app.botPP).instanceOf(PuppeteerRobot)
				expect(app.botPP).has.property('opts').not.null
		});

		it('should launch browser and local server', async () => {
				await app.init()
				expect(app.botPP).has.property('opts').not.null
        //console.log('opts:', app.botPP.opts)
				expect(app.botPP).has.property('browser').not.null

				return new Promise((resolve) =>
													 http.get({
															 hostname: 'localhost',
															 port: app.server_port,
															 path: '/',
															 agent: false  // Create a new agent just for this one request
													 }, (res) => {
															 res.on('data', (chunk) => {
																	 // making sure server is live
																	 expect(chunk.toString('utf-8')).to.equal('live')
															 })
															 res.on('end', resolve)
													 }))
		})
})
