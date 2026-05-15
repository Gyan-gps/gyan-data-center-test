import React from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import type { Report } from "@/network/datacenter/datacenter.types";
import type { User } from "@/types";

interface GetAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  user: User | null;
  isRequesting: boolean;
  onConfirmRequest: () => void;
}

export const GetAccessModal: React.FC<GetAccessModalProps> = ({
  isOpen,
  onClose,
  report,
  user,
  isRequesting,
  onConfirmRequest,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Report Access"
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Are you sure you want to request this report?
          </h4>
          <p className="text-sm text-gray-700 font-medium">{report.title}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Current On Demand Credits:
            </span>
            <span className="text-lg font-bold text-gray-900">
              {user?.onDemandRemainingCredits || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-red-600">
              This will cost:
            </span>
            <span className="text-sm font-bold text-red-600">
              1 On Demand Credit
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-center">
            📧 Delivery within 24-72 Hours
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
            disabled={isRequesting}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onConfirmRequest}
            disabled={isRequesting || !user?.onDemandRemainingCredits}
            className="flex-1 bg-[#189cde] hover:bg-[#457ffc] text-white disabled:bg-gray-400"
          >
            {isRequesting ? "Processing..." : "Confirm Request"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};