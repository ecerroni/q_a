import { ReactNode, FC, Suspense } from 'react';
// import { useQuery } from '@apollo/client';
import { AUTH_QUERY } from '@/api';
import { useTypedQuery } from '@/hooks';

interface AuthenticatedProps {
  children: ReactNode;
  [key: string]: unknown; // [NOTE]: leaving it so for now
}

const ConnectionResult: FC<AuthenticatedProps> = ({ children }) => {
  const { loading = true } = useTypedQuery(AUTH_QUERY, {
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return null;
  }

  return children;
};

const Authenticated: FC<AuthenticatedProps> = props => (
  // TODO: pass actual loading component
  <Suspense fallback={<span>Loading</span>}>
    <ConnectionResult {...props} />
  </Suspense>
);

export default Authenticated;
