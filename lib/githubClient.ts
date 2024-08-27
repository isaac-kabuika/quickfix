import { Octokit } from '@octokit/rest'

export const createGithubClient = (accessToken: string) => {
  const octokit = new Octokit({ auth: accessToken })

  return {
    getRepoContents: async (owner: string, repo: string, path: string = '') => {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path,
        })
        return Array.isArray(data) ? data : [data]
      } catch (error) {
        console.error('Error fetching repo contents:', error)
        throw error
      }
    },

    createWebhook: async (owner: string, repo: string, webhookUrl: string) => {
      try {
        const { data } = await octokit.repos.createWebhook({
          owner,
          repo,
          config: {
            url: webhookUrl,
            content_type: 'json',
          },
          events: ['push'],
        })
        return data
      } catch (error) {
        console.error('Error creating webhook:', error)
        throw error
      }
    },

    getFileContent: async (owner: string, repo: string, path: string) => {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path,
        })
        if ('content' in data) {
          return Buffer.from(data.content, 'base64').toString('utf-8')
        }
        throw new Error('Not a file')
      } catch (error) {
        console.error('Error fetching file content:', error)
        throw error
      }
    },

    createPullRequest: async (owner: string, repo: string, title: string, head: string, base: string, body: string) => {
      try {
        const { data } = await octokit.pulls.create({
          owner,
          repo,
          title,
          head,
          base,
          body,
        })
        return data
      } catch (error) {
        console.error('Error creating pull request:', error)
        throw error
      }
    }
  }
}