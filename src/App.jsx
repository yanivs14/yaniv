import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster"
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { initAnalytics, trackPageView } from "@/lib/analytics";

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
}
import Home from './pages/Home';
import AdminK from './pages/AdminK';
import PolicyPage from './pages/PolicyPage';
import CookieBanner from './components/CookieBanner';
import { SiteContentProvider } from '@/lib/SiteContentContext';
import InnerCircle from './pages/InnerCircle';
import Movement7Prep from './pages/Movement7Prep';
import Promotion from './pages/Promotion';
import EmailDashboard from './pages/EmailDashboard';
import ThankYou from './pages/ThankYou';
import Unsubscribe from './pages/Unsubscribe';
import HandstandLanding from './pages/HandstandLanding';
import Community from './pages/Community';
import CommunityAdmin from './pages/CommunityAdmin';
import Gift from './pages/Gift';
import HsPre from './pages/HsPre';
import HomeBackup from './pages/HomeBackup';
import HomeBackupLayout from './components/HomeBackupLayout';
import AdminHomeB from './pages/AdminHomeB';
// Add page imports here

const AuthenticatedApp = () => {
  const { authError, navigateToLogin } = useAuth();

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <>
      <RouteTracker />
      <Routes>
        <Route path="/home-old" element={<SiteContentProvider><Home /></SiteContentProvider>} />
        <Route path="/admin-k" element={<SiteContentProvider><AdminK /></SiteContentProvider>} />
        <Route path="/inner-circle" element={<SiteContentProvider><InnerCircle /></SiteContentProvider>} />
        <Route path="/MOVEMENT7PREP" element={<Movement7Prep />} />
        <Route path="/promotion" element={<Promotion />} />
        <Route path="/crm" element={<EmailDashboard />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/handstand-course" element={<HandstandLanding />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community-admin" element={<CommunityAdmin />} />
        <Route path="/gift" element={<Gift />} />
        <Route path="/hspre" element={<HsPre />} />
        <Route path="/" element={<HomeBackupLayout><HomeBackup /></HomeBackupLayout>} />
        <Route path="/admin-home-b" element={<AdminHomeB />} />
        <Route path="/:slug" element={<PolicyPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};


function App() {
  useEffect(() => { initAnalytics(); }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <SiteContentProvider keyPrefix="homeb_">
              <AuthenticatedApp />
            </SiteContentProvider>
            <CookieBanner />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App