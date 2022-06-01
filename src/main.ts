import * as core from '@actions/core'
import {Filetype, processChangedFiles} from './file_manager'
import {PackageManagerFactory} from './package_manager'
import {GithubProvider} from './provider'
import * as constant from './constant'

// todo: add PackageManager types and ipmlementations for js & rust
// todo: add PackageManagerFactory?

enum Semvar {
  NONE = 0,
  PATCH = 1,
  MINOR = 2,
  MAJOR = 3
}

const msgToSemvar: Record<string, Semvar> = {
  ['patch']: Semvar.PATCH,
  ['minor']: Semvar.MINOR,
  ['major']: Semvar.MAJOR
}

const isValidReview = (review: any): boolean => {
  const author_association = review.author_association.toLowerCase()
  const state = review.state.toLowerCase()

  console.log('check VALID_AUTHOR_ASSOCIATIONS')
  if (!constant.VALID_AUTHOR_ASSOCIATIONS.includes(author_association))
    return false
  console.log('check VALID_REVIEW_STATES')
  if (!constant.VALID_REVIEW_STATES.includes(state)) return false

  const body = review.body
    .toLowerCase()
    .split('\n')
    .filter((t: string) => t.length > 0)

  console.log('body: ', body)

  // we only need to match 1 line of the body
  const bodyContainsValidVersioningMessage = body.reduce(
    (prev: boolean, curr: string) => {
      return prev || constant.VERSIONING_REGEX.test(curr)
    },
    false
  )

  console.log(
    'bodyContainsValidVersioningMessage: ',
    bodyContainsValidVersioningMessage
  )

  return bodyContainsValidVersioningMessage
}

const resolveSemvar = (a: Semvar, b: Semvar): Semvar => (a > b ? a : b)

// now, we have all approved comments in chronological order. process them to find the greatest common factor
// wrt versioning scope (semvar, package, language)
// @dev: for now, we are just going to have 1 scope
const transformIntoSemvar = (review: any): Semvar => {
  let result: Semvar = Semvar.NONE

  // find review body text with matching versioning messages
  const versioningMessages = review.body
    .toLowerCase()
    .split(constant.VERSIONING_REGEX)
    .filter((r: string) => r !== undefined && r.length > 0)

  console.log('versioningMessages: ', versioningMessages)

  // we shouldn't hit this - mostly a sanity check.
  if (versioningMessages.length === 0) return result
  if (versioningMessages.length > 1) {
    console.error(
      `Found multiple versioning messages in the same comment. Only processing the first: ${versioningMessages[0]}`
    )
  }

  console.log(
    'msgToSemvar[versioningMessages[0]]: ',
    msgToSemvar[versioningMessages[0]]
  )

  return msgToSemvar[versioningMessages[0]]
}

const isDefined = (param: string | null | undefined) => {
  return param !== null && param !== undefined && param.length > 0
}

const run = async (): Promise<void> => {
  const owner = core.getInput(constant.REPO_OWNER_INPUT)
  const repo = core.getInput(constant.REPO_NAME_INPUT)
  const token = core.getInput(constant.TOKEN_NAME_INPUT)
  const pull_number: number = +core.getInput(constant.PULL_REQUEST_NUMBER_INPUT)
  const target_package = core.getInput(constant.TARGET_PACKAGE_NAME)
  const target_language = core.getInput(constant.TARGET_LANGUAGE_NAME)

  console.log('owner: ', owner)
  console.log('repo: ', repo)
  console.log('pull_number: ', pull_number)
  console.log('target_package: ', target_package)
  console.log('target_language: ', target_language)

  // todo: fill default with all of them
  // const target_languages = !target_language
  //   ? ['rs', 'js', 'ts']
  //   : [target_language]

  // const packageManagerFactory = new PackageManagerFactory(target_languages)
  const ghProvider = new GithubProvider(token, owner, repo)
  const data = await ghProvider.fetchPullRequestReviews(pull_number)
  console.log('data: ', data)

  const semvarCommand = data
    .filter((r: any) => isValidReview(r))
    .map((r: any) => transformIntoSemvar(r))
    .reduce((prev: Semvar, curr: Semvar) => {
      console.log('prev: ', prev)
      console.log('curr: ', curr)

      return resolveSemvar(prev, curr)
    }, Semvar.NONE)

  // exit early if no package udpates to make
  if (semvarCommand === Semvar.NONE) return

  const changedFiles = await ghProvider.fetchAllChangedFiles(pull_number)
  console.log('changedFiles: ', changedFiles)
  // const changes: Map<string, Set<Filetype>> = processChangedFiles(changedFiles)

  // // pass the changes to the package manager factory?
  // const changedPackages = Array.from(changes.keys()).filter(pkg => {
  //   return isDefined(target_package) ? target_package === pkg : true
  // })

  // for (const [pkg, changedFiletypes] of changes.entries()) {
  //   for (const changedFiletype of changedFiletypes) {
  //     // if (changedFiletype !== target_languages) // don't do it
  //     // cd to relative dir
  //     // const packageManager = packageManagerFactory.get()
  //     // packageManager.updateVersion(semvarCommand)
  //     // packageManager.publish()
  //   }
  // }

  // navigate to directory

  // for each change package, register
  // semvarCommand = patch | minor | major
  // todo: filter if target_package
  // todo: filter if target_language
}

run()
