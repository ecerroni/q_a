import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import protectedRoutes from './protected';
import publicRoutes from './public';

export const CatchAllRoutes: RouteObject = {
  path: '*',
  Component: () => Navigate({ to: '/', replace: true }),
};

const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
  CatchAllRoutes,
]);

export default router;
