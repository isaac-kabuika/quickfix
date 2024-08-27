import { store, setUser } from '../../store';
import { fetchUserData } from '../../store/userActions';

// Placeholder for database operations
// Simple in-memory storage for demonstration
const users: { [userId: string]: { githubToken?: string } } = {};

export async function updateUserGithubToken(userId: string, token: string): Promise<void> {
  console.log('Updating GitHub token for user:', userId);
  const currentUser = store.getState().user.user;
  if (currentUser) {
    store.dispatch(setUser({
      ...currentUser,
      user_metadata: {
        ...currentUser.user_metadata,
        githubToken: token
      } as { avatar_url?: string; full_name?: string; githubToken?: string }
    }));
  }
}

export async function getUserFromDatabase(userId: string) {
  console.log('Fetching user from database:', userId);
  return store.getState().user.user;
}

// Additional helper function to create a user if needed
export async function createUser(userId: string): Promise<void> {
  store.dispatch(fetchUserData());
}