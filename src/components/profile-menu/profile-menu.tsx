// src/components/profile-menu/profile-menu.tsx
import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProfileMenuUI } from '@ui';
import { useAppDispatch } from '../../services/hooks';
import { logoutUser } from '../../services/slices/userSlice';

export const ProfileMenu: FC = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/login', { replace: true });
    });
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
