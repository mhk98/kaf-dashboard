import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { resellerService } from '../../services/resellerService';

const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected'];
const STATUS_CLASS = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-600',
};

export default function ResellerListPage() {
  const [resellers, setResellers] = useState([]);
  const [meta, setMeta] = useState({ count: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 20;

  const fetchResellers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await resellerService.getAll({
        searchTerm: search || undefined,
        page,
        limit,
        sortBy: 'Id',
        sortOrder: 'DESC',
      });
      setResellers(res.data || []);
      setMeta(res.meta || { count: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load resellers');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  async function handleStatusChange(reseller, status) {
    try {
      await resellerService.updateStatus(reseller.Id, status);
      setResellers((prev) =>
        prev.map((item) => (item.Id === reseller.Id ? { ...item, status } : item)),
      );
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  }

  async function handleDelete(reseller) {
    if (!window.confirm(`Delete reseller application from "${reseller.name}"?`)) return;
    try {
      await resellerService.delete(reseller.Id);
      fetchResellers();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  }

  const totalPages = Math.max(1, Math.ceil((meta.count ?? 0) / limit));

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-gray-800">Reseller Applications</h1>
      </div>

      <div className="rounded bg-white p-6 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-500">
            Total {meta.count ?? resellers.length} entries
          </span>
          <label className="flex items-center gap-1.5 text-sm text-gray-500">
            Search:
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Name, phone or address"
              className="h-8 w-56 rounded border border-gray-300 px-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-500 w-16">SL</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Address</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 w-44">Applied On</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 w-40">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-red-400">{error}</td></tr>
              )}
              {!loading && !error && resellers.length === 0 && (
                <tr className="bg-gray-50">
                  <td colSpan={7} className="border-b border-gray-200 px-4 py-4 text-center text-gray-500">
                    No reseller applications yet
                  </td>
                </tr>
              )}
              {!loading && !error && resellers.map((reseller, index) => (
                <tr key={reseller.Id} className="border-b border-gray-100 transition hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{(page - 1) * limit + index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{reseller.name}</td>
                  <td className="px-4 py-3 text-gray-600">{reseller.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{reseller.address}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {reseller.createdAt ? new Date(reseller.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={reseller.status || 'Pending'}
                      onChange={(e) => handleStatusChange(reseller, e.target.value)}
                      className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold outline-none ring-1 ring-transparent transition focus:ring-indigo-200 ${
                        STATUS_CLASS[reseller.status] || STATUS_CLASS.Pending
                      }`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => handleDelete(reseller)}
                      className="flex h-7 w-8 items-center justify-center rounded bg-rose-500 text-white transition hover:bg-rose-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between py-4 text-sm font-semibold text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-3 text-slate-400">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="transition hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
            >‹ Prev</button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="transition hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
            >Next ›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
