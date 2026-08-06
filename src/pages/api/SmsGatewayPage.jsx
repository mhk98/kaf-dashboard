import { useState, useEffect } from 'react';
import { PlayCircle } from 'lucide-react';
import { siteSettingService } from '../../services/websiteService';
import { integrationService } from '../../services/integrationService';

const SETTING_TYPE = 'sms_gateway';

const DEFAULT = { url: '', apiKey: '', senderId: '', status: false, orderConfirm: true, forgotPassword: true, passwordGenerator: true };

export default function SmsGatewayPage() {
  const [form, setForm]       = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    siteSettingService.get(SETTING_TYPE)
      .then((res) => { if (res.data?.data) setForm({ ...DEFAULT, ...res.data.data }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function setField(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await siteSettingService.upsert(SETTING_TYPE, form);
      setSuccess('SMS gateway settings saved');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }
  async function handleTest() { setTesting(true); setError(''); setSuccess(''); try { await siteSettingService.upsert(SETTING_TYPE, form); await integrationService.test('sms', 'custom'); setSuccess('SMS configuration is ready'); } catch (err) { setError(err.message); } finally { setTesting(false); } }

  if (loading) return <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-gray-800">SMS Gateway</h1>
        <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-600">
          <PlayCircle size={16} /> টিউটোরিয়াল দেখুন
        </button>
      </div>

      <div className="rounded bg-white p-6 shadow-sm">
        {error   && <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded">{error}</div>}
        {success && <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 text-green-600 text-xs rounded">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <Field label="Url" required><TextInput type="url" value={form.url} onChange={(v) => setField('url', v)} /></Field>
            <Field label="API Key" required><TextInput value={form.apiKey} onChange={(v) => setField('apiKey', v)} /></Field>
            <Field label="Senderid" required><TextInput value={form.senderId} onChange={(v) => setField('senderId', v)} /></Field>
            <Field label="Status"><Toggle checked={form.status} onChange={() => setField('status', !form.status)} /></Field>
            <Field label="Order confirm"><Toggle checked={form.orderConfirm} onChange={() => setField('orderConfirm', !form.orderConfirm)} /></Field>
            <Field label="Forgot password"><Toggle checked={form.forgotPassword} onChange={() => setField('forgotPassword', !form.forgotPassword)} /></Field>
            <Field label="Password Generator"><Toggle checked={form.passwordGenerator} onChange={() => setField('passwordGenerator', !form.passwordGenerator)} /></Field>
          </div>
          <button type="submit" disabled={saving}
            className="mt-6 rounded bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-50">
            {saving ? 'Saving...' : 'Submit'}
          </button>
          <button type="button" onClick={handleTest} disabled={testing} className="ml-2 mt-6 rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{testing ? 'Testing...' : 'Test Configuration'}</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required = false, children }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-500">{label} {required && <span>*</span>}</span>{children}</label>;
}
function TextInput({ type = 'text', value, onChange }) {
  return <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />;
}
function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={onChange} className={`relative inline-flex h-8 w-[58px] items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-sky-500' : 'bg-gray-300'}`}>
      <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );
}
