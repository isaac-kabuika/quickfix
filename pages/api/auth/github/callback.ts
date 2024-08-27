import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '../../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  try {
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

    // Update the user's GitHub token in Supabase auth metadata
    const { data, error } = await supabase.auth.updateUser({
      data: { provider_token: access_token }
    });

    if (error) {
      console.error('Error updating GitHub token:', error);
      return res.redirect('/dashboard?error=github_token_update_failed');
    }

    console.log('GitHub token stored successfully');

    // Use a server-side redirect
    res.writeHead(302, { Location: '/dashboard' });
    res.end();
  } catch (error) {
    console.error('Error during GitHub OAuth:', error);
    res.redirect('/login?error=github_connection_failed');
  }
}