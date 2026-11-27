import React, { useState } from 'react';
import { X, Upload, CheckCircle2, ShieldCheck, AlertCircle, FileText, Edit2 } from 'lucide-react';
import { api } from '../../api/client';

interface LabUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (newAlerts: any[]) => void;
}

export const LabUploadModal: React.FC<LabUploadModalProps> = ({ isOpen, onClose, onVerified }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [analytes, setAnalytes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUploadAndOCR = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.uploadLabReport(formData);
      setReportData(res);
      setAnalytes(res.analytes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to extract lab report.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyteChange = (index: number, field: string, val: any) => {
    const updated = [...analytes];
    updated[index] = { ...updated[index], [field]: val };
    setAnalytes(updated);
  };

  const handleConfirmVerification = async () => {
    if (!reportData) return;
    setIsSaving(true);
    setError(null);

    try {
      const payload = analytes.map((a) => ({
        analyte_name: a.analyte_name,
        numeric_value: parseFloat(a.numeric_value) || 0,
        unit: a.unit,
        reference_range_low: a.reference_range_low ? parseFloat(a.reference_range_low) : null,
        reference_range_high: a.reference_range_high ? parseFloat(a.reference_range_high) : null,
        flag: a.flag,
      }));

      const res = await api.verifyLabReport(reportData.id, payload);
      onVerified(res.new_alerts_triggered || []);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to verify lab report.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-charcoal/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-cream rounded-t-[28px] sm:rounded-2xl max-w-3xl w-full border-t sm:border border-[#E2DBD0] shadow-warm-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
        
        {/* Mobile Swipe Grab Handle */}
        <div className="sm:hidden w-full pt-3 pb-1 flex justify-center bg-ivory">
          <div className="w-12 h-1.5 rounded-full bg-[#E2DBD0]" />
        </div>

        {/* Header */}
        <div className="bg-ivory border-b border-[#E2DBD0] px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal-dark flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-semibold text-charcoal">Upload Blood Test & Lab Report</h2>
              <p className="text-xs text-charcoal-muted flex items-center space-x-1 mt-0.5 line-clamp-1 sm:line-clamp-none">
                <ShieldCheck className="w-3.5 h-3.5 text-sage-dark shrink-0" />
                <span>Private & Secure • Kept confidential for your doctor.</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-cream hover:bg-oat-light border border-[#E2DBD0] text-charcoal-muted hover:text-charcoal flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-error-container border border-error/30 text-error rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!reportData ? (
            /* Upload Dropzone */
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#E2DBD0] hover:border-sage-dark rounded-2xl p-8 text-center transition-colors bg-white">
                <input
                  type="file"
                  id="labFileInput"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="labFileInput" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-sage-soft text-sage-dark flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-charcoal">
                    {selectedFile ? selectedFile.name : 'Select or drop blood test report'}
                  </span>
                  <span className="text-xs text-charcoal-muted mt-1 max-w-sm">
                    Supports PDFs or clear photos of hormone panels (FSH, Estradiol, TSH, Ferritin, etc.)
                  </span>
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal rounded-xl transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleUploadAndOCR}
                    className="px-5 py-2 text-xs font-medium text-white bg-sage-dark hover:bg-[#3E5437] rounded-xl shadow-warm-sm disabled:opacity-50 flex items-center space-x-2 transition-colors"
                  >
                    {isProcessing ? <span>Reading document...</span> : <span>Extract Lab Values</span>}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Interactive Verification Table */
            <div className="space-y-4">
              <div className="bg-sage-soft border border-sage/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-sage-dark">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-dark flex-shrink-0" />
                  <span>
                    Successfully extracted <strong>{analytes.length}</strong> parameters. Please review values before saving to your profile.
                  </span>
                </div>
                <span className="font-semibold text-charcoal">{reportData.file_name}</span>
              </div>

              <div className="border border-[#E2DBD0] rounded-xl overflow-hidden bg-white shadow-warm-sm">
                <table className="min-w-full divide-y divide-[#E2DBD0] text-xs">
                  <thead className="bg-ivory font-semibold text-charcoal">
                    <tr>
                      <th className="px-3.5 py-2.5 text-left">Test Name</th>
                      <th className="px-3.5 py-2.5 text-left">Value</th>
                      <th className="px-3.5 py-2.5 text-left">Unit</th>
                      <th className="px-3.5 py-2.5 text-left">Reference Range</th>
                      <th className="px-3.5 py-2.5 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DBD0]">
                    {analytes.map((item, idx) => (
                      <tr key={idx} className="hover:bg-ivory/50">
                        <td className="px-3.5 py-2.5 font-semibold text-charcoal">
                          {item.analyte_name}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <input
                            type="number"
                            step="0.01"
                            value={item.numeric_value}
                            onChange={(e) => handleAnalyteChange(idx, 'numeric_value', e.target.value)}
                            className="w-24 bg-ivory border border-[#E2DBD0] rounded-lg px-2.5 py-1 font-semibold text-charcoal text-xs focus:border-sage-dark focus:outline-none"
                          />
                        </td>
                        <td className="px-3.5 py-2.5 text-charcoal-muted">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleAnalyteChange(idx, 'unit', e.target.value)}
                            className="w-20 bg-ivory border border-[#E2DBD0] rounded-lg px-2 py-1 text-xs focus:border-sage-dark focus:outline-none"
                          />
                        </td>
                        <td className="px-3.5 py-2.5 text-charcoal-muted">
                          {item.reference_range_low !== null ? `${item.reference_range_low} - ${item.reference_range_high}` : 'N/A'}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <select
                            value={item.flag}
                            onChange={(e) => handleAnalyteChange(idx, 'flag', e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                              item.flag === 'high'
                                ? 'bg-peach-soft text-peach border-peach/30'
                                : item.flag === 'low'
                                ? 'bg-sand-soft text-[#B07D38] border-sand/40'
                                : 'bg-sage-soft text-sage-dark border-sage/30'
                            }`}
                          >
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E2DBD0]">
                <button
                  type="button"
                  onClick={() => {
                    setReportData(null);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal rounded-xl transition-colors"
                >
                  Upload Another File
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleConfirmVerification}
                  className="px-5 py-2 text-xs font-medium text-white bg-sage-dark hover:bg-[#3E5437] rounded-xl shadow-warm-sm disabled:opacity-50 flex items-center space-x-2 transition-colors"
                >
                  {isSaving ? <span>Saving...</span> : <span>Save to Health Record</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
