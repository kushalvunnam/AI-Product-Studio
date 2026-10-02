const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Campaigns.jsx', 'utf8');

const tableBlockStart = '<div className="overflow-x-auto">';
const tableBlockEnd = '</table>\n          </div>';

const replaceWith = `<div className="w-full">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 text-sm font-medium border-b border-slate-800">
                    <th className="p-4 pl-6 font-medium">Campaign Name</th>
                    <th className="p-4 font-medium">Product</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Variations</th>
                    <th className="p-4 font-medium">Date Created</th>
                    <th className="p-4 pr-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCampaigns.map(campaign => (
                    <tr key={campaign._id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => navigate(\`/campaigns/\${campaign._id}\`)}>
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                            {campaign.sourceImage?.secureUrl ? (
                              <img src={campaign.sourceImage.secureUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200 group-hover:text-primary-400 transition-colors truncate">{campaign.name || 'Untitled Campaign'}</p>
                            <p className="text-xs text-slate-500 truncate">ID: {campaign._id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-300 truncate max-w-[120px]">{campaign.analysis?.productName || '-'}</td>
                      <td className="p-4">
                        <span className={getStatusBadge(campaign.status)}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {campaign.variations?.length || 0} generated
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(\`/campaigns/\${campaign._id}\`); }}
                          className="text-slate-400 hover:text-primary-400 p-2 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-800">
              {filteredCampaigns.map(campaign => (
                <div key={campaign._id} className="p-4 flex flex-col gap-3 hover:bg-slate-800/30 transition-colors active:bg-slate-800" onClick={() => navigate(\`/campaigns/\${campaign._id}\`)}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                      {campaign.sourceImage?.secureUrl ? (
                        <img src={campaign.sourceImage.secureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <PlayCircle className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 truncate">{campaign.name || 'Untitled Campaign'}</p>
                      <p className="text-xs text-slate-500 mb-1 truncate">{campaign.analysis?.productName || 'No product name'}</p>
                      <span className={getStatusBadge(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Variations</span>
                      <span className="text-sm text-slate-300 font-medium">{campaign.variations?.length || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Date</span>
                      <span className="text-sm text-slate-300 font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(\`/campaigns/\${campaign._id}\`); }}
                      className="text-primary-400 hover:text-primary-300 transition-colors p-2"
                      aria-label="View campaign"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>`;

const lines = content.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div className="overflow-x-auto">')) {
    startIdx = i;
  }
  if (startIdx !== -1 && lines[i].includes('</table>')) {
    endIdx = i + 1;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1, replaceWith);
  fs.writeFileSync('frontend/src/pages/Campaigns.jsx', lines.join('\n'));
  console.log('Fixed Campaigns.jsx mobile view.');
} else {
  console.log('Could not find table in Campaigns.jsx');
}
