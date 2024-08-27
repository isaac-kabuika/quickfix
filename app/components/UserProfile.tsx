import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, updateUser } from '../store';

const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.users.users[userId]);

  const handleUpdateToken = (token: string) => {
    dispatch(updateUser({ id: userId, githubToken: token }));
  };

  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>User Profile</h2>
      <p>User ID: {user.id}</p>
      <p>GitHub Token: {user.githubToken || 'Not set'}</p>
      <button onClick={() => handleUpdateToken('new_token')}>Update Token</button>
    </div>
  );
};

export default UserProfile;