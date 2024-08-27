import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from '@octokit/rest';
import { getUserGithubToken } from '../../utils/auth';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { projectName, repoName } = req.body;

  try {
    console.log('Creating project for user:', session.user.id);
    const githubToken = await getUserGithubToken(session.user.id!);
    if (!githubToken) {
      console.log('GitHub token not found for user:', session.user.id);
      return res.status(401).json({ message: 'GitHub access token not found. Please reconnect your GitHub account.' });
    }

    console.log('GitHub token retrieved successfully');
    const octokit = new Octokit({ auth: githubToken });

    // Create GitHub repository
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      private: true,
    });

    console.log('GitHub repository created successfully:', repo.html_url);

    // TODO: Add your project creation logic here
    // For example, save project details to your database

    res.status(201).json({ message: 'Project created successfully', repoUrl: repo.html_url });
  } catch (error: unknown) {
    console.error('Error creating project:', error);
    if (error instanceof Error && 'status' in error && error.status === 401) {
      res.status(401).json({ message: 'Invalid or expired GitHub token. Please reconnect your GitHub account.' });
    } else {
      res.status(500).json({ message: 'An error occurred while creating the project' });
    }
  }
}