import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const location = useLocation();

  const isAuth = false; // заглушка

  if (!onlyUnAuth && !isAuth) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (onlyUnAuth && isAuth) {
    return <Navigate to='/' replace />;
  }

  return children;
};
