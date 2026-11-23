import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Confirm } from '@presentation/components/Confirm';
import { Toaster } from '@presentation/components/Toast';
import { queryClient } from '@main/query/query-client';
import { routeTree } from './routeTree.gen';
import './styles.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Confirm />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
