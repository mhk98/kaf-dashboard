import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { clientService } from '../../services/clientService';
import { imageUrl } from '../../utils/assetUrl';

export default function WebsiteClientsPage({ onEdit, onCreate }) {
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clientService.getAll({ searchTerm: search || undefined, limit: 100 });
      setClients(res.data || []);
      setMeta(res.meta || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  async function handleDelete(id) {
    if (!window.confirm('এই client মুছে ফেলবেন?')) return;
    try {
      await clientService.delete(id);
      fetchClients();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleToggleStatus(client) {
    const active = client.status === 'Active' || client.status === 'active';
    setStatusUpdatingId(client.Id);
    try {
      await clientService.update(client.Id, {
        name: client.name,
        logo: client.logo || null,
        linkUrl: client.linkUrl || null,
        sortOrder: client.sortOrder ?? 0,
        status: active ? 'Inactive' : 'Active',
      });
      fetchClients();
    } catch (e) {
      alert(e.message || 'Client status update করতে সমস্যা হয়েছে');
    } finally {
      setStatusUpdatingId(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Client / Partner Logo</h1>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition"
        >
          <Plus size={14} /> Add Client
        </button>
      </div>

      <p className="text-xs text-gray-500">
        এখানে যোগ করা logo গুলো ওয়েবসাইটের হোমপেজে "Work with us Today" সেকশনে দেখানো হয়। Inactive করলে সেকশন থেকে লুকিয়ে যাবে। ক্রম নির্ধারণে Sort Order ব্যবহার হয় (ছোট আগে)।
      </p>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-gray-800 font-semibold text-sm">All Clients ({meta?.count ?? clients.length})</span>
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none w-36" />
        </div>
        {loading && <div className="text-center py-8 text-gray-400 text-xs">Loading...</div>}
        {error && <div className="text-center py-8 text-red-400 text-xs">{error}</div>}
        {!loading && !error && (
          <table className="w-full min-w-[760px] text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['#', 'Logo', 'Name', 'Link', 'Sort', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">কোনো client পাওয়া যায়নি</td></tr>
              )}
              {clients.map((client, i) => (
                <tr key={client.Id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    {client.logo ? (
                      <img src={imageUrl(client.logo)} alt={client.name} className="w-12 h-10 rounded object-contain border border-gray-200 bg-white p-1" />
                    ) : (
                      <div className="w-12 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[9px] text-gray-400 font-bold">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{client.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{client.linkUrl || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{client.sortOrder ?? 0}</td>
                  <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => onEdit && onEdit(client)} className="w-6 h-6 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center"><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(client.Id)} className="w-6 h-6 rounded bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"><Trash2 size={12} /></button>
                      <StatusToggleBtn
                        active={client.status === 'Active' || client.status === 'active'}
                        loading={statusUpdatingId === client.Id}
                        onClick={() => handleToggleStatus(client)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === 'Active' || status === 'active';
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function StatusToggleBtn({ active, loading, onClick }) {
  return (
    <button
      type="button"
      title={active ? 'Make Inactive' : 'Make Active'}
      onClick={onClick}
      disabled={loading}
      className={`w-6 h-6 rounded flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-60 ${active ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
    </button>
  );
}
