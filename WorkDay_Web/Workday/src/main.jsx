import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './router/AppRouter.jsx'
import { ToastContainer, Zoom } from 'react-toastify'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthContextProvider, { AuthContext } from './auth/AuthProvider.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
          <ToastContainer
            position='top-right'
            autoClose={2000}
            hideProgressBar={false}
            theme='light'
            transition={Zoom} />
        </QueryClientProvider>
      </AuthContextProvider>
    </GoogleOAuthProvider>
  </StrictMode >,
)
