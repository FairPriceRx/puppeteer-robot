// This is the application entry point
const express = require('express')

require('dotenv-flow').config()

const { PayPalRobot } = require('./payPalRobot')
var App = (function () {
    function App() {
				const that = this;
        console.log('Awesome App is running!');

				const server = express()
				const port = process.env.PUPPETEER_SERVER_PORT || 8080

				server.get('/', (req, res) => res.send('live'))
				server.post('/paypal/create_order',(req, res) => {
						req.on('data', async (order) => {
								const jsonOrder = JSON.parse(order)
								console.log(`Sending order to server: ${order}`)
								const botPP = that.botPP = new PayPalRobot({
										proxyUrl: process.env.PROXY_CFG,
										headless: false,
										slowMo: 25,
										args: [
												'--force-device-scale-factor=0.5',
												'--display=:1'
										]
								})
								await botPP.init()
								// logging in
								await botPP.login(process.env.PP_LOGIN,
																	process.env.PP_PASSWD)

								await botPP.createOrder(jsonOrder)

								botPP.currentPage.waitFor(5000); // waiting for order to be actually send
								
								await botPP.logout() // logs out and close browser
								res.send('OK')

								// that = botPP = app.botPP;page = that.currentPage;order = require('./order_json.json')
						})
				})

				server.listen(port, () => console.log(`Example app listening on port ${port}!`))
				
    }
    return App;
})();
exports.App = App;
var app = new App();
