import React, { Suspense, useState } from 'react';
import { Map, BarChart3, Bell } from 'lucide-react';
const MapSection = React.lazy(() => import('./components/MapSection'));
const AnalyticsSection = React.lazy(() => import('./components/AnalyticsSection'));
const AlertSection = React.lazy(() => import('./components/AlertSection'));
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PlaceholderSection from './components/PlaceholderSection';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return (
          <Suspense fallback={<PlaceholderSection title="Environmental Map" description="Loading map..." icon={Map} />}>
            <MapSection />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<PlaceholderSection title="Advanced Analytics" description="Loading analytics..." icon={BarChart3} />}>
            <AnalyticsSection />
          </Suspense>
        );
      case 'alerts':
        return (
          <Suspense fallback={<PlaceholderSection title="Smart Alerts" description="Loading alerts..." icon={Bell} />}>
            <AlertSection />
          </Suspense>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>{renderSection()}</main>
    </div>
  );
}

export default App;
