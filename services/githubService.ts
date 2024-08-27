import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN })

export const getRepoContents = async (owner: string, repo: string, path: string = '') => {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  })
  return data
}

export const createWebhook = async (owner: string, repo: string, webhookUrl: string) => {
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
}