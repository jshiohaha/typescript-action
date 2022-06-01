export const REPO_OWNER_INPUT = 'repo-owner'
export const REPO_NAME_INPUT = 'repo-name'
export const TOKEN_NAME_INPUT = 'auth-token'
export const PULL_REQUEST_NUMBER_INPUT = 'pull-number'
export const TARGET_PACKAGE_NAME = 'package'
export const TARGET_LANGUAGE_NAME = 'language'

// https://github.com/octokit/octokit.graphql.net/blob/master/Octokit.GraphQL/Model/CommentAuthorAssociation.cs
export const VALID_AUTHOR_ASSOCIATIONS = ['owner', 'member', 'contributor']
export const VALID_REVIEW_STATES = ['approved']
export const VERSIONING_REGEX =
  /^(patch|minor|major)(\s{1}[a-z\-]+)?(\s{1}(rust|js))?\s*\n?/g
