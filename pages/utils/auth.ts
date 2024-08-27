import { getUserFromDatabase } from './database';

// Add this interface to define the User type
interface User {
  github_access_token?: string;
  // Add other user properties as needed
}

export async function getUserGithubToken(userId: string): Promise<string | null> {
  try {
    console.log('Fetching GitHub token for user:', userId);
    const user = await getUserFromDatabase(userId) as User | null;
    if (!user) {
      console.log('User not found:', userId);
      return null;
    }
    if (!user.github_access_token) {
      console.log('GitHub token not found for user:', userId);
      return null;
    }
    console.log('GitHub token retrieved successfully for user:', userId);
    return user.github_access_token;
  } catch (error) {
    console.error('Error retrieving GitHub token:', error);
    return null;
  }
}