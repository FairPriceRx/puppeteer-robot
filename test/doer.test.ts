import { Doer, AsyncFunction } from '../src/doer';
import { expect, should } from 'chai'

describe('Doer class', function(){
    this.timeout(5000)
    
	it('should create an instance', () => {
		const value = new Doer();
		expect(value).instanceOf(Doer);
        expect(Doer.prototype.do).to.not.be.null;
	});

    it('`lastDefined` should return recent item in array', () => {
        expect(Doer.lastDefined([1,2,3])).to.equal(3)
        expect(Doer.lastDefined([1,2,undefined])).to.equal(2)
        expect(Doer.lastDefined([1,2,null])).to.be.null
        expect(Doer.lastDefined([undefined])).to.equal(undefined)
        expect(Doer.lastDefined([])).to.equal(undefined)
        
    })

    it('`do` should invoke asyncs one by one', function(done){
        this.timeout(5000)
        
        const doer =  new Doer()
        const { delay } = doer;
        doer.do('Test asyncs',
                async () => 1,
                async (a:number) => delay(1000),                
                async (a:number) => a + 1,
                async (a:number) => delay(1000),
                async (a:number) => a + 1,
                async (a:number) => delay(1000),            
                async (a:number) => a + 1,
                async (a:number) => delay(1000),            
                async (a:number) => a + 1,
               ).then((results:number[]) => {
                   console.log(results)
                   expect(results)
                       .to.deep.equal([
                           1,
                           undefined,
                           2,
                           undefined,
                           3,
                           undefined,
                           4,
                           undefined,
                           5])
                   done()
               })
        
        
    })
});
