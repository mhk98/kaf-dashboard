import { useState } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, List, ListOrdered, Link,
  Image, Film, Maximize2, Code, HelpCircle, Plus,
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { landingPageService } from '../../services/landingPageService';

const DEFAULT_HEADINGS = Array.from({ length: 4 }, () => ({
  title: '',
  subtitle: '',
  backgroundColor: '#ffffff',
}));

const DEFAULT_IMAGES = Array.from({ length: 5 }, () => ({
  title: '',
  file: null,
}));

const DEFAULT_COLORS = {
  titleColor: '#8a1f5d',
  subTitleColor: '#000000',
  headingColor: '#8a1f5d',
  fontColor: '#111111',
  buttonColor: '#00a018',
  buttonTextColor: '#ffffff',
  sectionBgColor: '#e8f7e4',
};

function RichTextEditor({ value, onChange, placeholder = 'Enter Your Text Here' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarBtn icon={<span className="text-xs font-bold">⚙</span>} />
        <ToolbarBtn icon={<Bold size={12} />} />
        <ToolbarBtn icon={<Underline size={12} />} />
        <ToolbarBtn icon={<Italic size={12} />} />
        <select className="rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-gray-600">
          <option>sans-serif</option>
          <option>serif</option>
          <option>monospace</option>
        </select>
        <ToolbarBtn icon={<span className="px-0.5 text-xs font-bold text-amber-500">A</span>} />
        <ToolbarBtn icon={<List size={12} />} />
        <ToolbarBtn icon={<ListOrdered size={12} />} />
        <ToolbarBtn icon={<AlignLeft size={12} />} />
        <ToolbarBtn icon={<Link size={12} />} />
        <ToolbarBtn icon={<Image size={12} />} />
        <ToolbarBtn icon={<Film size={12} />} />
        <ToolbarBtn icon={<Maximize2 size={12} />} />
        <ToolbarBtn icon={<Code size={12} />} />
        <ToolbarBtn icon={<HelpCircle size={12} />} />
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none px-3 py-2 text-sm text-gray-700 outline-none"
      />
    </div>
  );
}

function ToolbarBtn({ icon }) {
  return (
    <button type="button" className="rounded p-1 text-gray-600 transition hover:bg-gray-200">
      {icon}
    </button>
  );
}

function TextInput({ label, value, onChange, required = false, type = 'text' }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
      />
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <label className="block text-xs font-semibold text-gray-700">
      {label}
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-9 w-12 rounded border border-gray-300 bg-white p-1"
      />
    </label>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function mapImageRows(rows) {
  return Promise.all(
    rows.map(async (row) => ({
      title: row.title,
      imageUrl: row.file ? await fileToDataUrl(row.file) : row.imageUrl || null,
      fileName: row.file?.name || '',
    })),
  );
}

function parseObject(value) {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function parseImageList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function getProductPrice(product = {}) {
  return Number(
    product.offerPrice ||
      product.salePrice ||
      product.price ||
      product.regularPrice ||
      product.purchasePrice ||
      0,
  );
}

function getProductImage(product = {}) {
  if (product.image) return product.image;
  if (product.productImage) return product.productImage;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      return product.images;
    }
  }
  return '';
}

function normalizeProductOptions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      productId: String(item.productId || item.Id || item.id || ''),
      name: item.name || item.productName || '',
      price: item.price || item.offerPrice || '',
      originalPrice: item.originalPrice || item.oldPrice || '',
      image: item.image || item.productImage || '',
    }))
    .filter((item) => item.productId);
}

function ProductOptionsManager({ products, loading, value, onChange }) {
  const [query, setQuery] = useState('');
  const selectedIds = value.map((item) => String(item.productId));
  const normalizedQuery = query.trim().toLowerCase();
  const availableProducts = products
    .filter((product) => !selectedIds.includes(String(product.Id)))
    .filter((product) => {
      if (!normalizedQuery) return true;
      return (
        String(product.name || '').toLowerCase().includes(normalizedQuery) ||
        String(product.sku || '').toLowerCase().includes(normalizedQuery)
      );
    })
    .slice(0, 20);

  function addProduct(product) {
    const id = String(product.Id);
    if (selectedIds.includes(id)) return;
    onChange([
      ...value,
      {
        productId: id,
        name: product.name,
        price: getProductPrice(product),
        originalPrice: product.oldPrice || product.regularPrice || '',
        image: getProductImage(product),
      },
    ]);
    setQuery('');
  }

  function removeProduct(productId) {
    onChange(value.filter((item) => String(item.productId) !== String(productId)));
  }

  function updateOption(productId, patch) {
    onChange(
      value.map((item) =>
        String(item.productId) === String(productId) ? { ...item, ...patch } : item,
      ),
    );
  }

  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Checkout Products</h2>
          <p className="text-[11px] text-gray-500">
            Product search করে Add করুন। নিচে শুধু selected products থাকবে, তাই অনেক product থাকলেও form ছোট থাকবে।
          </p>
        </div>
        <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white">
          {value.length} selected
        </span>
      </div>

      {loading ? (
        <div className="rounded border border-gray-200 bg-white p-3 text-xs text-gray-400">Loading products...</div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Add Product</label>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Product name বা SKU দিয়ে search করুন..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
            {query && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                {availableProducts.map((product) => (
                  <button
                    key={product.Id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 text-left text-xs last:border-b-0 hover:bg-blue-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-gray-700">{product.name}</span>
                      <span className="block text-[11px] text-gray-400">
                        ৳{getProductPrice(product) || 0}
                        {product.sku ? ` · SKU: ${product.sku}` : ''}
                      </span>
                    </span>
                    <span className="rounded-full bg-blue-600 px-3 py-1 font-bold text-white">Add</span>
                  </button>
                ))}
                {availableProducts.length === 0 && (
                  <div className="px-3 py-3 text-xs font-semibold text-gray-400">
                    No product found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
              <span className="text-xs font-bold text-gray-700">Selected Products</span>
              <span className="text-[11px] font-semibold text-gray-400">
                {value.length} item
              </span>
            </div>
            {value.length ? (
              <div className="max-h-80 overflow-y-auto">
                {value.map((option) => (
                  <div
                    key={option.productId}
                    className="grid gap-2 border-b border-gray-100 p-3 last:border-b-0 md:grid-cols-[minmax(180px,1fr)_160px_160px_auto] md:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-gray-700">{option.name}</p>
                      <p className="text-[11px] text-gray-400">Product ID: {option.productId}</p>
                    </div>
                    <input
                      type="number"
                      value={option.price}
                      onChange={(event) => updateOption(option.productId, { price: event.target.value })}
                      placeholder="Offer price"
                      className="rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
                    />
                    <input
                      type="number"
                      value={option.originalPrice || ''}
                      onChange={(event) => updateOption(option.productId, { originalPrice: event.target.value })}
                      placeholder="Old price"
                      className="rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeProduct(option.productId)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-xs font-semibold text-gray-400">
                No checkout product selected yet.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(String(value).trim().replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseCountdown(value) {
  if (!value) return { start: '', end: '' };
  const parts = String(value).split(/\s+-\s+/);
  if (parts.length >= 2) return { start: toDateTimeLocal(parts[0]), end: toDateTimeLocal(parts[1]) };
  return { start: '', end: toDateTimeLocal(value) };
}

function fillRows(rows, defaults) {
  return defaults.map((fallback, index) => ({ ...fallback, ...(rows?.[index] || {}) }));
}

function buildRegularFormState(campaign) {
  const regularData = parseObject(campaign?.regularData);
  const countdown = parseCountdown(campaign?.countdown || campaign?.countdownTime || '');
  return {
    productId: campaign?.productId ? String(campaign.productId) : '',
    productOptions: normalizeProductOptions(regularData.productOptions),
    bannerImage: null,
    bannerImageUrl: campaign?.bannerImageUrl || '',
    campaignTitle: campaign?.title || campaign?.campaignTitle || '',
    subTitle: campaign?.subTitle || '',
    headings: fillRows(regularData.headings, DEFAULT_HEADINGS),
    images: fillRows(regularData.images, DEFAULT_IMAGES),
    shortDescription: campaign?.shortDescription || '',
    video: campaign?.video || '',
    reviewTitle: campaign?.reviewTitle || '',
    reviewSubTitle: regularData.reviewSubTitle || '',
    reviewRegularPriceLabel: regularData.reviewRegularPriceLabel || 'রেগুলার মূল্য',
    reviewOfferPriceLabel: regularData.reviewOfferPriceLabel || 'আজকের অফার মূল্য মাত্র',
    reviewButtonText: regularData.reviewButtonText || '🛒 অর্ডার করতে চাই',
    featureSectionTitle: regularData.featureSectionTitle || 'পণ্যের বিশেষ সুবিধা',
    colors: { ...DEFAULT_COLORS, ...parseObject(regularData.colors) },
    reviewImages: [null],
    savedReviewImages: parseImageList(campaign?.reviewImages),
    descriptionTitle: campaign?.descriptionTitle || '',
    description: campaign?.description || '',
    whyChooseTitle: campaign?.whyChooseTitle || '',
    whyChooseUs: campaign?.whyChooseUs || '',
    countdownStart: countdown.start,
    countdownEnd: countdown.end,
    status: campaign?.status ?? true,
  };
}

export default function LandingPageRegularPage({ mode = 'create', campaign, onNavigate, onSave }) {
  const isEdit = mode === 'edit';
  const { data: products, loading } = useProducts({ limit: 200 });
  const [form, setForm] = useState(() => buildRegularFormState(campaign));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setHeading(index, field, value) {
    setForm((prev) => ({
      ...prev,
      headings: prev.headings.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function setImageRow(index, field, value) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function setColor(field, value) {
    setForm((prev) => ({ ...prev, colors: { ...prev.colors, [field]: value } }));
  }

  function addReviewImageSlot() {
    setForm((prev) => ({ ...prev, reviewImages: [...prev.reviewImages, null] }));
  }

  function setReviewImage(index, file) {
    setForm((prev) => ({
      ...prev,
      reviewImages: prev.reviewImages.map((item, itemIndex) => (itemIndex === index ? file : item)),
    }));
  }

  function buildCountdown() {
    const start = form.countdownStart ? `${form.countdownStart.replace('T', ' ')}:00` : '';
    const end = form.countdownEnd ? `${form.countdownEnd.replace('T', ' ')}:00` : '';
    return start && end ? `${start} - ${end}` : end;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const bannerImageUrl = form.bannerImage
        ? await fileToDataUrl(form.bannerImage)
        : form.bannerImageUrl || null;
      const regularImages = await mapImageRows(form.images);
      const reviewImages = await Promise.all(
        form.reviewImages.filter(Boolean).map((file) => fileToDataUrl(file)),
      );
      const payloadReviewImages = [...form.savedReviewImages, ...reviewImages];

      const payload = {
        pageType: 'Regular',
        productId: form.productId || null,
        title: form.campaignTitle,
        subTitle: form.subTitle,
        bannerImageUrl,
        shortDescription: form.shortDescription,
        video: form.video,
        reviewTitle: form.reviewTitle,
        reviewImages: payloadReviewImages,
        descriptionTitle: form.descriptionTitle,
        description: form.description,
        whyChooseTitle: form.whyChooseTitle,
        whyChooseUs: form.whyChooseUs,
        countdown: buildCountdown(),
        template: 'Regular',
        status: form.status,
        regularData: {
          headings: form.headings,
          images: regularImages,
          reviewSubTitle: form.reviewSubTitle,
          reviewRegularPriceLabel: form.reviewRegularPriceLabel,
          reviewOfferPriceLabel: form.reviewOfferPriceLabel,
          reviewButtonText: form.reviewButtonText,
          featureSectionTitle: form.featureSectionTitle,
          colors: form.colors,
          productOptions: normalizeProductOptions(form.productOptions),
        },
      };
      if (isEdit && campaign?.Id) {
        await landingPageService.update(campaign.Id, payload);
        onSave && onSave();
      } else {
        await landingPageService.create(payload);
      }
      onNavigate && onNavigate('landing_manage');
    } catch (err) {
      setError(err.message || 'Regular landing page save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Landing Page Regular {isEdit ? 'Edit' : 'Create'}</h1>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('landing_manage')}
          className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-purple-700"
        >
          Manage
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-500">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Products <span className="text-red-500">*</span>
              </label>
              <select
                value={form.productId}
                onChange={(event) => set('productId', event.target.value)}
                required={!isEdit && form.productOptions.length === 0}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-400"
              >
                <option value="">{loading ? 'Loading...' : 'Choose ...'}</option>
                {products.map((product) => (
                  <option key={product.Id} value={product.Id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Banner Images <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                required={!isEdit && !form.bannerImageUrl}
                onChange={(event) => set('bannerImage', event.target.files[0] ?? null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:text-gray-600"
              />
              {form.bannerImageUrl && !form.bannerImage && (
                <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img src={form.bannerImageUrl} alt="Saved banner" className="h-28 w-full object-cover" />
                  <p className="px-3 py-2 text-[11px] font-semibold text-gray-500">Saved banner image</p>
                </div>
              )}
            </div>
          </div>

          <ProductOptionsManager
            products={products}
            loading={loading}
            value={form.productOptions}
            onChange={(value) => set('productOptions', value)}
          />

          <TextInput label="Campaign Title" value={form.campaignTitle} onChange={(value) => set('campaignTitle', value)} required />
          <TextInput label="Sub Title (optional)" value={form.subTitle} onChange={(value) => set('subTitle', value)} />

          <section className="rounded-lg border border-gray-200 p-5">
            <h2 className="mb-5 text-sm font-bold text-gray-700">Heading Section</h2>
            <div className="space-y-5">
              {form.headings.map((heading, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_160px]">
                  <TextInput
                    label={`Heading ${index + 1}`}
                    value={heading.title}
                    onChange={(value) => setHeading(index, 'title', value)}
                  />
                  <TextInput
                    label={`Subtitle ${index + 1}`}
                    value={heading.subtitle}
                    onChange={(value) => setHeading(index, 'subtitle', value)}
                  />
                  <ColorInput
                    label={`Background Color ${index + 1}`}
                    value={heading.backgroundColor}
                    onChange={(value) => setHeading(index, 'backgroundColor', value)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 p-5">
            <h2 className="mb-5 text-sm font-bold text-gray-700">Image Upload Section</h2>
            <div className="mb-5">
              <TextInput label="Feature Section Title" value={form.featureSectionTitle} onChange={(value) => set('featureSectionTitle', value)} />
            </div>
            <div className="space-y-5">
              {form.images.map((imageRow, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextInput
                    label={`Image Title ${index + 1}`}
                    value={imageRow.title}
                    onChange={(value) => setImageRow(index, 'title', value)}
                  />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Image {index + 1}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setImageRow(index, 'file', event.target.files[0] ?? null)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:text-gray-600"
                    />
                    {imageRow.imageUrl && !imageRow.file && (
                      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <img src={imageRow.imageUrl} alt={imageRow.title || `Saved image ${index + 1}`} className="h-24 w-full object-cover" />
                        <p className="px-3 py-2 text-[11px] font-semibold text-gray-500">Saved image</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Short Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor value={form.shortDescription} onChange={(value) => set('shortDescription', value)} />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextInput label="Video (Optional)" value={form.video} onChange={(value) => set('video', value)} />
            <TextInput label="Review Title" value={form.reviewTitle} onChange={(value) => set('reviewTitle', value)} />
          </div>
          <TextInput label="Review Sub Title" value={form.reviewSubTitle} onChange={(value) => set('reviewSubTitle', value)} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <TextInput label="Review Regular Price Label" value={form.reviewRegularPriceLabel} onChange={(value) => set('reviewRegularPriceLabel', value)} />
            <TextInput label="Review Offer Price Label" value={form.reviewOfferPriceLabel} onChange={(value) => set('reviewOfferPriceLabel', value)} />
            <TextInput label="Review Button Text" value={form.reviewButtonText} onChange={(value) => set('reviewButtonText', value)} />
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <ColorInput label="Title Color" value={form.colors.titleColor} onChange={(value) => setColor('titleColor', value)} />
            <ColorInput label="Sub Title Color" value={form.colors.subTitleColor} onChange={(value) => setColor('subTitleColor', value)} />
            <ColorInput label="Heading Color" value={form.colors.headingColor} onChange={(value) => setColor('headingColor', value)} />
            <ColorInput label="Font Color" value={form.colors.fontColor} onChange={(value) => setColor('fontColor', value)} />
            <ColorInput label="Button Color" value={form.colors.buttonColor} onChange={(value) => setColor('buttonColor', value)} />
            <ColorInput label="Button Text Color" value={form.colors.buttonTextColor} onChange={(value) => setColor('buttonTextColor', value)} />
            <ColorInput label="Section BG Color" value={form.colors.sectionBgColor} onChange={(value) => setColor('sectionBgColor', value)} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Review Image (Optional)</label>
            {form.savedReviewImages.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {form.savedReviewImages.map((src, index) => (
                  <img key={`${src}-${index}`} src={src} alt={`Saved review ${index + 1}`} className="h-24 w-full rounded-lg border border-gray-200 object-cover" />
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {form.reviewImages.map((file, index) => (
                <input
                  key={index}
                  type="file"
                  accept="image/*"
                  onChange={(event) => setReviewImage(index, event.target.files[0] ?? null)}
                  className="min-w-[220px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:text-gray-600"
                />
              ))}
              <button
                type="button"
                onClick={addReviewImageSlot}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white transition hover:bg-green-600"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <TextInput label="Description Title" value={form.descriptionTitle} onChange={(value) => set('descriptionTitle', value)} required />
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor value={form.description} onChange={(value) => set('description', value)} />
          </div>
          <TextInput label="Why Choose Title" value={form.whyChooseTitle} onChange={(value) => set('whyChooseTitle', value)} required />
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Why Choose Us <span className="text-red-500">*</span>
            </label>
            <RichTextEditor value={form.whyChooseUs} onChange={(value) => set('whyChooseUs', value)} />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Countdown Time</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={form.countdownStart}
                  onChange={(event) => set('countdownStart', event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                <input
                  type="datetime-local"
                  value={form.countdownEnd}
                  min={form.countdownStart || undefined}
                  onChange={(event) => set('countdownEnd', event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <TextInput label="Campaign Template" value="Regular" onChange={() => {}} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">Status</label>
            <button
              type="button"
              onClick={() => set('status', !form.status)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${form.status ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`h-5 w-5 rounded-full bg-white shadow transition ${form.status ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-green-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
