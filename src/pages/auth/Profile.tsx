import React from 'react'
import { UserProfile } from '@/components/common'

export const Profile: React.FC = () => {
  return (
    <div className="mx-auto py-8">
      <div className="max-w-2xl mx-auto w-full">
        <UserProfile />
      </div>
    </div>
  )
}
