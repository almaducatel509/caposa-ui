'use client';
import React, { useState, useEffect } from 'react';

// Using your existing interfaces
import { BranchData, PostData, EmployeeFormData, ErrorMessages } from './validations';
import { EmailField } from './EmailField';

const EmployeeFormFields: React.FC<{
  formData: EmployeeFormData;
  setFormData: (data: Partial<EmployeeFormData>) => void;
  errors: ErrorMessages<EmployeeFormData>;
  setErrors?: (errors: Partial<ErrorMessages<EmployeeFormData>>) => void;
  branches?: BranchData[];
  posts?: PostData[];
  isEditMode?: boolean;
  onKeepPasswordChange?: (keepCurrent: boolean) => void; // New prop to communicate password choice
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
  const [keepCurrentPassword, setKeepCurrentPassword] = useState(true); // Default: keep current password

  console.log('📋 Professional Employee Form:', {
    mode: isEditMode ? 'EDIT' : 'CREATE',
    branchesCount: branches.length,
    postsCount: posts.length,
    formData: formData
  });

  // Calculate form completion percentage for professional touch
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
    
    // For CREATE mode, include passwords
    // For EDIT mode, include passwords only if user wants to change them
    if (!isEditMode) {
      fields.push(formData.user.password, formData.user.confirm_password);
    } else if (!keepCurrentPassword) {
      fields.push(formData.user.password, formData.user.confirm_password);
    }
    
    const completed = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  // Communicate password choice to parent component
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
    const value = e.target.value;
    console.log('🏢 Branch selected:', value);
    setFormData({ branch: value });
  };

  const handlePostChange = (postId: string, isChecked: boolean) => {
    const currentPosts = formData.posts || [];
    let newPosts;
    
    if (isChecked) {
      newPosts = [...currentPosts, postId];
    } else {
      newPosts = currentPosts.filter(id => id !== postId);
    }
    
    console.log('💼 Posts updated:', newPosts);
    setFormData({ posts: newPosts });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ photo_profil: file });
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
    // This would open a separate modal for password management
    console.log('🔐 Opening password change modal...');
  };

  return (
    <div className="space-y-6">
      {/* Professional Progress Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Form Completion
          </span>
          <span className="text-sm font-bold text-green-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* User Account Section */}
      {/* Il faut aussi verifier si le emp en question a deja un compte */}

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">👤</span> User Account
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={formData.user.username}
              onChange={(e) => handleUserFieldChange('username', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              placeholder="Enter username"
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <EmailField
            value={formData.user.email}
            onChange={(value) => handleUserFieldChange('email', value)}
            context="employee"
            error={errors.email}  // ← Gère les erreurs serveur
            required
          />

          {/* Password Management - PROFESSIONAL APPROACH */}
          {isEditMode ? (
            /* EDIT MODE: Professional Password Management with Choice */
            <div className="md:col-span-2 space-y-4">
              {/* Keep Current Password Checkbox */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepCurrentPassword}
                    onChange={(e) => {
                      setKeepCurrentPassword(e.target.checked);
                      if (e.target.checked) {
                        // Clear password fields when keeping current
                        handleUserFieldChange('password', '');
                        handleUserFieldChange('confirm_password', '');
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 text-lg">🔐</span>
                    <div>
                      <span className="font-semibold text-blue-800">Keep current password</span>
                      <p className="text-sm text-blue-600">Recommended - only uncheck if you want to change the password</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Password Fields - Only show if user wants to change */}
              {!keepCurrentPassword && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-orange-600 text-lg">⚠️</span>
                    <h4 className="font-semibold text-orange-800">Change Password</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={formData.user.password}
                        onChange={(e) => handleUserFieldChange('password', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors"
                        placeholder="Enter new password"
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={formData.user.confirm_password}
                        onChange={(e) => handleUserFieldChange('confirm_password', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors"
                        placeholder="Confirm new password"
                      />
                      {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
                    </div>
                  </div>
                  
                  <div className="text-sm text-orange-700 bg-orange-100 p-3 rounded">
                    <strong>Note:</strong> Changing the password will require the employee to use the new password for their next login.
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* CREATE MODE: Standard Password Fields */
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.user.password}
                  onChange={(e) => handleUserFieldChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  placeholder="Enter password"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.user.confirm_password}
                  onChange={(e) => handleUserFieldChange('confirm_password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  placeholder="Confirm password"
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
          <span className="text-xl mr-2">👨‍💼</span> Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ first_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              placeholder="Enter first name"
            />
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ last_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              placeholder="Enter last name"
            />
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ date_of_birth: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
            />
            {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ gender: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer transition-colors"
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ phone_number: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              placeholder="Enter phone number (digits only)"
            />
            {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Reference *
            </label>
            <input
              type="text"
              value={formData.payment_ref}
              onChange={(e) => setFormData({ payment_ref: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              placeholder="Enter payment reference"
            />
            {errors.payment_ref && <p className="text-red-500 text-sm mt-1">{errors.payment_ref}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              placeholder="Enter full address"
              rows={3}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
            />
            {errors.photo_profil && <p className="text-red-500 text-sm mt-1">{errors.photo_profil}</p>}
          </div>
        </div>
      </div>

      {/* Work Assignment Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">🏢</span> Work Assignment
        </h3>
        
        {/* Branch Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branch * 
            <span className="text-xs text-gray-500 ml-2">({branches.length} available)</span>
          </label>
          <select
            value={formData.branch || ''}
            onChange={handleBranchChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors"
          >
            <option value="">Choose a branch</option>
            {branches.map((branch, index) => {
              console.log(`🏢 Rendering Branch ${index}:`, branch.id, branch.branch_name);
              return (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              );
            })}
          </select>
          {errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}
        </div>

        {/* Posts Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Posts * 
            <span className="text-xs text-gray-500 ml-2">({posts.length} available)</span>
            {formData.posts && formData.posts.length > 0 && (
              <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {formData.posts.length} selected
              </span>
            )}
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white max-h-40 overflow-y-auto">
            {posts.map((post) => (
              <label 
                key={post.id} 
                className="flex items-center space-x-3 py-2 hover:bg-gray-50 cursor-pointer rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.posts?.includes(post.id) || false}
                  onChange={(e) => handlePostChange(post.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 select-none">
                  {post.name || post.post_name}
                </span>
              </label>
            ))}
          </div>
          {errors.posts && <p className="text-red-500 text-sm mt-1">{errors.posts}</p>}
        </div>
      </div>

      {/* Current Selections Summary */}
      {(formData.branch || (formData.posts && formData.posts.length > 0)) && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2 flex items-center">
            <span className="mr-2">✅</span> Work Assignment Summary
          </h4>
          
          {formData.branch && (
            <div className="mb-2">
              <span className="text-sm font-medium text-green-700">Branch: </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {branches.find(b => b.id === formData.branch)?.branch_name || 'Unknown'}
              </span>
            </div>
          )}

          {formData.posts && formData.posts.length > 0 && (
            <div>
              <span className="text-sm font-medium text-blue-700">
                Posts ({formData.posts.length}): 
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.posts.map(postId => {
                  const post = posts.find(p => p.id === postId);
                  return (
                    <span 
                      key={postId} 
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
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