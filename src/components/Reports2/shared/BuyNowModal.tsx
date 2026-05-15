import React from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import type { Report } from "@/network/datacenter/datacenter.types";
import type { User } from "@/types";

interface BuyNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  user: User | null;
  isSendingInterest: boolean;
  onConfirmInterest: () => void;
}

export const BuyNowModal: React.FC<BuyNowModalProps> = ({
  isOpen,
  onClose,
  report,
  user,
  isSendingInterest,
  onConfirmInterest,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Purchase Interest"
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Are you interested in purchasing this report?
          </h4>
          <p className="text-sm text-gray-700 font-medium">{report.title}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-2">📞 What happens next?</p>
            <ul className="space-y-1 text-sm">
              <li>• Our sales team will contact you within 24 hours</li>
              <li>
                • We'll provide detailed pricing and customization options
              </li>
              <li>• You can discuss your specific requirements</li>
              <li>• No obligation to purchase</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-center">
            🎯 Get personalized pricing and consultation
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
            disabled={isSendingInterest}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onConfirmInterest}
            disabled={isSendingInterest || !user?.email}
            className="flex-1 bg-[#189cde] hover:bg-[#457ffc] text-white disabled:bg-gray-400"
          >
            {isSendingInterest ? "Sending..." : "Yes, I'm Interested"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};