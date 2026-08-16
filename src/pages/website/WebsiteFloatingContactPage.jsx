import { useEffect, useState } from 'react';
import { siteSettingService } from '../../services/websiteService';

const SETTING_TYPE = 'floating_contact';
const DEFAULT = {
  phoneNumber: '',
  whatsappNumber: '',
  messengerUrl: '',
  status: true,
};

export default function WebsiteFloatingContactPage() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    siteSettingService.get(SETTING_TYPE)
      .then((res) => {
        if (res.data?.data) setForm({ ...DEFAULT, ...res.data.data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function set(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await siteSettingService.upsert(SETTING_TYPE, form);
      setSuccess('Floating contact settings saved');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800">Floating Contact</h1>
        <p className="mt-1 text-xs text-gray-500">Manage the storefront floating WhatsApp, phone call and Messenger buttons.</p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow sm:p-6">
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{error}</div>}
        {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-600">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Phone Call Number" value={form.phoneNumber} onChange={(value) => set('phoneNumber', value)} placeholder="01518301098" />
            <Field label="WhatsApp Number" value={form.whatsappNumber} onChange={(value) => set('whatsappNumber', value)} placeholder="01518301098" />
          </div>
          <Field label="Messenger URL" value={form.messengerUrl} onChange={(value) => set('messengerUrl', value)} placeholder="https://m.me/your-page-username" />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <button
              type="button"
              onClick={() => set('status', !form.status)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${form.status ? 'bg-blue-500' : 'bg-gray-300'}`}
              aria-label="Toggle floating contact visibility"
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${form.status ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>

          <button type="submit" disabled={saving} className="rounded-lg bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-50">
            {saving ? 'Saving...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
      />
    </div>
  );
}
