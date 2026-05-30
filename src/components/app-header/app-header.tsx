import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { AppHeaderUI } from '@ui';
import { useAppSelector } from '../../services/hooks';
import { selectUser } from '../../services/slices/userSlice';

export const AppHeader: FC = () => {
  const { pathname } = useLocation();
  const user = useAppSelector(selectUser);

  return <AppHeaderUI userName={user?.name ?? ''} pathname={pathname} />;
};
