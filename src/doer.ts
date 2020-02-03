class Doer {
		constructor() {
		}

		do(...args){
				console.log(args)
				return Array.prototype.slice.call(args)
						.reduce((promiseChain, currentTask) => {
								return promiseChain
										.then(chainResults =>
													currentTask()
													.then(currentResult =>
																[ ...chainResults, currentResult ])
												 );
						}, Promise.resolve([]))

		}
}

new Doer().do(
		'Attempting to call console.log 3',
		async => new Promise((res) => setTimeout(res, 3000)),
		async => console.log('Done 1'),
		async => new Promise((res) => setTimeout(res, 2000)),
		async => console.log('Done 2'),
		async => new Promise((res) => setTimeout(res, 1000)),
		async => console.log('Done 3')		
)
