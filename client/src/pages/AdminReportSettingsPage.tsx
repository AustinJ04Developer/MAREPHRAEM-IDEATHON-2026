import React, { useEffect, useState, useRef } from 'react';
import {
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  Building,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { ReportSettings } from '../types';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const AdminReportSettingsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<ReportSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<ReportSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isRemovingImage, setIsRemovingImage] = useState<boolean>(false);
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings/report');
        if (res.data?.success && res.data?.data) {
          setSettings(res.data.data);
          setInitialSettings(res.data.data);
        }
      } catch (err: any) {
        toastError(err.message || 'Failed to fetch report settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [toastError]);

  const handleChange = (field: keyof ReportSettings, val: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: val });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await api.put('/admin/settings/report', settings);
      if (res.data?.success && res.data?.data) {
        success('Report header and institutional layout settings saved successfully.');
        setSettings(res.data.data);
        setInitialSettings(res.data.data);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (initialSettings) {
      setSettings({ ...initialSettings });
      success('Unsaved changes reverted.');
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toastError('Image file size must be less than 5 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('headerImage', file);

    setIsUploadingImage(true);
    try {
      const res = await api.post('/admin/settings/report/header-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.data) {
        success('Header image uploaded successfully.');
        if (settings) {
          setSettings({
            ...settings,
            headerImageKey: res.data.data.headerImageKey,
            headerImageMimeType: res.data.data.headerImageMimeType,
          });
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to upload header image.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImageConfirm = async () => {
    setIsRemovingImage(true);
    try {
      const res = await api.delete('/admin/settings/report/header-image');
      if (res.data?.success) {
        success('Header image removed.');
        if (settings) {
          setSettings({ ...settings, headerImageKey: null });
        }
        setShowRemoveModal(false);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to remove header image.');
    } finally {
      setIsRemovingImage(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
        Loading report header configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl font-times text-slate-800">
      {/* Title */}
      <div>
        <h2 className="font-times text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Report Header & Layout Settings
        </h2>
        <p className="font-times text-xs text-slate-600 font-medium">
          Customize official logos, institutional identity, and layout parameters for generated PDFs and official reports.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section A: Header Image Management */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Official Report Header Image</h3>
              <p className="text-xs text-slate-500">
                Upload college letterhead or event banner (PNG, JPEG, WebP up to 5 MB).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Image Preview Box */}
            <div className="w-full sm:w-72 h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden p-2 relative group">
              {settings.headerImageKey ? (
                <img
                  src={`/api/v1/uploads/header-image/${settings.headerImageKey}`}
                  alt="Active Header"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center space-y-1 text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto" />
                  <span className="text-xs font-semibold block">No image uploaded</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-50 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {isUploadingImage
                      ? 'Uploading...'
                      : settings.headerImageKey
                      ? 'Replace Header Image'
                      : 'Upload Header Image'}
                  </span>
                </button>

                {settings.headerImageKey && (
                  <button
                    type="button"
                    onClick={() => setShowRemoveModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Image</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                Recommended dimensions: 800×120px for best clarity on A4 documents.
              </p>
            </div>
          </div>
        </div>

        {/* Section B: Editable Report Identity */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Institutional Identity & Titles</h3>
              <p className="text-xs text-slate-500">Configure text displayed on official reports and PDFs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                College / Institution Name
              </label>
              <input
                type="text"
                value={settings.collegeName}
                onChange={(e) => handleChange('collegeName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Name
              </label>
              <input
                type="text"
                value={settings.eventName}
                onChange={(e) => handleChange('eventName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department / Organizing Cell
              </label>
              <input
                type="text"
                value={settings.departmentName}
                onChange={(e) => handleChange('departmentName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={settings.reportTitle}
                onChange={(e) => handleChange('reportTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Report Subtitle
              </label>
              <input
                type="text"
                value={settings.reportSubtitle}
                onChange={(e) => handleChange('reportSubtitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Footer Text
              </label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => handleChange('footerText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section C: Layout & Appearance Settings */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Layout & Dimension Parameters</h3>
              <p className="text-xs text-slate-500">Fine-tune alignment, image dimensions, and visibility flags.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Header Alignment</label>
              <select
                value={settings.headerAlignment}
                onChange={(e) => handleChange('headerAlignment', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Image Fit</label>
              <select
                value={settings.imageFit}
                onChange={(e) => handleChange('imageFit', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="contain">Contain (Preserve Ratio)</option>
                <option value="cover">Cover</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Maximum Image Height ({settings.maximumImageHeight}px)
              </label>
              <input
                type="range"
                min="40"
                max="200"
                value={settings.maximumImageHeight}
                onChange={(e) => handleChange('maximumImageHeight', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Visibility Toggles */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showReportTitle}
                onChange={(e) => handleChange('showReportTitle', e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <span>Show Report Title</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showGeneratedDate}
                onChange={(e) => handleChange('showGeneratedDate', e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <span>Show Generated Date</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showPageNumbers}
                onChange={(e) => handleChange('showPageNumbers', e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <span>Show Page Numbers</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showFooter}
                onChange={(e) => handleChange('showFooter', e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <span>Show Report Footer</span>
            </label>
          </div>
        </div>

        {/* Section D: Live Interactive Preview */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-brand-600" />
            <span>Live Header Preview</span>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            {settings.headerImageKey && (
              <div className={`flex ${settings.headerAlignment === 'center' ? 'justify-center' : settings.headerAlignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                <img
                  src={`/api/v1/uploads/header-image/${settings.headerImageKey}`}
                  alt="Live Header Preview"
                  style={{
                    maxHeight: `${settings.maximumImageHeight}px`,
                    objectFit: settings.imageFit,
                  }}
                  className="rounded-lg shadow-xs"
                />
              </div>
            )}

            <div className={`text-${settings.headerAlignment} space-y-1`}>
              <h4 className="text-sm font-black text-slate-900 uppercase">
                {settings.collegeName}
              </h4>
              {settings.departmentName && (
                <p className="text-xs font-bold text-brand-700">{settings.departmentName}</p>
              )}
              <p className="text-xs font-bold text-slate-800">{settings.eventName}</p>
              {settings.showReportTitle && (
                <div className="pt-1">
                  <h5 className="text-xs font-extrabold text-slate-900">{settings.reportTitle}</h5>
                  {settings.reportSubtitle && (
                    <p className="text-[11px] text-slate-500 italic">{settings.reportSubtitle}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Changes</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-50 transition-all"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal for Removing Image */}
      <ConfirmationModal
        isOpen={showRemoveModal}
        title="Remove Header Image"
        message="Are you sure you want to remove the current header image? The report header will revert to institutional text formatting."
        confirmLabel="Remove Image"
        isDestructive={true}
        isLoading={isRemovingImage}
        onConfirm={handleRemoveImageConfirm}
        onCancel={() => setShowRemoveModal(false)}
      />
    </div>
  );
};
