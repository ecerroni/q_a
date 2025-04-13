import { StrictMode } from 'react';
import { ToastContainer } from 'react-toastify';
import { createRoot } from 'react-dom/client';
import { ApolloProvider as ApolloHooksProvider } from '@apollo/client';
import { apolloClient } from '@/apollo';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ApolloHooksProvider client={apolloClient}>
      <div>
        <p>&nbsp;</p>
      </div>
      <App />
      <div className="w-full px-6 pb-4 bg-gray-900">
        <div className="w-full mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24 flex justify-stretch flex-wrap">
          <p className="text-xs leading-5 text-gray-400 w-full text-center">
            &copy; 2025 | All rights reserved
          </p>

          <p className="text-xs leading-5 text-gray-400 w-full text-center lg:text-right lg:-mt-5">
            Made by Enrico
          </p>
        </div>
      </div>

      <ToastContainer
        className="toast-container message-container"
        toastClassName="message"
        draggable={false}
        autoClose={1000}
        position="top-right"
      />
    </ApolloHooksProvider>
  </StrictMode>
);
