import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { updateUserGithubToken } from '../../../../app/utils/database';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  try {
    // Get the user's session using Supabase
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return res.redirect('/login?error=authentication_required');
    }

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const { access_token } = tokenResponse.data;

    console.log('Storing GitHub token for user:', user.id);
    await updateUserGithubToken(user.id, access_token);
    console.log('GitHub token stored successfully');

    // Use a server-side redirect
    res.writeHead(302, { Location: '/dashboard' });
    res.end();
  } catch (error) {
    console.error('Error during GitHub OAuth:', error);
    res.redirect('/login?error=github_connection_failed');
  }
}