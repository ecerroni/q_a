import { Navigate, RouteObject } from 'react-router-dom';

const DefaultRedirectRoute: RouteObject = {
  path: '/',
  element: <Navigate to="/p" replace />,
};
export default DefaultRedirectRoute;
