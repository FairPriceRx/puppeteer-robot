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
				if(req.header('Random-id')){
                    // random Integer in [2000:9999] range
                    jsonOrder.order_id = Math.round(Math.random() * (9999 - 2000) + 2000);
                    console.log(`New order_id created: ${jsonOrder.order_id}`)
				}
				console.log(`Sending order to server: ${order}`)
				// logging in
				await this.botPP.series(
					'Processing order',
					async() => this.botPP.login(process.env.PP_LOGIN, process.env.PP_PASSWD),
					async() => this.botPP.createOrder(jsonOrder),
					async() => this.botPP.currentPage.waitFor(5000), // waiting for order to be actually send
					async() => this.botPP.logout(), // logs out and close browser
					async() => res.send('OK')
				)
			})
		})
	}

	public async init(){
		await this.botPP.init()
		console.log(`Login info: ${process.env.PP_LOGIN} and ${process.env.PP_PASSWD}`)

        function onSignal () {
            console.log('server is starting cleanup');
            return Promise.all([
                // your clean logic, like closing database connections
                Promise.resolve() // fake cleanup
            ]);
        }

        async function onShutdown () {
            console.log('cleanup finished, server is shutting down');
        }

        async function onHealthCheck () {
            return Promise.resolve(
                // optionally include a resolve value to be included as
                // info in the health check response
            )
        }

        function beforeShutdown () {
            // given your readiness probes run every 5 second
            // may be worth using a bigger number so you won't
            // run into any race conditions
            return new Promise(resolve => {
                setTimeout(resolve, 5000)
            })
        }
        
        createTerminus(this.server, {
            signal: 'SIGINT',
            healthChecks: {
                '/healthcheck': onHealthCheck,
                //                verbatim: true // [optional = false] use object returned from /healthcheck verbatim in response
            },
            //            caseInsensitive: false, // [optional] whether given health checks routes are case insensitive (defaults to false) 

            // cleanup options
            timeout: 1000, // [optional = 1000] number of milliseconds before forceful exiting
            //            signal,        // [optional = 'SIGTERM'] what signal to listen for relative to shutdown
            //            signals,       // [optional = []] array of signals to listen for relative to shutdown
            beforeShutdown,// [optional] called before the HTTP server starts its shutdown
            onSignal,      // [optional] cleanup function, returning a promise (used to be onSigterm)
            onShutdown,    // [optional] called right before exiting
            //onSendFailureDuringShutdown,     // [optional] called before sending each 503 during shutdowns
            // both
            logger:console.error.bind(console) // [optional] logger function to be called with errors
            
        })
		
		this.server.listen(this.server_port,
                           () => console.log(`Example app listening on port ${this.server_port}!`))
		
	}
}

export { App };

