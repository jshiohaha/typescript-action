import * as github from '@actions/github'

export class GithubProvider {
  octokit: any // type?
  owner: string
  repo: string

  constructor(token: string, owner: string, repo: string) {
    // This should be a token with access to your repository scoped in as a secret.
    // The YML workflow will need to set myToken with the GitHub Secret Token
    // myToken: ${{ secrets.GITHUB_TOKEN }}
    // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
    this.octokit = github.getOctokit(token)
    this.owner = owner
    this.repo = repo
  }

  /**
   * there are the following types of comments:
   *
   * - comments on the pull request
   * - comments as a review's body text
   * - comments on a review (can be threaded)
   *
   * for the purpose of versioning, we will only look at reviews where
   *  - state = APPROVED,
   *  - author_association = [OWNER, MEMBER, CONTRIBUTOR], and
   *  - body text matches the expected pattern
   */
  fetchPullRequestReviews = async (pull_number: number) => {
    const {data} = await this.octokit.rest.pulls.listReviews({
      owner: this.owner,
      repo: this.repo,
      pull_number
    })

    // todo: type the type out?
    return data
  }

  fetchAllChangedFiles = async (
    pull_number: number,
    per_page: number = 100 // max = 100?
  ): Promise<string[]> => {
    let page = 0
    let files: string[] = []

    while (true) {
      const {data} = await this.octokit.rest.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number,
        direction: 'desc',
        per_page,
        page
      })

      if (data.length === 0) break
      files = [...files, ...data.map((f: any) => f.filename)]

      console.log(`fetched page ${page}`)
      page += 1
    }

    console.log(`Fetched ${files.length} files for PR ${pull_number}`)

    return files
  }
}
