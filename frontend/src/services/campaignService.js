import { API_BASE_URL } from './api';

export const createCampaign = async (data) => {
  const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create campaign');
  return (await response.json()).campaign;
};

export const updateCampaign = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update campaign');
  return (await response.json()).campaign;
};

export const getCampaigns = async () => {
  const response = await fetch(`${API_BASE_URL}/api/campaigns`);
  if (!response.ok) throw new Error('Failed to fetch campaigns');
  return (await response.json()).campaigns;
};

export const getCampaignById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`);
  if (!response.ok) throw new Error('Failed to fetch campaign');
  return (await response.json()).campaign;
};

export const deleteCampaign = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete campaign');
  return await response.json();
};
