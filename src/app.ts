// This is the application entry point

import * as express from 'express'
import { createTerminus } from '@godaddy/terminus'

import * as dotenv from 'dotenv-flow'
dotenv.config()

import { PayPalRobot } from './payPalRobot'

class App {
	public server:any;
	public server_port:number;

	public botPP:any;
	
	constructor() {
		const that = this;
        console.log('Robot App is running!');

		this.server = express()
		this.server_port = parseInt(process.env.PUPPETEER_SERVER_PORT) || 8080

		this.botPP = new PayPalRobot({
			proxyUrl: process.env.PROXY_CFG,
			headless: false,
			slowMo: 25,
			args: [
				'--force-device-scale-factor=0.5',
				'--display=:1'
			]
		})

		this.server.get('/', (req:any, res:any) => res.send('live'))
		this.server.post('/paypal/create_order',(req:any, res:any) => {
			req.on('data', async (order:string) => {
				const jsonOrder:any = JSON.parse(order)
				console.log(`Sending order to server: ${order}`)
			    // logging in
				await this.botPP.login(process.env.PP_LOGIN, process.env.PP_PASSWD)

				await this.botPP.createOrder(jsonOrder)

				await this.botPP.currentPage.waitFor(2000); // waiting for order to be actually send
				
				//await botPP.logout() // logs out and close browser
				res.send('OK')

				// that = botPP = app.botPP;page = that.currentPage;order = require('./order_json.json')
			})
		})
	}

	public async init(){
		await this.botPP.init()
		console.log(`Login info: ${process.env.PP_LOGIN} and ${process.env.PP_PASSWD}`)

        function onSignal () {
            console.log('server is starting cleanup')
            // start cleanup of resource, like databases or file descriptors
        }

        async function onHealthCheck () {
            // checks if the system is healthy, like the db connection is live
            // resolves, if health, rejects if not
        }

        createTerminus(this.server, {
            signal: 'SIGINT',
            healthChecks: { '/healthcheck': onHealthCheck },
            onSignal
        })        
		
		this.server.listen(this.server_port,
                           () => console.log(`Example app listening on port ${this.server_port}!`))
		
	}
}

export { App };

