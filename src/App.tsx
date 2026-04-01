import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet, Navigate } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import EditTournament from './pages/EditTournament';
import NewPlayer from './pages/NewPlayer';
import NewTournament from './pages/NewTournament';
import Players from './pages/Players';
import RoundDetail from './pages/RoundDetail';
import Scenarios from './pages/Scenarios';
import Standings from './pages/Standings';
import TournamentDetail from './pages/TournamentDetail';
import Tournaments from './pages/Tournaments';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <Navigate to='/' />,
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: Login });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  ),
});

const playersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/players',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Players />
      </Layout>
    </ProtectedRoute>
  ),
});

const tournamentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tournaments',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Tournaments />
      </Layout>
    </ProtectedRoute>
  ),
});

const scenariosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scenarios',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Scenarios />
      </Layout>
    </ProtectedRoute>
  ),
});

const standingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/standings',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Standings />
      </Layout>
    </ProtectedRoute>
  ),
});

const playersNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/players/new',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <NewPlayer />
      </Layout>
    </ProtectedRoute>
  ),
});

const tournamentsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tournaments/new',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <NewTournament />
      </Layout>
    </ProtectedRoute>
  ),
});

const tournamentEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tournaments/$id/edit',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <EditTournament />
      </Layout>
    </ProtectedRoute>
  ),
});

const tournamentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tournaments/$id',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <TournamentDetail />
      </Layout>
    </ProtectedRoute>
  ),
});

const roundDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tournaments/$id/rounds/$roundId',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <RoundDetail />
      </Layout>
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  playersRoute,
  playersNewRoute,
  tournamentsRoute,
  tournamentsNewRoute,
  tournamentEditRoute,
  tournamentDetailRoute,
  roundDetailRoute,
  scenariosRoute,
  standingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
