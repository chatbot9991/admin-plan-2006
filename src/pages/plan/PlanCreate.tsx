import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';

const AVAILABLE_MODELS = [
  'imagen-4.0-generate-001',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gpt-4o',
  'gpt-4o-mini',
  'o1-mini',
  'dall-e-3',
  'gpt-3.5-turbo',
  'whisper-1',
  'grok-4',
  'grok-2-image-1212',
];

const CHATGPT_TOOLS = ['web_search', 'file_search', 'code_interpreter', 'image_generation'];
const GEMINI_TOOLS = ['googleSearch', 'image_generation'];
const GROK_TOOLS = ['web_search', 'file_search', 'code_interpreter'];

const PlanCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiList, setAiList] = useState<any[]>([]);
  const [aiOptionList, setAiOptionList] = useState<any[]>([]);

  // برای مدیریت باز و بسته بودن Dropdown ها
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  let userOwnId = '';
  try {
    const authStorageStr = localStorage.getItem('auth-storage');
    if (authStorageStr) {
      const authData = JSON.parse(authStorageStr);
      userOwnId = authData?.state?.user?._id || '';
    }
  } catch (error) {
    console.error('خطا در خواندن اطلاعات کاربر از لوکال استوریج:', error);
  }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultAi: '',
    defaultAiOption: '',
    price: 0,
    points: 0,
    duration: 30,
    limitOfRequest: 0,
    limitUploadFiles: 0,
    ais: [] as string[],
    toolsChatgpt: [] as string[],
    toolsGemini: [] as string[],
    toolsGrok: [] as string[],
    models: [] as string[],
    descriptionArray: [''],
    numberOfUsers: 1,
    typePay: 'Month',
    type: 'public',
    highlight: false,
    userOwn: userOwnId,
    order: 0,
  });

  useEffect(() => {
    const fetchAisAndOptions = async () => {
      try {
        // دریافت لیست AI
        const aiRes = await api.get('/ai/list');
        if (aiRes.data?.result?.[0]?.data) {
          setAiList(aiRes.data.result[0].data);
        }

        // دریافت لیست آپشن‌های AI
        const optRes = await api.get('/ai-option/list');
        if (optRes.data?.result?.[0]?.data) {
          setAiOptionList(optRes.data.result[0].data);
        }
      } catch (error) {
        console.error('خطا در دریافت اطلاعات AI:', error);
      }
    };
    fetchAisAndOptions();
  }, []);

  // بستن دراپ‌داون هنگام کلیک بیرون از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMultiSelect = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.descriptionArray];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, descriptionArray: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, descriptionArray: [...prev.descriptionArray, ''] }));
  };

  const removeFeature = (index: number) => {
    if (formData.descriptionArray.length > 1) {
      const newFeatures = formData.descriptionArray.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, descriptionArray: newFeatures }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        descriptionArray: formData.descriptionArray.filter((f) => f.trim() !== ''),
      };

      await api.post('/plan/create', submitData);
      toast.success('پلن با موفقیت ایجاد شد!');
      navigate('/plans');
    } catch (error: any) {
      console.error('خطا در ایجاد پلن:', error);
      toast.error(error.response?.data?.message || 'خطای اعتبارسنجی. لطفاً مقادیر را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">ایجاد پلن جدید</h2>
          <p className="text-secondary mb-0">اطلاعات را بر اساس نیازمندی‌های سیستم وارد کنید</p>
        </div>
        <Link to="/plans" className="btn btn-outline-secondary rounded-pill px-4">
          <i className="bi bi-arrow-right me-2"></i>
          بازگشت به لیست
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white" ref={dropdownRef}>
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">نام پلن (Name)</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control form-control-lg bg-light border-0"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">
                  توضیحات (حداقل ۱۰ کاراکتر)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control bg-light border-0"
                  rows={3}
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-secondary d-block mb-3">
                  ویژگی‌های پلن (Description Array)
                </label>
                {formData.descriptionArray.map((feature, index) => (
                  <div key={index} className="d-flex mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="form-control bg-light border-0 me-2"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="btn btn-outline-danger me-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn btn-sm btn-outline-primary mt-2"
                >
                  <i className="bi bi-plus-circle me-1"></i> افزودن ویژگی
                </button>
              </div>

              <hr className="my-4 text-muted" />

              <h6 className="fw-bold mb-3 text-dark">دسترسی‌ها و ابزارها</h6>

              <div className="row g-3 mb-4">
                <div className="col-md-4 position-relative">
                  <label className="form-label fw-bold text-secondary small">
                    ابزارهای ChatGPT
                  </label>
                  <button
                    type="button"
                    className="form-control bg-light border-0 text-start d-flex justify-content-between"
                    onClick={() => setOpenDropdown(openDropdown === 'chatgpt' ? null : 'chatgpt')}
                  >
                    <span className={formData.toolsChatgpt.length ? 'text-dark' : 'text-muted'}>
                      {formData.toolsChatgpt.length
                        ? `${formData.toolsChatgpt.length} مورد`
                        : 'انتخاب'}
                    </span>
                    <i className="bi bi-chevron-down"></i>
                  </button>
                  {openDropdown === 'chatgpt' && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 p-2"
                      style={{ zIndex: 10 }}
                    >
                      {CHATGPT_TOOLS.map((tool) => (
                        <div className="form-check mb-1" key={tool}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`gpt-${tool}`}
                            checked={formData.toolsChatgpt.includes(tool)}
                            onChange={() => toggleMultiSelect('toolsChatgpt', tool)}
                          />
                          <label
                            className="form-check-label w-100"
                            htmlFor={`gpt-${tool}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {tool}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-md-4 position-relative">
                  <label className="form-label fw-bold text-secondary small">ابزارهای Gemini</label>
                  <button
                    type="button"
                    className="form-control bg-light border-0 text-start d-flex justify-content-between"
                    onClick={() => setOpenDropdown(openDropdown === 'gemini' ? null : 'gemini')}
                  >
                    <span className={formData.toolsGemini.length ? 'text-dark' : 'text-muted'}>
                      {formData.toolsGemini.length
                        ? `${formData.toolsGemini.length} مورد`
                        : 'انتخاب'}
                    </span>
                    <i className="bi bi-chevron-down"></i>
                  </button>
                  {openDropdown === 'gemini' && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 p-2"
                      style={{ zIndex: 10 }}
                    >
                      {GEMINI_TOOLS.map((tool) => (
                        <div className="form-check mb-1" key={tool}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`gemini-${tool}`}
                            checked={formData.toolsGemini.includes(tool)}
                            onChange={() => toggleMultiSelect('toolsGemini', tool)}
                          />
                          <label
                            className="form-check-label w-100"
                            htmlFor={`gemini-${tool}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {tool}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-md-4 position-relative">
                  <label className="form-label fw-bold text-secondary small">ابزارهای Grok</label>
                  <button
                    type="button"
                    className="form-control bg-light border-0 text-start d-flex justify-content-between"
                    onClick={() => setOpenDropdown(openDropdown === 'grok' ? null : 'grok')}
                  >
                    <span className={formData.toolsGrok.length ? 'text-dark' : 'text-muted'}>
                      {formData.toolsGrok.length ? `${formData.toolsGrok.length} مورد` : 'انتخاب'}
                    </span>
                    <i className="bi bi-chevron-down"></i>
                  </button>
                  {openDropdown === 'grok' && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 p-2"
                      style={{ zIndex: 10 }}
                    >
                      {GROK_TOOLS.map((tool) => (
                        <div className="form-check mb-1" key={tool}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`grok-${tool}`}
                            checked={formData.toolsGrok.includes(tool)}
                            onChange={() => toggleMultiSelect('toolsGrok', tool)}
                          />
                          <label
                            className="form-check-label w-100"
                            htmlFor={`grok-${tool}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {tool}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6 position-relative">
                  <label className="form-label fw-bold text-secondary">
                    لیست AI های دسترسی‌پذیر (ais)
                  </label>
                  <button
                    type="button"
                    className="form-control bg-light border-0 text-start d-flex justify-content-between align-items-center"
                    onClick={() => setOpenDropdown(openDropdown === 'ais' ? null : 'ais')}
                  >
                    <span className={formData.ais.length ? 'text-dark' : 'text-muted'}>
                      {formData.ais.length > 0
                        ? `${formData.ais.length} مورد انتخاب شده`
                        : 'انتخاب کنید...'}
                    </span>
                    <i className={`bi bi-chevron-${openDropdown === 'ais' ? 'up' : 'down'}`}></i>
                  </button>
                  {openDropdown === 'ais' && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 p-2"
                      style={{ zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {aiList.map((ai: any) => (
                        <div className="form-check mb-1" key={ai._id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`ai-${ai._id}`}
                            checked={formData.ais.includes(ai._id)}
                            onChange={() => toggleMultiSelect('ais', ai._id)}
                          />
                          <label
                            className="form-check-label w-100"
                            htmlFor={`ai-${ai._id}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {ai.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-md-6 position-relative">
                  <label className="form-label fw-bold text-secondary">مدل‌های مجاز (models)</label>
                  <button
                    type="button"
                    className="form-control bg-light border-0 text-start d-flex justify-content-between align-items-center"
                    onClick={() => setOpenDropdown(openDropdown === 'models' ? null : 'models')}
                  >
                    <span className={formData.models.length ? 'text-dark' : 'text-muted'}>
                      {formData.models.length > 0
                        ? `${formData.models.length} مورد انتخاب شده`
                        : 'انتخاب کنید...'}
                    </span>
                    <i className={`bi bi-chevron-${openDropdown === 'models' ? 'up' : 'down'}`}></i>
                  </button>
                  {openDropdown === 'models' && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 p-2"
                      style={{ zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {AVAILABLE_MODELS.map((model) => (
                        <div className="form-check mb-1" key={model}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`model-${model}`}
                            checked={formData.models.includes(model)}
                            onChange={() => toggleMultiSelect('models', model)}
                          />
                          <label
                            className="form-check-label w-100"
                            htmlFor={`model-${model}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {model}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary">AI پیش‌فرض</label>
                  <select
                    name="defaultAi"
                    value={formData.defaultAi}
                    onChange={handleInputChange}
                    className="form-select bg-light border-0"
                    required
                  >
                    <option value="" disabled>
                      انتخاب هوش مصنوعی پیش‌فرض
                    </option>
                    {aiList.map((ai: any) => (
                      <option key={ai._id} value={ai._id}>
                        {ai.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary">آپشن پیش‌فرض AI</label>
                  <select
                    name="defaultAiOption"
                    value={formData.defaultAiOption}
                    onChange={handleInputChange}
                    className="form-select bg-light border-0"
                    required
                  >
                    <option value="" disabled>
                      انتخاب آپشن پیش‌فرض
                    </option>
                    {aiOptionList.map((opt: any) => (
                      <option key={opt._id} value={opt._id}>
                        {opt.name || opt.title || 'بدون نام'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
              style={{ top: '20px' }}
            >
              <h5 className="fw-bold mb-4 border-bottom pb-2">تنظیمات و محدودیت‌ها</h5>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-secondary small">قیمت</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-control bg-light border-0"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary small">امتیاز (Points)</label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    className="form-control bg-light border-0"
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-secondary small">مدت زمان (Duration)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="form-control bg-light border-0"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary small">ترتیب (Order)</label>
                  <input
                    type="number"
                    name="order"
                    max={4}
                    min={1}
                    value={formData.order}
                    onChange={handleInputChange}
                    className="form-control bg-light border-0"
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-secondary small">دوره پرداخت</label>
                  <select
                    name="typePay"
                    value={formData.typePay}
                    onChange={handleInputChange}
                    className="form-select bg-light border-0"
                  >
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                    <option value="season">season</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary small">نوع پلن (type)</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-select bg-light border-0"
                  >
                    <option value="public">public</option>
                    <option value="organization">organization</option>
                    <option value="single">single</option>
                  </select>
                </div>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-4">
                  <label className="form-label text-secondary small" title="محدودیت درخواست">
                    درخواست
                  </label>
                  <input
                    type="number"
                    name="limitOfRequest"
                    value={formData.limitOfRequest}
                    onChange={handleInputChange}
                    className="form-control bg-light border-0 px-1 text-center"
                    min="2"
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-secondary small" title="محدودیت فایل">
                    فایل
                  </label>
                  <input
                    type="number"
                    name="limitUploadFiles"
                    value={formData.limitUploadFiles}
                    onChange={handleInputChange}
                    className="form-control bg-light border-0 px-1 text-center"
                    min="2"
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-secondary small" title="تعداد کاربران">
                    کاربر
                  </label>
                  <input
                    type="number"
                    name="numberOfUsers"
                    value={formData.numberOfUsers}
                    onChange={handleInputChange}
                    className="form-control bg-light border-0 px-1 text-center"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-check form-switch mb-4 bg-light p-3 rounded-3 d-flex justify-content-between align-items-center">
                <label className="form-check-label fw-bold mb-0" htmlFor="highlight">
                  ویژه کردن پلن (Highlight)
                </label>
                <input
                  className="form-check-input m-0"
                  type="checkbox"
                  role="switch"
                  id="highlight"
                  name="highlight"
                  checked={formData.highlight}
                  onChange={handleInputChange}
                  style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm"
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i> ذخیره پلن
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlanCreate;
