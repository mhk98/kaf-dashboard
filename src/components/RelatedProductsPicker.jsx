import { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { productService } from '../services/productService';
import { imageUrl } from '../utils/assetUrl';

/**
 * Manual "Related / Similar products" multi-select.
 *
 * Props:
 *  - value:      array of selected product IDs
 *  - onChange:   (ids:number[]) => void
 *  - excludeId:  product ID to hide from the list (the product being edited)
 */
export default function RelatedProductsPicker({ value = [], onChange, excludeId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let alive = true;
    productService
      .getAll({ limit: 1000, sortBy: 'createdAt', sortOrder: 'desc' })
      .then((r) => { if (alive) setProducts(r.data || []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const byId = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.Id, p));
    return map;
  }, [products]);

  const selected = value.map((id) => Number(id));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => p.Id !== Number(excludeId))
      .filter((p) => !selected.includes(p.Id))
      .filter((p) => !q || p.name?.toLowerCase().includes(q) || String(p.sku || '').toLowerCase().includes(q))
      .slice(0, 40);
  }, [products, search, selected, excludeId]);

  function add(id) {
    if (selected.includes(id)) return;
    onChange([...selected, id]);
  }
  function remove(id) {
    onChange(selected.filter((x) => x !== id));
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-gray-500">
        এখানে বেছে দেওয়া product গুলো main product details এর নিচে "You may also like" সেকশনে দেখানো হবে (যে ক্রমে বেছে দেবেন সেই ক্রমেই)।
      </p>

      {/* selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((id) => {
            const p = byId.get(id);
            return (
              <span key={id} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full pl-1 pr-2 py-1">
                {p?.file && (
                  <img src={imageUrl(p.file)} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                {p ? p.name : `#${id}`}
                <button type="button" onClick={() => remove(id)} className="text-blue-400 hover:text-blue-700">
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product by name / SKU..."
          className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white"
        />
      </div>

      {/* results */}
      <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100">
        {loading && <div className="px-3 py-4 text-xs text-gray-400 text-center">Loading products...</div>}
        {!loading && filtered.length === 0 && (
          <div className="px-3 py-4 text-xs text-gray-400 text-center">
            {search ? 'কোনো product পাওয়া যায়নি' : 'সব product যোগ করা হয়েছে'}
          </div>
        )}
        {!loading && filtered.map((p) => (
          <button
            key={p.Id}
            type="button"
            onClick={() => add(p.Id)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50/60 transition"
          >
            <div className="w-9 h-9 rounded bg-gray-100 border border-gray-200 overflow-hidden flex-none">
              {p.file && <img src={imageUrl(p.file)} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
              <p className="text-[10px] text-gray-400">{p.sku || `ID: ${p.Id}`}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
