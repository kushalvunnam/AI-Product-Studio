import React, { useState } from 'react';
import { User, Mail, Shield, CheckCircle2, XCircle } from 'lucide-react';

const Settings = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: 'ProductStudio User', email: 'user@productstudio.ai', plan: 'Pro Tier' });
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [status, setStatus] = useState(null); // 'saving', 'success', 'error'

  const handleSave = () => {
    setStatus('saving');
    setTimeout(() => {
      setProfile(tempProfile);
      setEditing(false);
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    }, 800);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#101828] tracking-tight">Account Settings</h1>
        <p className="text-[#52627A] mt-1">Manage your profile and platform preferences</p>
      </div>

      {status === 'success' && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" /> Profile updated successfully.
        </div>
      )}

      <div className="glass-card overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-[#101828] flex items-center gap-2"><User className="w-5 h-5 text-primary-400"/> Profile Information</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary-cyan flex items-center justify-center text-3xl font-bold text-slate-950 uppercase shadow-md">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#101828]">{profile.name}</h3>
              <p className="text-[#52627A]">{profile.plan}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label className="block text-sm font-medium text-[#52627A] mb-2">Full Name</label>
              {editing ? (
                <input type="text" value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-4 py-2 text-[#101828] focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner" />
              ) : (
                <div className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-4 py-2 text-[#344054]">{profile.name}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#52627A] mb-2">Email Address</label>
              <div className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-4 py-2 text-[#52627A] flex items-center gap-2 cursor-not-allowed">
                <Mail className="w-4 h-4" /> {profile.email}
              </div>
              <p className="text-xs text-[#52627A] mt-1">Email cannot be changed.</p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-white shadow-sm flex justify-end gap-4">
          {editing ? (
            <>
              <button onClick={() => {setEditing(false); setTempProfile(profile);}} className="px-4 py-2 rounded-lg text-[#52627A] hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={status==='saving'} className="btn-primary py-2 flex items-center gap-2">
                {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary py-2">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-[#101828] flex items-center gap-2"><Shield className="w-5 h-5 text-amber-400"/> Security & Integrations</h2>
        </div>
        <div className="p-6">
          <p className="text-[#52627A] mb-4">Groq Vision API: <span className="text-emerald-400 font-medium">Connected</span></p>
          <p className="text-[#52627A] mb-6">Cloudinary API: <span className="text-emerald-400 font-medium">Connected</span></p>
          <button className="text-red-400 hover:text-red-300 font-medium px-4 py-2 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
import { Loader2 } from 'lucide-react';
export default Settings;
