class Doer {
		async do(...args){
				let fileSuffix
				if(args.length === 0){
						throw "Doer.do() should be called with multiple arguments"
				}
				if(typeof(args[0] === 'string')){
						fileSuffix = args[0]
						args = args.slice(1)
				}

				console.log(args)
				return args
						.reduce((promiseChain, currentTask) => 
										promiseChain.then(chainResults =>
																			currentTask().then(currentResult => [ ...chainResults, currentResult ])), Promise.resolve([]))
						.then(() => console.log(`Finished ${Date.now()}-${fileSuffix.toLowerCase().split(/\s/).join('_')}`))
		}
}

let doer = new Doer();
doer.do(
		'Starting timer hits',
		async () => console.log("Start"),
		async () => new Promise((resolve) => setTimeout(() => resolve(),	2000)),
		async () => console.log("Hit #1"),
		async () => new Promise((resolve) => setTimeout(() => resolve(),	2000)),
		async () => console.log("Hit #2"),
		async () => new Promise((resolve) => setTimeout(() => resolve(),	2000)),
		async () => console.log("End")
).then(() => console.log('I\'m over'))
