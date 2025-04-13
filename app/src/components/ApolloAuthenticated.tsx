import { useQuery } from '@apollo/client';
import { FC, Suspense, ReactNode } from 'react';
import { AUTH_QUERY } from '@/api';
import Loading from './Loading';

interface ComponentProps {
  children: ReactNode;
  [key: string]: unknown; // [NOTE]: leaving it so for now
}

const ConnectionResult: FC<ComponentProps> = ({ children }) => {
  const { loading = true } = useQuery(AUTH_QUERY, {
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return null;
  }

  return children;
};

const Authenticate: FC<ComponentProps> = props => (
  <Suspense fallback={<Loading />}>
    <ConnectionResult {...props} />
  </Suspense>
);

export default Authenticate;
