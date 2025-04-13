import { RouteObject } from 'react-router-dom';
import Login from '@/pages/Login';

const LoginRoute: RouteObject = {
  path: '/login',
  element: <Login />,
};

export default LoginRoute;
