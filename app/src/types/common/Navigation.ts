import { ForwardRefExoticComponent } from 'react';
import { RouteObject } from 'react-router-dom';
type Home = 'Home';

export type NavigationItemNames = Home;

export type NavigationItem = {
  key: string;
  name: NavigationItemNames;
  path: string;
  to?: string;
  icon: any;
  current?: boolean;
};

export type ExtendedRouteObject = RouteObject & {
  icon?: ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  meta?: Record<string, any>;
  children?: ExtendedRouteObject[];
};
