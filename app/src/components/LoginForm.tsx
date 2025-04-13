import { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { PasswordMinLength, UserCredentials, UserLoginCallback } from '@/types';

interface LoginFormProps {
  // eslint-disable-next-line no-unused-vars
  callback: UserLoginCallback;
  isLoading: boolean;
}

const passwordLength: PasswordMinLength = 6;

const LoginForm: React.FC<LoginFormProps> = ({
  callback = () => null,
  isLoading = false,
}: LoginFormProps) => {
  const [helperMessage, setHelperMessage] = useState({
    number: '',
    password: '',
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm();
  const onSubmit: SubmitHandler<FieldValues> = data => {
    const values: UserCredentials = {
      ...data,
      identifier: { username: data.username as string },
      password: data.password,
    };
    if (!isLoading) callback(values);
  };

  return (
    <>
      <div className="flex w-full flex-1 flex-col justify-center items-center py-8 px-6 bg-transparent rounded-md lg:px-8">
        <div className="mt-10 sm:mx-auto w-full max-w-md">
          <div className="w-full max-w-lg">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-transparent shadow-md rounded px-8 pt-6 pb-8 mb-4"
            >
              <div className="mb-4">
                <label
                  className="block text-gray-100 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  id="username"
                  className="shadow appearance-none border rounded w-full py-2 px-3 mb-2 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  {...register('username', {
                    required: true,
                  })}
                />

                <p className="text-red-500 text-xs italic h-2">
                  {errors.username && 'Please choose a username.'}
                </p>
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-100 text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  className={`shadow appearance-none border ${
                    errors.password ? 'border-red-500' : ''
                  } rounded w-full py-2 px-3 text-gray-900 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                  type="password"
                  {...register('password', {
                    required: true,
                    minLength: passwordLength,
                    onChange(event) {
                      const password = event.target.value;
                      if (
                        !helperMessage.password.length &&
                        password?.length < passwordLength
                      ) {
                        setHelperMessage({
                          ...helperMessage,
                          password: `Your password must be have at least ${passwordLength} characters long`,
                        });
                      } else if (
                        helperMessage.password.length &&
                        password?.length >= passwordLength
                      ) {
                        setHelperMessage({
                          ...helperMessage,
                          password: '',
                        });
                      }
                    },
                  })}
                />
                <p className="text-red-500 text-xs italic h-2">
                  {helperMessage?.password?.length ? (
                    <span>{helperMessage.password}</span>
                  ) : (
                    errors.password && 'Please choose a password.'
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <button
                  className={`${
                    !isValid || isLoading
                      ? 'disable bg-gray-200 pointer-events-none'
                      : 'bg-primary-500 hover:bg-primary-700'
                  } relative w-full  text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                  type="submit"
                  onClick={() => handleSubmit(onSubmit)}
                >
                  {isLoading ? (
                    <>
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="absolute inline left-32 top-3 mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        ></path>
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="#404040"
                        ></path>
                      </svg>
                    </>
                  ) : null}
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default LoginForm;
