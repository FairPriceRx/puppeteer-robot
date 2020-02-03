type AsyncFunction = (...args:any[]) => Promise<any>

class Doer {
	async series(whatToDo: string, ...args:AsyncFunction[]){
		if(args.length === 0)
			throw "Doer.do() should be called with multiple arguments"
        let reduceFunc = (promiseChain:Promise<any>, currentTask:AsyncFunction) => 
			promiseChain
            .then((chainResults:any[]) =>
				  currentTask(Doer.lastDefined(chainResults))
                  // passing recent argument to next call1
                  .then((currentResult) => [ ...chainResults, currentResult ]))
		return args
			.reduce(reduceFunc, Promise.resolve([]))
			.then((results) => {
                let now:number = Date.now()
                const screenshotFileName =
                    now + '-' +
                    whatToDo
                    .toLowerCase()
                    .split(/\s/)
                    .join('_')
                
                console.log(`Finished ${screenshotFileName}`)
                return results
            })
	}
    static lastDefined(arr:any[]):any {
        for(let i = arr.length - 1;i >= 0;i--){
            if(arr[i] !== undefined)
                return arr[i]
        }
        return undefined
    }
    async delay(ms:number) {
        return new Promise((resolve:any) => setTimeout(resolve, ms));
    }
        
}

export { Doer, AsyncFunction }
