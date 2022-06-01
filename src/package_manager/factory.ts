import {NpmPackageManager} from './npm'
import {CargoPackageManager} from './cargo'

export interface PackageManager {
  // package manager naem
  name: String
  // compatible filetypes
  filetypes: string[]

  // update(bump: Semvar): void;
  // publish(arg: any):void;
}

export class PackageManagerFactory {
  packageManagers: Map<string, PackageManager>

  constructor(filetypes: string[]) {
    this.packageManagers = new Map<string, PackageManager>()

    filetypes.forEach(filetype => {
      this._register(filetype, this._mapToPackageManager(filetype))
    })
  }

  _mapToPackageManager = (filetype: string): PackageManager => {
    let packageManager: PackageManager
    if (['js', 'ts'].includes(filetype)) {
      packageManager = new NpmPackageManager('NPM', ['js', 'ts'])
    } else if (filetype === 'rs') {
      packageManager = new CargoPackageManager('Cargo', ['rs'])
    } else {
      throw new Error(`Nonexisting package manager for filetype: ${filetype}`)
    }

    return packageManager
  }

  _register = (ft: string, pm: PackageManager) =>
    this.packageManagers.set(ft, pm)
}
