# [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

# puppeteer-robot

## Description

This is automated PayPal order creating robot. Supports login, createOrder operations

## Installation

### Prerequisties
- nodejs v13.7.0 or above should be installed
- recent npm and/or yarn should be installed
- git should be installed
- TurboVNC server should be installed and running on display :1 in order to get 
  `puppeteer-robot` working in non-headless environment

### Cloning, building and running robot
```
	$ git clone https://github.com/FairPriceRx/puppeteer-robot.git
	$ cd puppeteer-robot
	$ yarn
	$ yarn test # make sure tests does not fail
	$ cp .env .env.local # now edit .env.local putting correct values to all keys
	$ yarn start
``` 

## Configuration

Configuration options are all set via environment variables (.env.local file)
During installtion phase please copy `.env` to `.env.local`
*NOTE!* Never store `.env.local` or any other files containing significant settings
(logins/passwords and such) into Git repository!
In current version `.env.local` is globally ignored via `.gitignore`

## Usage

Once robot is started via `node index.js` it's listening to `8080` port by default
(PUPPETEER_SERVER_PORT=8080 should be set in `.env.local`)

To invoke PayPal create order routine POST request should be sent to
http://localhost:8080/paypal/create_order endpoing with JSON in POST message body. If you're going
to send POST requriest from another machine, make sure endpoing is globally available by setting up
correct rotings (e.g. via Elastic Load Balancer for AWS)

To check vitality - just test `http://localhost:8080/` endpoint. `live` text should be returned

## Release Notes

### 1.0.0
- Listens on HTTP server for POST requests to `/paypal/create_order`
- Run puppeteer (Google Chrome), performs Login to PayPal if needed, opens `/invocies/create` PayPal
  endpoint and create the order using JSON data provided
- Cyrillic symbols are supported

Fixes/Features:
- Initial release

## License

MIT © [y](https://github.com/agutsal/)

**Enjoy!**

[npm-image]: https://badge.fury.io/js/puppeteer-robot.svg
[npm-url]: https://npmjs.org/package/puppeteer-robot
[travis-image]: https://travis-ci.org/agutsal/puppeteer-robot.svg?branch=master
[travis-url]: https://travis-ci.org/agutsal/puppeteer-robot
[daviddm-image]: https://david-dm.org/agutsal/puppeteer-robot.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/agutsal/puppeteer-robot
[coveralls-image]: https://coveralls.io/repos/agutsal/puppeteer-robot/badge.svg
[coveralls-url]: https://coveralls.io/r/agutsal/puppeteer-robot
