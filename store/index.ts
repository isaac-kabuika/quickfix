export interface User {
  id: string;
  email: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
  };
}

// Remove the rest of the Redux-related code