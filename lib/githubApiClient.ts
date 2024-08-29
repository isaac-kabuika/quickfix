import { Octokit } from '@octokit/rest'

interface RepoContent {
  name: string;
  path: string;
  type: string;
}

export const createGithubClient = (accessToken: string) => {
  const octokit = new Octokit({ auth: accessToken })

  const getRepoContents = async (owner: string, repo: string): Promise<RepoContent[]> => {
    try {
      // First, get the default branch
      const { data: repoData } = await octokit.repos.get({ owner, repo })
      const defaultBranch = repoData.default_branch

      // Then, get the latest commit SHA of the default branch
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`,
      })
      const latestCommitSha = refData.object.sha

      // Now, get the tree of the latest commit
      const { data: treeData } = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: latestCommitSha,
        recursive: 'true'
      })

      // Transform the tree data into RepoContent format
      return treeData.tree.map(item => ({
        name: item.path?.split('/').pop() || '',
        path: item.path || '',
        type: item.type === 'blob' ? 'file' : 'dir'
      }))
    } catch (error) {
      console.error('Error fetching repo contents:', error)
      throw error
    }
  }

  return {
    getRepoContents,

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
        }) as { data: { content: string } | { type: string; download_url?: string } }

        if ('content' in data) {
          return Buffer.from(data.content, 'base64').toString('utf-8')
        } else if (data.type === 'file' && data.download_url) {
          const response = await fetch(data.download_url)
          return await response.text()
        } else {
          throw new Error('Not a file or content not available')
        }
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