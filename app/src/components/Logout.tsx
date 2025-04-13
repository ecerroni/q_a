import { FC } from 'react';
import { useAuth } from '@/hooks';
import { UseAuthReturn } from '@/types';

const Logout: FC = () => {
  const { logout } = useAuth() as UseAuthReturn;

  return (
    <button
      onClick={logout}
      type="button"
      className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      Logout
    </button>
  );
};

export default Logout;
