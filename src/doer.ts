class Doer {
  static async series(whatToDo: string, ...args:any) {
    if (args.length === 0) throw new Error('Doer.series should be called with multiple arguments');
    const reduceFunc = (promiseChain:Promise<any>, currentTask:any) => promiseChain
      .then(async (chainResults:any[]) => currentTask(Doer.lastDefined(chainResults))
      .then(async (result:any) => {
        // should call await here
        await Doer.delay(500);
        return result;
      })
            // passing recent argument to next call
      .then((currentResult:any) => [...chainResults, currentResult]));
    return args
      .reduce(reduceFunc, Promise.resolve([]))
      .then(async (results: any) => {
        const now:number = Date.now();
        const screenshotFileName = `${now}-${whatToDo.toLowerCase().split(/\s/).join('_')}.png`;

        console.log(`Finished ${screenshotFileName}`);
        return results;
      })
  }

  static lastDefined(arr:any[]):any {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      if (arr[i] !== undefined) return arr[i];
    }
    return undefined;
  }

  static async delay(ms:number) {
    return new Promise((resolve:any) => setTimeout(resolve, ms));
  }
}

export { Doer };
