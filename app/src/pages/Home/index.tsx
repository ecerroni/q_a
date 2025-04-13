import { useState, FC } from 'react';

// import { UnsyncJob, WithUnsyncJob } from '@/pages/Home/_services';
import { WalletIcon } from '@heroicons/react/24/outline';
import { RouteObject } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/20/solid';
import { useQueryTracker } from '@/hooks';
import { CURRENT_USER_QUERY } from '@/api';
import Authenticated from '@/components/Authenticated';
import Dashboard from '@/pages/Dashboard';
import Sidebar from './Sidebar';
import homeRoute from '@/routes/protected/Home';
import { ExtendedRouteObject } from '@/types';
import NestedRoutes from '@/routes/NestedRoutes';

const Home: FC = () => {
  const navigation = [
    {
      key: 'dashboard',
      name: 'Dashboard',
      path: '',
      to: '/p',
      icon: WalletIcon,
      element: <Dashboard />,
    },
    ...(homeRoute.children?.map?.((c: ExtendedRouteObject) => ({
      ...c,
      current: false,
      key: c.path,
      name: c.meta?.label ?? '',
      to: c.meta?.to ?? '',
    })) ?? []),
  ];
  const sidebarNavigation = navigation.filter(
    (n: ExtendedRouteObject) => !n.meta?.hide
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { useTrackedTypedQuery } = useQueryTracker();
  const { data: dataUser } = useTrackedTypedQuery(CURRENT_USER_QUERY, {
    variables: {},
  });

  const { currentUser } = dataUser ?? {};

  return (
    <Authenticated>
      <div className="w-full h-full">
        <Sidebar
          navigation={sidebarNavigation}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentUser={currentUser}
        />
        <div className="pl-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-white xl:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="xl:pl-72">
          <NestedRoutes navigation={navigation as RouteObject[]} />
        </div>
      </div>
    </Authenticated>
  );
};

export default Home;
