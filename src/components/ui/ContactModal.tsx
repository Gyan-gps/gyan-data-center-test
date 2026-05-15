/**
 * Success/Error Modal Component for Contact Form
 * A modal that shows success or error messages after form submission
 */

import React from 'react'
import { Modal } from './Modal'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  isError?: boolean
  title?: string
  message?: string
  subMessage?: string
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  isError = false,
  title = isError ? 'Error' : 'Thank you for reaching out.',
  message = isError 
    ? 'There was an error submitting your form. Please try again.' 
    : 'Someone from our team will get in touch with you shortly to assist with your inquiry.',
  subMessage
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className={`flex w-full justify-center rounded-lg p-6 ${
        isError ? 'bg-red-50' : 'bg-blue-50'
      }`}>
        <div className="flex flex-col items-center text-center">
          <h3 className={`text-xl font-bold ${
            isError ? 'text-red-600' : 'text-blue-900'
          } mb-2`}>
            {title}
          </h3>
          <p className="text-gray-600 mb-2">
            {message}
          </p>
          {subMessage && (
            <p className="text-gray-600 text-sm">
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ContactModal
