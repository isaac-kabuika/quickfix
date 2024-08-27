import { store, updateUser, setGithubToken } from '../store';

// Placeholder for database operations
// Simple in-memory storage for demonstration
const users: { [userId: string]: { githubToken?: string } } = {};

export async function updateUserGithubToken(userId: string, token: string): Promise<void> {
  console.log('Updating GitHub token for user:', userId);
  store.dispatch(setGithubToken({ userId, token }));
}

export async function getUserFromDatabase(userId: string) {
  console.log('Fetching user from database:', userId);
  return store.getState().users.users[userId] || null;
}

// Additional helper function to create a user if needed
export async function createUser(userId: string): Promise<void> {
  store.dispatch(updateUser({ id: userId }));
}