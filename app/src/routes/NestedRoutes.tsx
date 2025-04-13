import { FC } from 'react';
import { Routes, Route, Navigate, RouteObject } from 'react-router-dom';

interface NestedRoutesProps {
  navigation: RouteObject[];
  parentPath?: string;
}

const NestedRoutes: FC<NestedRoutesProps> = ({
  navigation,
  parentPath = '/',
}) => (
  <Routes>
    {navigation.map(nav => {
      return <Route key={nav.path} path={nav.path} element={nav.element} />;
    })}
    <Route path="*" element={<Navigate to={parentPath} replace />} />
  </Routes>
);

export default NestedRoutes;
