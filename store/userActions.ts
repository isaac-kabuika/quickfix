import { AppDispatch } from './index';
import { setUser, setLoading, setError } from './index';
import { supabase } from '../lib/supabaseClient';

export const fetchUserData = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (user) {
      dispatch(setUser({
        ...user,
        email: user.email || '',
        // Add similar checks for other potentially undefined properties
      }));
    } else {
      dispatch(setError('User not found'));
    }
  } catch (error) {
    dispatch(setError('Failed to fetch user data'));
  }
};