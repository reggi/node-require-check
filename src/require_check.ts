import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import * as util from 'util';

/** creates a temp directory where inits npm and installs provided local module
 * via npm install <local-module>, then evaluates "require(<module-name>)" from
 * the temp directory using node, ensures that package is can be required
 * reliably, dependencies are listed in npm, and transpilation has occurred. */
export class RequireCheck {
  static exec = util.promisify(childProcess.exec);
  static template = {
    name: 'require-check-template',
    version: '1.0.0',
    description: 'This is a temporary package.json to test',
  };
  static async npmInstall(install: string, cwd: string) {
    return await RequireCheck.exec(`npm install ${install}`, {cwd});
  }
  static async requireModule(pkg: {name: string}, cwd: string) {
    return await RequireCheck.exec(`node -e "require('${pkg.name}')"`, {cwd});
  }
  static async check(modLocation: string) {
    const dir = os.tmpdir();
    const id = crypto.randomBytes(20).toString('hex');
    const destLocation = path.join(dir, 'require-check', id);
    await fs.promises.mkdir(destLocation, {recursive: true});
    const destPkg = path.join(destLocation, 'package.json');
    await fs.promises.writeFile(
      destPkg,
      JSON.stringify(RequireCheck.template, null, 2)
    );
    modLocation = path.resolve(modLocation);
    const modStat = await fs.promises.lstat(modLocation);
    if (!modStat.isDirectory()) {
      throw new Error('module path is not a directory');
    }
    const pkgLocation = path.join(modLocation, 'package.json');
    const pkgStat = await fs.promises.lstat(pkgLocation);
    if (!pkgStat.isFile()) {
      throw new Error('package.json is not present in module');
    }
    const pkgRaw = await fs.promises.readFile(pkgLocation, 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    await RequireCheck.npmInstall(modLocation, destLocation);
    await RequireCheck.requireModule(pkg, destLocation);
    await fs.promises.rmdir(destLocation, {recursive: true});
  }
  static async cli(process: NodeJS.Process) {
    const modLocation = process.argv.slice(2)[0];
    try {
      if (typeof modLocation !== 'string') {
        throw new Error('invalid module location');
      }
      await RequireCheck.check(modLocation);
      process.stdout.write('success, module passed required check\n');
      process.exit(0);
    } catch (e) {
      process.stderr.write(`${e.message}\n`);
      process.exit(1);
    }
  }
}
