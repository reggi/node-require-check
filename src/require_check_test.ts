import * as sinon from 'sinon';
import {expect} from 'chai';
import {RequireCheck} from './require_check';
import * as fs from 'fs';
import * as path from 'path';

const lodashStdout = [
  '+ lodash@4.17.19\n',
  'updated 1 package and audited 522 packages in 4.735s\n',
  '\n',
  '57 packages are looking for funding\n',
  '  run `npm fund` for details\n',
  '\n',
  'found 0 vulnerabilities\n',
  '\n',
].join('');

describe('RequireCheck', () => {
  let execStub: sinon.SinonStub;
  afterEach(() => {
    sinon.restore();
  });

  // context('sinon', () => {
  //   it('should properly stub the method', () => {
  //     let value = false;
  //     class Example {
  //       static duck() {
  //         value = true;
  //         return true;
  //       }
  //     }
  //     sinon.stub(Example, 'duck').returns(false);
  //     expect(Example.duck()).to.equal(false);
  //     expect(value).to.equal(false);
  //   });
  // });

  context('.npmInstall()', () => {
    it('should fire exec', async () => {
      execStub = sinon.stub(RequireCheck, 'exec').resolves({
        stdout: lodashStdout,
        stderr: '',
      });
      const result = await RequireCheck.npmInstall('lodash', './');
      expect(result).to.deep.equal({stdout: lodashStdout, stderr: ''});
      expect(execStub.args[0]).to.deep.equal([
        'npm install lodash',
        {cwd: './'},
      ]);
    });
  });

  context('.requireModule()', () => {
    it('should fire exec', async () => {
      execStub = sinon.stub(RequireCheck, 'exec').resolves({
        stdout: '',
        stderr: '',
      });
      const result = await RequireCheck.requireModule({name: 'url'}, './');
      expect(result).to.deep.equal({stdout: '', stderr: ''});
      expect(execStub.args[0]).to.deep.equal([
        'node -e "require(\'url\')"',
        {cwd: './'},
      ]);
    });
  });

  context('.check()', () => {
    const dir = path.join(__dirname, '../examples');
    const all = fs.readdirSync(dir);
    const examples = all.filter(e => e.match(/^error|^valid/));
    examples.forEach(example => {
      it(`should use example "${example}"`, async () => {
        const full = path.join(dir, example);
        let error = undefined;
        try {
          await RequireCheck.check(full);
        } catch (e) {
          error = e;
        }
        if (example.match('^error')) expect(error).to.not.equal(undefined);
        if (example.match('^valid')) expect(error).to.equal(undefined);
      });
    });
  });

  context('.cli()', () => {
    const dir = path.join(__dirname, '../examples');
    const all = fs.readdirSync(dir);
    const examples = all.filter(e => e.match(/^error|^valid/));
    examples.forEach(example => {
      it(`should use example "${example}"`, async () => {
        const full = path.join(dir, example);

        const process = {
          argv: ['skip', 'skip', full],
          stdout: {
            write: sinon.stub(),
          },
          stderr: {
            write: sinon.stub(),
          },
          exit: sinon.stub(),
        };

        try {
          await RequireCheck.cli((process as unknown) as NodeJS.Process);
        } catch (e) {
          // noop
        }
        if (example.match('^error')) {
          expect(process.exit.args).to.deep.equal([[1]]);
        }
        if (example.match('^valid')) {
          expect(process.exit.args).to.deep.equal([[0]]);
        }
      });
    });

    it('should throw error if no location is passed in', async () => {
      const process = {
        argv: ['skip', 'skip'],
        stdout: {
          write: sinon.stub(),
        },
        stderr: {
          write: sinon.stub(),
        },
        exit: sinon.stub(),
      };

      try {
        await RequireCheck.cli((process as unknown) as NodeJS.Process);
      } catch (e) {
        // noop
      }
      expect(process.exit.args).to.deep.equal([[1]]);
    });
  });
});
