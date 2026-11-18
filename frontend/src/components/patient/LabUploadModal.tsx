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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">100% Local Lab Report Extraction</h2>
              <p className="text-xs text-teal-100 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>Extracted locally with PyTesseract & pdfplumber • Zero external API transmission</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!reportData ? (
            /* Upload Dropzone */
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-teal-500 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="labFileInput"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="labFileInput" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-3 shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Select or drop blood test report'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Supports digital PDFs, camera photos, or scanned images (FSH, LH, TSH, Hb, Vit D, etc.)
                  </span>
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleUploadAndOCR}
                    className="px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isProcessing ? <span>Processing OCR Locally...</span> : <span>Extract Lab Data Locally</span>}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Interactive Verification Table */
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between text-xs text-teal-900">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>
                    Successfully extracted <b>{analytes.length}</b> clinical parameters locally. Please review and verify before committing.
                  </span>
                </div>
                <span className="font-semibold text-slate-500">{reportData.file_name}</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Analyte</th>
                      <th className="px-3 py-2 text-left">Numeric Value</th>
                      <th className="px-3 py-2 text-left">Unit</th>
                      <th className="px-3 py-2 text-left">Ref Range</th>
                      <th className="px-3 py-2 text-left">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {analytes.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2 font-semibold text-slate-900">
                          {item.analyte_name}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.numeric_value}
                            onChange={(e) => handleAnalyteChange(idx, 'numeric_value', e.target.value)}
                            className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-800"
                          />
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleAnalyteChange(idx, 'unit', e.target.value)}
                            className="w-20 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5"
                          />
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {item.reference_range_low !== null ? `${item.reference_range_low} - ${item.reference_range_high}` : 'N/A'}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.flag}
                            onChange={(e) => handleAnalyteChange(idx, 'flag', e.target.value)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                              item.flag === 'high'
                                ? 'bg-rose-100 text-rose-700 border-rose-300'
                                : item.flag === 'low'
                                ? 'bg-amber-100 text-amber-700 border-amber-300'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-300'
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

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setReportData(null);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Upload Another
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleConfirmVerification}
                  className="px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSaving ? <span>Saving Verified Data...</span> : <span>Confirm & Save to Record</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
