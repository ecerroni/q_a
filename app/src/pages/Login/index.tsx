import { FC } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { UseAuthReturn, UserCredentials } from '@/types';
import { DividerWithText } from '@/components/dividers';
import LoginForm from '@/components/LoginForm';

const Login: FC = () => {
  const navigate = useNavigate();
  const { loading, login } = useAuth() as UseAuthReturn;

  return (
    <>
      <div className="flex min-w-full flex-1 flex-col items-center justify-center sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            alt=""
            src="/src/assets/qa-light.svg"
            className="mx-auto h-12 w-auto"
          />
          <h3 className="mt-6 text-center text-xl font-bold leading-7 tracking-tight text-gray-100 pb-6">
            Wlecome to Q&A
          </h3>
        </div>
        <div className="py-2 flex justify-center flex-wrap w-full min-w-96 max-w-screen-md md:w-3/5">
          <div className="flex w-full flex-wrap">
            <div className="w-full flex flex-wrap -mb-4">
              <div className="w-full">
                <DividerWithText text="Login" />
              </div>
            </div>
            <LoginForm
              callback={(credentials: UserCredentials) =>
                login(credentials, (e: boolean) => {
                  if (e) {
                    toast.error('Wrong credentials', {
                      position: 'bottom-center',
                    });
                    return;
                  }
                  toast.success('Welcome!');
                  navigate('/p/dashboard', { replace: true });
                })
              }
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
