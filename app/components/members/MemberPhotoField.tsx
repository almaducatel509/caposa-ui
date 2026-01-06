'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MemberPhotoFieldProps {
  value: File | string | null | undefined;
  onChange: (value: File | null) => void;
  onRemove: () => void;
  isEditMode?: boolean;
  error?: string;
}

const MemberPhotoField: React.FC<MemberPhotoFieldProps> = ({
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

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
    onRemove();

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        <span className="mr-2">📸</span> Photo du Membre
      </label>

      {/* Preview */}
      {preview && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="relative group">
              <img
                src={preview}
                alt="Member preview"
                className="w-[132px] h-[132px] object-cover rounded-full border-4 border-white shadow-lg ring-2 ring-purple-300"
              />
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-purple-600">✓</span>
                <span className="font-medium text-gray-800">
                  {isEditMode ? 'Photo actuelle' : 'Photo sélectionnée'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                JPG / PNG · max 5MB · format carré recommandé
              </p>

              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition"
              >
                🗑️ Retirer la photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload */}
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg
            bg-white cursor-pointer
            file:mr-4 file:px-4 file:py-2 file:rounded-md
            file:border-0 file:text-sm file:font-medium
            file:bg-purple-50 file:text-purple-700
            hover:file:bg-purple-100 hover:border-purple-400 transition"
        />
      </div>

      {!preview && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>💡</span>
          <span>Cliquez ou glissez pour télécharger une photo</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}

      {/* Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <p className="text-xs text-purple-800">
          <span className="font-semibold">💡 Conseil :</span> Utilisez une photo de profil claire avec un fond neutre pour une meilleure identification.
        </p>
      </div>
    </div>
  );
};

export default MemberPhotoField;