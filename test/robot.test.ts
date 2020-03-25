import { expect } from 'chai';
import { Doer } from '../src/doer';
import { PuppeteerRobot } from '../src/robot';

describe('PuppeteerRobot', () => {
  let robot:PuppeteerRobot;
  before('initialize App and Robot', () => {
    robot = new PuppeteerRobot({
        headless: true,
        args: [
            '--force-device-scale-factor=0.5',
            '--display=:1',
        ]        
    });
    return robot.init();      
  });

  after('cleanup browser instance', () => {
      return robot.browser.close();
  });
  it('should create an instance of Robot', () => {
    expect(robot).instanceOf(PuppeteerRobot);
    expect(robot).has.property('opts').not.null;
  });

  it('should launch browser with some args', async function () {
    this.timeout(5000);
    expect(robot).has.property('opts').not.null;
    console.log('opts:', robot.opts);
    expect(robot).has.property('browser').not.null;
  });

  it('should open test page and fill data, click buttons', async function () {
    this.timeout(5000);
    return Doer
		  .series('loading test page',
                  async () => robot.goto(`file://${process.cwd()}/test/resources/index.html`),
        async () => robot.val('#tstInput1', '1'),
        async () => robot.type('#tstInput2', '2'),
        async () => robot.click('#tstButton'),
        async () => {
          const page = robot.currentPage;
          expect(await robot.val('#tstInput1'))
            .to.equal('1');
          expect(await robot.val('#tstInput2'))
            .to.equal('2');
          expect(await robot.val('#tstHidden'))
            .to.equal('set');
        });
  });
  // TODO: add test that makes sure screenshot is created
});
