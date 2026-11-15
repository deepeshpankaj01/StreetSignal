import React, { useState, useRef } from 'react';
import { 
  CATEGORIES, 
  getCategoryMeta 
} from '../utils/categories';
import { createReport } from '../services/api';
import { 
  Camera, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  UploadCloud, 
  X, 
  Loader2, 
  Copy, 
  Check, 
  Search, 
  Navigation,
  FileImage
} from 'lucide-react';

const POPULAR_LOCALITIES = [
  'Indiranagar 100ft Road',
  'Koramangala 4th Block',
  'HSR Layout Sector 2',
  'Whitefield Main Road',
  'MG Road Junction',
  'Outer Ring Road'
];

export default function ReportForm({ onReportCreated, onTrackReport }) {
  const [category, setCategory] = useState('Potholes');
  const [locality, setLocality] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [locating, setLocating] = useState(false);

  // Photo state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Submission & UI States
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Handle Photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Selected image exceeds the 5MB file size limit. Please choose a smaller photo.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload JPEG, PNG, or WebP images.');
      return;
    }

    setErrorMessage('');
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Auto-detect location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setCoordinates({ latitude: lat, longitude: lng });
        if (!locality) {
          setLocality(`GPS: ${lat}° N, ${lng}° E`);
        }
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        setErrorMessage('Unable to retrieve your location. Please enter your locality manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!locality.trim()) {
      setErrorMessage('Please specify the issue locality or street address.');
      return;
    }

    if (description.trim().length < 5) {
      setErrorMessage('Please provide a brief description (minimum 5 characters).');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        category,
        locality: locality.trim(),
        description: description.trim(),
        reporterName: reporterName.trim() || 'Anonymous Citizen',
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude
      };

      const result = await createReport(payload, photoFile);
      setSuccessData(result);
      if (onReportCreated) onReportCreated(result);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit report. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (successData?.reportId) {
      navigator.clipboard.writeText(successData.reportId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetForm = () => {
    setSuccessData(null);
    setCategory('Potholes');
    setLocality('');
    setDescription('');
    setReporterName('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setCoordinates(null);
    setErrorMessage('');
  };

  // SUCCESS STATE VIEW
  if (successData) {
    const catMeta = getCategoryMeta(successData.category);
    const CatIcon = catMeta.icon;

    return (
      <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 civic-card-glow text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-semibold">
            Report Successfully Dispatched
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Signal Registered on DynamoDB
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Your civic report has been securely filed with the municipal authorities.
          </p>
        </div>

        {/* Reference ID Showcase Card */}
        <div className="p-4 rounded-xl bg-navy-950/80 border border-electric-blue/40 max-w-md mx-auto">
          <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">
            Your Unique Reference ID
          </p>
          <div className="flex items-center justify-center gap-3 mt-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-electric-cyan tracking-wider">
              {successData.reportId}
            </span>
            <button
              onClick={handleCopyId}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
              title="Copy Report ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">Copied to clipboard!</p>
          )}
        </div>

        {/* Summary Details */}
        <div className="text-left bg-navy-900/60 rounded-xl p-4 border border-white/5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Category:</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <CatIcon className={`w-3.5 h-3.5 ${catMeta.color}`} />
              {successData.category}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Locality:</span>
            <span className="font-semibold text-white">{successData.locality}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
              {successData.status}
            </span>
          </div>
          {successData.imageUrl && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-slate-400">Photograph:</span>
              <span className="text-electric-blue font-mono">Uploaded to Amazon S3</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onTrackReport(successData.reportId)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold text-sm shadow-glow-electric transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Track This Signal</span>
          </button>
          
          <button
            onClick={handleResetForm}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-white/10 text-sm font-medium transition-all"
          >
            File Another Issue
          </button>
        </div>
      </div>
    );
  }

  // STANDARD FORM VIEW
  return (
    <div className="max-w-3xl mx-auto my-6 sm:my-10 px-4">
      <div className="civic-card p-6 sm:p-8 relative">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-electric-blue font-semibold">
            <span className="w-2 h-2 rounded-full bg-electric-cyan" />
            Citizen Dispatch Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Report a Civic Issue
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Submit road, sanitation, streetlight, or water infrastructure issues. Photographs are securely uploaded to Amazon S3.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">{errorMessage}</div>
            <button 
              onClick={() => setErrorMessage('')} 
              className="text-rose-400 hover:text-rose-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs uppercase font-mono tracking-wider font-semibold text-slate-300 mb-2.5">
              1. Issue Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-navy-800/90 border-electric-blue shadow-glow-electric text-white ring-1 ring-electric-blue'
                        : 'bg-navy-950/60 border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${cat.bg} border ${cat.border} shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center justify-between">
                        <span>{cat.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-electric-cyan" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Locality Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase font-mono tracking-wider font-semibold text-slate-300">
                2. Locality / Street Address <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 text-xs text-electric-blue hover:text-electric-cyan font-medium transition-colors"
              >
                {locating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>{locating ? 'Detecting GPS...' : 'Detect GPS Location'}</span>
              </button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. 100ft Road, near Metro Pillar #142, Indiranagar"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950/80 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 transition-all"
                required
              />
            </div>

            {/* Quick Locality Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 mr-1">Quick pick:</span>
              {POPULAR_LOCALITIES.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setLocality(loc)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-slate-300 transition-all"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase font-mono tracking-wider font-semibold text-slate-300">
                3. Detailed Description <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {description.length}/1500 chars
              </span>
            </div>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity, exact landmark, road hazards, or how long the problem has persisted..."
              maxLength={1500}
              className="w-full p-3.5 rounded-xl bg-navy-950/80 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 transition-all leading-relaxed resize-y"
              required
            />
          </div>

          {/* 4. Optional Photograph Upload (S3 Presigned) */}
          <div>
            <label className="block text-xs uppercase font-mono tracking-wider font-semibold text-slate-300 mb-2">
              4. Evidence Photograph <span className="text-slate-400 font-normal">(Optional, max 5MB)</span>
            </label>

            {!photoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-electric-blue/50 rounded-xl p-6 text-center cursor-pointer transition-all bg-navy-950/40 hover:bg-navy-950/80 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-navy-800 flex items-center justify-center text-slate-400 group-hover:text-electric-cyan group-hover:bg-navy-750 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-200 mt-3">
                  Click or drag photo here to upload
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPG, PNG, WebP up to 5MB. Uploaded via Amazon S3 Presigned URL.
                </p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-navy-950/80 p-3 flex items-center gap-4">
                <img
                  src={photoPreview}
                  alt="Issue Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-electric-blue" />
                    <p className="text-sm font-medium text-white truncate">
                      {photoFile?.name}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(photoFile?.size / 1024).toFixed(1)} KB • Ready for S3 Direct Upload
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Validated
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2 rounded-lg bg-navy-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 5. Citizen Name (Optional) */}
          <div className="pt-2">
            <label className="block text-xs uppercase font-mono tracking-wider font-semibold text-slate-300 mb-2">
              Citizen Name / Organization <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="e.g. Rahul Sharma or Resident Welfare Association"
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950/80 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 max-w-xs sm:max-w-sm">
              Reports are written directly into DynamoDB via API Gateway & AWS Lambda.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-glow-electric transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to AWS...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Submit Civic Signal</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
