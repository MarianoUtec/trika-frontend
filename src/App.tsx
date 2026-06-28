import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MusicMatchProvider, useMusicMatch } from './context/MusicMatchContext';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';

const Login        = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard    = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const RateSongs    = lazy(() => import('./pages/RateSongs').then(m => ({ default: m.RateSongs })));
const Recommendations = lazy(() => import('./pages/Recommendations').then(m => ({ default: m.Recommendations })));
const LatentSpace  = lazy(() => import('./pages/LatentSpace').then(m => ({ default: m.LatentSpace })));
const Feed         = lazy(() => import('./pages/Feed').then(m => ({ default: m.Feed })));
const Chat         = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const Profile      = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const NotFound     = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function PageLoading() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
      <div className="spinner" />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, toasts, removeToast } = useMusicMatch();

  if (!isAuthenticated) {
    return (
      <>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </Suspense>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/"                element={<Dashboard />} />
            <Route path="/rate"            element={<RateSongs />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/latent-space"    element={<LatentSpace />} />
            <Route path="/feed"            element={<Feed />} />
            <Route path="/chat"            element={<Chat />} />
            <Route path="/chat/:userId"    element={<Chat />} />
            <Route path="/profile"         element={<Profile />} />
            <Route path="/404"             element={<NotFound />} />
            <Route path="*"               element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <MusicMatchProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </MusicMatchProvider>
  );
}
