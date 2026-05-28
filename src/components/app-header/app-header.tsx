import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = () => {
  const { pathname } = useLocation();

  return <AppHeaderUI userName='' pathname={pathname} />;
};
