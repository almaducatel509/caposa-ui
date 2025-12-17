'use client';

import React, { useEffect, useRef, useState } from 'react';

interface EmployeePhotoFieldProps {
  value: File | string | null | undefined; // ✅ FIX
  onChange: (value: File | null) => void;
  onRemove: () => void;
  isEditMode?: boolean;
  error?: string;
}


const EmployeePhotoField: React.FC<EmployeePhotoFieldProps> = ({
  value,
  onChange,
  onRemove,
  isEditMode = false,
  error
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ===============================
   * Load existing photo (EDIT)
   * =============================== */
  useEffect(() => {
    if (isEditMode && typeof value === 'string') {
      setPreview(value);
    }
  }, [isEditMode, value]);

  /* ===============================
   * Cleanup memory
   * =============================== */
  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* ===============================
   * Handle file selection
   * =============================== */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onChange(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* ===============================
   * Remove photo
   * =============================== */
  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    onRemove(); // 🧠 send remove_photo=true

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        <span className="mr-2">📸</span> Profile Photo
      </label>

      {/* Preview */}
      {preview && (
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border shadow-sm">
          <div className="flex items-start gap-4">
            <div className="relative group">
              <img
                src={preview}
                alt="Employee preview"
                className="w-[132px] h-[132px] object-cover rounded-lg border-4 border-white shadow-lg"
              />
              <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-600">✓</span>
                <span className="font-medium text-gray-800">
                  {isEditMode ? 'Current photo' : 'Photo selected'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                JPG / PNG · max 5MB · square recommended
              </p>

              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition"
              >
                🗑️ Remove photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg
          bg-white cursor-pointer
          file:mr-4 file:px-4 file:py-2 file:rounded-md
          file:border-0 file:text-sm file:font-medium
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100 hover:border-blue-400 transition"
      />

      {!preview && (
        <p className="text-sm text-gray-500">💡 Click or drag to upload</p>
      )}

      {error && (
        <p className="text-sm text-red-600">⚠️ {error}</p>
      )}
    </div>
  );
};

export default EmployeePhotoField;
