import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import Assets from './pages/Assets';
import CampaignDetails from './pages/CampaignDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="create" element={<CreateCampaign />} />
        <Route path="assets" element={<Assets />} />
        <Route path="campaigns/:id" element={<CampaignDetails />} />
        <Route path="campaigns" element={<div className="p-8">Campaign History (Coming Soon)</div>} />
        <Route path="templates" element={<div className="p-8">Templates (Coming Soon)</div>} />
        <Route path="analytics" element={<div className="p-8">Analytics (Coming Soon)</div>} />
        <Route path="settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
