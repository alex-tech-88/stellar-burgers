import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../services/hooks';
import { selectIsAuth } from '../../services/slices/userSlice';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const location = useLocation();
  const isAuth = useAppSelector(selectIsAuth);

  if (!onlyUnAuth && !isAuth) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (onlyUnAuth && isAuth) {
    return <Navigate to='/' replace />;
  }

  return children;
};
