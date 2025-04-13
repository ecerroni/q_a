import Home from '@/pages/Home';
import { ExtendedRouteObject } from '@/types';

const HomeRoute: ExtendedRouteObject = {
  path: '/p/*',
  element: <Home />,
  children: [],
};

export default HomeRoute;
