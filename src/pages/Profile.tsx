import React from 'react'
import { UserProfile } from '@/components/common'

export const Profile: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Profile</h1>
        <UserProfile />
      </div>
    </div>
  )
}
