import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import Assets from './pages/Assets';
import CampaignDetails from './pages/CampaignDetails';
import Campaigns from './pages/Campaigns';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import BackgroundRemovalTest from './pages/BackgroundRemovalTest';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="create" element={<CreateCampaign />} />
        <Route path="assets" element={<Assets />} />
        <Route path="mask-test" element={<BackgroundRemovalTest />} />
        <Route path="campaigns/:id" element={<CampaignDetails />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="templates" element={<Templates />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
