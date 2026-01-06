'use client';

import React, { useState, useEffect } from 'react';
import { HAITI_DEPARTMENTS, getCitiesByDepartment } from '@/app/data/haitiLocations';
import type { DepartmentCode } from '@/app/data/haitiLocations';

import { BranchData, Post, EmployeeFormData, ErrorMessages } from './validations';
import { EmailField } from './EmailField';
import EmployeePhotoField from './EmployeePhotoField';

const EmployeeFormFields: React.FC<{
  formData: EmployeeFormData;
  setFormData: (data: Partial<EmployeeFormData>) => void;
  errors: ErrorMessages<EmployeeFormData>;
  setErrors?: (errors: Partial<ErrorMessages<EmployeeFormData>>) => void;
  branches?: BranchData[];
  posts?: Post[];
  isEditMode?: boolean;
  onKeepPasswordChange?: (keepCurrent: boolean) => void;
}> = ({ 
  formData, 
  setFormData, 
  errors, 
  setErrors,
  branches = [],  
  posts = [], 
  isEditMode = false,
  onKeepPasswordChange
}) => {

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [keepCurrentPassword, setKeepCurrentPassword] = useState(true);
  
  // ✅ Local state for Haiti address components
  const [departmentCode, setDepartmentCode] = useState<DepartmentCode>(HAITI_DEPARTMENTS[0].code);
  const [city, setCity] = useState<string>('');
  const [street, setStreet] = useState<string>('');

  console.log('📋 Professional Employee Form:', {
    mode: isEditMode ? 'EDIT' : 'CREATE',
    branchesCount: branches.length,
    postsCount: posts.length,
    formData: formData
  });

  // ✅ Parse existing address in edit mode
  useEffect(() => {
    if (isEditMode && formData.address) {
      // Try to parse "35, Tozin, Limonade" format
      const parts = formData.address.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        setStreet(parts[0] || '');
        setCity(parts[1] || '');
        // Try to find department from city
        const dept = HAITI_DEPARTMENTS.find(d => 
          getCitiesByDepartment(d.code)?.includes(parts[1])
        );
        if (dept) setDepartmentCode(dept.code);
      } else {
        setStreet(formData.address);
      }
    }
  }, [isEditMode, formData.address]);

  // ✅ Compose full address when components change
  useEffect(() => {
    const full = [street.trim(), city.trim()].filter(Boolean).join(', ');
    if (full !== formData.address) {
      setFormData({ address: full });
    }
  }, [street, city]);

  const clearFieldError = (key: keyof EmployeeFormData) => {
    if (!setErrors) return;
    setErrors({ [key]: undefined });
  };

  const calculateCompletion = () => {
    const fields = [
      formData.user.username,
      formData.user.email,
      formData.first_name,
      formData.last_name,
      formData.date_of_birth,
      formData.phone_number,
      formData.address,
      formData.gender,
      formData.payment_ref,
      formData.branch,
      formData.posts?.length > 0 ? 'has_posts' : ''
    ];
    
    if (!isEditMode) {
      fields.push(formData.user.password, formData.user.confirm_password);
    } else if (!keepCurrentPassword) {
      fields.push(formData.user.password, formData.user.confirm_password);
    }
    
    const completed = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  useEffect(() => {
    if (onKeepPasswordChange) {
      onKeepPasswordChange(keepCurrentPassword);
    }
  }, [keepCurrentPassword, onKeepPasswordChange]);

  const handleUserFieldChange = (field: keyof EmployeeFormData['user'], value: string) => {
    setFormData({
      user: {
        ...formData.user,
        [field]: value
      }
    });
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ branch: e.target.value });
  };

  const handlePostChange = (postId: string, isChecked: boolean) => {
    const currentPosts = formData.posts || [];
    const newPosts = isChecked 
      ? [...currentPosts, postId]
      : currentPosts.filter(id => id !== postId);
    
    setFormData({ posts: newPosts });
  };

  return (
    <div className="space-y-6">
      {/* Professional Progress Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Form Completion</span>
          <span className="text-sm font-bold text-green-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* User Account Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">👤</span> Compte Utilisateur
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur *</label>
            <input
              type="text"
              value={formData.user.username}
              onChange={(e) => handleUserFieldChange('username', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              placeholder="Entrer le nom d'utilisateur"
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <EmailField
            value={formData.user.email}
            onChange={(value) => handleUserFieldChange('email', value)}
            context="employee"
            error={errors.email}
            required
          />

          {/* Password Management */}
          {isEditMode ? (
            <div className="md:col-span-2 space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepCurrentPassword}
                    onChange={(e) => {
                      setKeepCurrentPassword(e.target.checked);
                      if (e.target.checked) {
                        handleUserFieldChange('password', '');
                        handleUserFieldChange('confirm_password', '');
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 text-lg">🔐</span>
                    <div>
                      <span className="font-semibold text-blue-800">Garder le mot de passe actuel</span>
                      <p className="text-sm text-blue-600">Recommandé - décocher uniquement pour changer</p>
                    </div>
                  </div>
                </label>
              </div>

              {!keepCurrentPassword && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-orange-600 text-lg">⚠️</span>
                    <h4 className="font-semibold text-orange-800">Changer le mot de passe</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe *</label>
                      <input
                        type="password"
                        value={formData.user.password}
                        onChange={(e) => handleUserFieldChange('password', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                        placeholder="Entrer le nouveau mot de passe"
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                      <input
                        type="password"
                        value={formData.user.confirm_password}
                        onChange={(e) => handleUserFieldChange('confirm_password', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                        placeholder="Confirmer le mot de passe"
                      />
                      {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                <input
                  type="password"
                  value={formData.user.password}
                  onChange={(e) => handleUserFieldChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="Entrer le mot de passe"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={formData.user.confirm_password}
                  onChange={(e) => handleUserFieldChange('confirm_password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="Confirmer le mot de passe"
                />
                {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">👨‍💼</span> Informations Personnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ first_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Entrer le prénom"
            />
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ last_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Entrer le nom"
            />
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ date_of_birth: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genre *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ gender: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Sélectionner le genre</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="other">Autre</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ phone_number: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Numéro de téléphone"
            />
            {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Référence de paiement *</label>
            <input
              type="text"
              value={formData.payment_ref}
              onChange={(e) => setFormData({ payment_ref: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Référence de paiement"
            />
            {errors.payment_ref && <p className="text-red-500 text-sm mt-1">{errors.payment_ref}</p>}
          </div>

          {/* ✅ Haiti Address Components */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Département *</label>
            <select
              value={departmentCode}
              onChange={(e) => {
                const code = e.target.value as DepartmentCode;
                setDepartmentCode(code);
                setCity(''); // Reset city when department changes
                clearFieldError('address');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Sélectionner un département</option>
              {HAITI_DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                clearFieldError('address');
              }}
              disabled={!departmentCode}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sélectionner une ville</option>
              {departmentCode && getCitiesByDepartment(departmentCode)?.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rue / Numéro de maison *</label>
            <input
              type="text"
              value={street}
              onChange={(e) => {
                setStreet(e.target.value);
                clearFieldError('address');
              }}
              placeholder="Ex: 35, Tozin"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Adresse complète: <strong>{formData.address || '—'}</strong>
            </p>
          </div>

          <div className="md:col-span-2">
            <EmployeePhotoField
              value={formData.photo_profil}
              isEditMode={isEditMode}
              error={errors.photo_profil}
              onChange={(file) => setFormData({ photo_profil: file, remove_photo: false })}
              onRemove={() => setFormData({ photo_profil: null, remove_photo: true })}
            />
          </div>
        </div>
      </div>

      {/* Work Assignment Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">🏢</span> Affectation de Travail
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branche * <span className="text-xs text-gray-500 ml-2">({branches.length} disponibles)</span>
          </label>
          <select
            value={formData.branch || ''}
            onChange={handleBranchChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Choisir une branche</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
          {errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Postes * <span className="text-xs text-gray-500 ml-2">({posts.length} disponibles)</span>
            {formData.posts && formData.posts.length > 0 && (
              <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {formData.posts.length} sélectionnés
              </span>
            )}
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white max-h-40 overflow-y-auto">
            {posts.map((post) => (
              <label key={post.id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 cursor-pointer rounded">
                <input
                  type="checkbox"
                  checked={formData.posts?.includes(post.id) || false}
                  onChange={(e) => handlePostChange(post.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900">{post.name || post.post_name}</span>
              </label>
            ))}
          </div>
          {errors.posts && <p className="text-red-500 text-sm mt-1">{errors.posts}</p>}
        </div>
      </div>

      {/* Summary */}
      {(formData.branch || (formData.posts && formData.posts.length > 0)) && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2 flex items-center">
            <span className="mr-2">✅</span> Résumé de l'affectation
          </h4>
          
          {formData.branch && (
            <div className="mb-2">
              <span className="text-sm font-medium text-green-700">Branche: </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {branches.find(b => b.id === formData.branch)?.branch_name || 'Unknown'}
              </span>
            </div>
          )}

          {formData.posts && formData.posts.length > 0 && (
            <div>
              <span className="text-sm font-medium text-blue-700">Postes ({formData.posts.length}): </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.posts.map(postId => {
                  const post = posts.find(p => p.id === postId);
                  return (
                    <span key={postId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {post?.name || post?.post_name || 'Unknown'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeFormFields;