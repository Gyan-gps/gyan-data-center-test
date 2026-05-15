import React from 'react';
import { useAdminAuthStore } from '@/store/adminAuthStore';

export const AdminDashboard: React.FC = () => {
  const { admin } = useAdminAuthStore();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>

      {admin && (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-gray-900 font-medium">{admin.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="text-gray-900 font-medium capitalize">{admin.role}</p>
          </div>
        </div>
      )}
    </div>
  );
};
