import { FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';

const App: FC = () => {
  // [NOTE]: going with the simplest router implementation to not waste time
  // See additional comments of handleLogin() in "src/hooks/useAuth.ts"
  return (
    <div className="flex flex-col justify-stretch items-center w-full h-full">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
