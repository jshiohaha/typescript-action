import {PackageManager} from './factory'

export class NpmPackageManager implements PackageManager {
  name: string
  filetypes: string[]

  constructor(name: string, filetypes: string[]) {
    this.name = name
    this.filetypes = filetypes
  }
}
