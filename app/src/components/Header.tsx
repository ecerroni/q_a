import { FC } from 'react';
import Logout from './Logout';

interface HeaderProps {
  username?: string | null | undefined;
}

const Header: FC<HeaderProps> = () => {
  return (
    <div className="w-full flex mt-4 items-center justify-stretch py-12 lg:py-8 h-14 px-4">
      <div className="flex-auto"></div>
      <div className="hidden flex-auto lg:block">
        <img
          className='className="mx-auto h-10 w-auto"'
          src="/src/assets/qa.svg"
          alt=""
        />
      </div>
      <div className="mt-4 sm:ml-16 sm:mt-0 flex justify-center ">
        <Logout />
      </div>
    </div>
  );
};

export default Header;
