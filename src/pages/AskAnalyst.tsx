import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { Button, Card, Input, Select } from "@/components/ui";
import { askAnalyst, generatePresignedUrl } from "@/network/user/user.api";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { HelpCircle } from "lucide-react";

// Request type options
const REQUEST_TYPES = [
  { value: "Data Center Creation/Update", label: "Data Center Creation/Update" },
  { value: "Data Correction", label: "Data Correction" },
  { value: "Export", label: "Export" },
  { value: "Reports", label: "Reports" },
  { value: "Custom", label: "Custom" },
  { value: "Others", label: "Others" },
];

// Allowed file types for attachments (reference files only)
const ALLOWED_FILE_TYPES = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  // Archives (for documentation)
  "application/zip",
  "application/x-rar-compressed",
];

const ALLOWED_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".zip",
  ".rar",
];

export const AskAnalyst: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    requestType: "",
    consentGiven: false,
  });
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
    size: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form validation
  const isFormValid = () => {
    return (
      formData.message !== "" &&
      formData.requestType.trim() !== "" &&
      formData.consentGiven &&
      user?.name &&
      user?.email &&
      user?.company
    );
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle file upload immediately when selected
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0]; // Only take the first file
    const maxFileSize = 11 * 1024 * 1024; // 10 MB in bytes

    // Check if there's already an uploaded file
    if (uploadedFile) {
      toast.error(
        "Only one file is allowed. Please remove the existing file first."
      );
      e.target.value = ""; // Clear the input
      return;
    }

    // Validate file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      ALLOWED_FILE_TYPES.includes(file.type) ||
      ALLOWED_FILE_EXTENSIONS.includes(fileExtension || "");

    if (!isValidType) {
      toast.error(
        `File type not allowed. Please upload reference files only (images, PDFs, documents). Executable and code files are not permitted.`
      );
      e.target.value = ""; // Clear the input
      return;
    }

    // Check file size
    if (file.size > maxFileSize) {
      toast.error(`File too large: ${file.name}. Maximum file size is 10 MB.`);
      e.target.value = ""; // Clear the input
      return;
    }

    setUploading(true);

    try {
      toast.loading("Uploading file...", { id: "file-upload" });

      // Upload file immediately
      const fileUrl = await uploadFile(file);
      setUploadedFile({
        name: file.name,
        url: fileUrl,
        size: file.size,
      });

      toast.dismiss("file-upload");
      toast.success("File uploaded successfully");
    } catch {
      toast.dismiss("file-upload");
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      // Clear the input so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  // Upload file to presigned URL
  const uploadFile = async (file: File): Promise<string> => {
    try {
      // 1. Get presigned URL from backend
      const presignedUrlResponse = await generatePresignedUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // 2. Upload file to presigned URL
      await axios.put(presignedUrlResponse.uploadUrl, file, {
        headers: {
          "Content-Type": presignedUrlResponse.contentType,
          "Content-Disposition": presignedUrlResponse.contentDisposition,
        },
      });

      // 3. Return file URL for form submission
      return presignedUrlResponse.fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload ${file.name}`);
    }
  };

  // Remove uploaded file
  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fill out all required fields and ensure your profile is complete");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send request to backend with form data and uploaded file URL
      await askAnalyst({
        name: user?.name || "",
        email: user?.email || "",
        company: user?.company || "",
        message: formData.message,
        attachments: uploadedFile ? uploadedFile.url : undefined,
        requestType: formData.requestType,
      });

      // Show success message
      toast.success("Your request has been submitted successfully!");

      // Redirect to home page
      navigate("/home");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel form
  // const handleCancel = () => {
  //   navigate(-1);
  // };

  // Show error if user is not authenticated or missing required info
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 my-4">
        <div className="mx-auto sm:px-6 lg:px-8 space-y-6 max-w-7xl">
          <Card className="p-4 sm:p-6 lg:p-8 text-center">
            <p className="text-red-600 mb-4">Please log in to submit a request.</p>
            <Button onClick={() => navigate("/")}>Go to Login</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!user.name || !user.email || !user.company) {
    return (
      <div className="min-h-screen bg-gray-50 my-4">
        <div className="mx-auto sm:px-6 lg:px-8 space-y-6 max-w-7xl">
          <Card className="p-4 sm:p-6 lg:p-8 text-center">
            <p className="text-red-600 mb-4">
              Your profile is missing required information (name, email, or company). 
              Please contact support to update your profile.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 my-4">
      <div className="mx-auto sm:px-6 lg:px-8 space-y-6 max-w-7xl">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 mx-auto rounded-xl">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  Ask Analyst
                </h1>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Submit your requests for data center updates, corrections,
                  exports, reports, or custom inquiries. Our analysts will
                  review and respond to your request promptly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* User Information Display */}
            {user && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Submitting as:
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Name:</span> {user.name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Company:</span> {user.company}</p>
                </div>
              </div>
            )}

            {/* Request Type Field */}
            <div>
              <label
                htmlFor="requestType"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                Request Type <span className="text-red-500">*</span>
              </label>
              <Select
                options={REQUEST_TYPES}
                value={formData.requestType}
                onChange={(value) =>
                  setFormData({ ...formData, requestType: value as string })
                }
                placeholder="Select a request type"
                className="w-full text-sm sm:text-base"
              />
            </div>

            {/* Request Details Field */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                Your Request <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Please describe your request in detail..."
                className="w-full min-h-[120px] sm:min-h-[150px] px-3 py-2 text-sm sm:text-base border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
              />
            </div>

            {/* File Attachments */}
            <div>
              <label
                htmlFor="attachments"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                Attachments
              </label>
              <Input
                id="attachments"
                name="attachments"
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                className="w-full text-sm"
                disabled={isSubmitting || !!uploadedFile}
              />
              {/* <p className="mt-1 text-xs text-gray-500">
                Only one reference file allowed (max 10MB). Accepted: Images, PDFs, Documents, Archives. Executable and code files are not permitted.
              </p> */}

              {/* Display uploading status */}
              {uploading && (
                <div className="mt-2 text-sm text-blue-600 flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading file...
                </div>
              )}

              {/* Display uploaded file */}
              {uploadedFile && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded file:
                  </p>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-green-50 border border-green-200 rounded-md gap-2 sm:gap-0">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                        <span className="text-sm text-gray-700 truncate">
                          {uploadedFile.name}
                        </span>
                        <span className="text-xs text-gray-500 shrink-0">
                          ({(uploadedFile.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadedFile()}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 self-end sm:self-auto"
                        disabled={isSubmitting}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 pt-0.5">
                <input
                  id="consentGiven"
                  name="consentGiven"
                  type="checkbox"
                  checked={formData.consentGiven}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="text-sm">
                <label
                  htmlFor="consentGiven"
                  className="font-medium text-gray-700 leading-relaxed"
                >
                  I agree to be contacted and for my data to be used to process
                  this request <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-500 mt-1 leading-relaxed">
                  Your information will be used to contact you regarding your
                  request.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isSubmitting || uploading || !isFormValid()}
                className="w-full sm:w-auto px-6 py-2 text-sm sm:text-base"
                style={{
                  backgroundColor:
                    isSubmitting || uploading || !isFormValid()
                      ? "#ccc"
                      : "#007ea7",
                }}
              >
                {isSubmitting
                  ? "Submitting..."
                  : uploading
                  ? "Uploading Files..."
                  : "Submit Request"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
export default AskAnalyst;
