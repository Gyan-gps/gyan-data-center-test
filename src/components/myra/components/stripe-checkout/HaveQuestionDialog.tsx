import React, { useState } from "react";

import { Mail, Phone, Tag, User } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

import { Input } from "../ui/input";
import { useAuth } from "@/hooks";
import toast from "react-hot-toast";
import { apiClient } from "@/services";

export function HaveQuestionDialog() {
  const { user } = useAuth();
  // Control dialog open state
  const [open, setOpen] = useState(false);
  // Form data state
  const [formData, setFormData] = useState({
    message: "",
    email: user ? user?.email || "" : "",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    // Remove 'pricing-' prefix if present
    const key = id.replace("pricing-", "") as keyof typeof formData;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.message?.trim() || !formData.email?.trim()) {
        toast.error("Required field cannot be empty");
        setFormData({
          message: formData.message?.trim(),
          email: formData.email?.trim(),
        });
        return;
      }

      await apiClient.post("/contact-us/contact-us-mail", formData);
      toast.success("Request sent successfully");
      setFormData({ message: "", email: "" });
      setOpen(false);
    } catch (error) {
      console.error("Failed to send request", error);
      toast.error((error as Error).message || "Failed to send request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="mt-8 w-full rounded-lg bg-[#EBF7F8] p-6">
        <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-row items-center space-x-2 md:items-start">
            <User className="size-12 rounded-full border-2 border-white bg-white text-[#0070A8]" />
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-gray-800">
                Have Questions?
              </h3>
              <p className="text-gray-600">Connect with our analyst</p>
            </div>
          </div>

          <div className="mx-5 flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
            <div className="flex flex-col items-center space-x-2 md:items-start">
              <div className="ml-2 flex flex-row gap-2">
                <Phone className="size-5 text-[#0070A8]" />
                <p className="text-sm text-gray-600">Call us</p>
              </div>
              <a
                className="font-medium text-[#0070A8] hover:text-[#0070a8c2]"
                href="tel:+16177652493"
              >
                +1 617-765-2493
              </a>
            </div>

            <div className="flex flex-col items-center space-x-2 md:items-start">
              <div className="ml-2 flex flex-row gap-2">
                <Mail className="size-5 text-[#0070A8]" />
                <p className="text-sm text-gray-600">Write an Email</p>
              </div>
              <a
                className="font-medium text-[#0070A8] hover:text-[#0070a8c2]"
                href="mailto:info@mordorintelligence.com"
              >
                info@mordorintelligence.com
              </a>
            </div>

            <div className="flex flex-col items-center space-x-2">
              <div className="flex flex-row gap-2">
                <Tag className="size-[20px] text-[#0070A8]" />
                <p className="text-sm text-gray-600">Pricing Options</p>
              </div>
              <DialogTrigger asChild>
                <button className="font-medium text-[#0070A8] underline hover:text-[#0070a8c2]">
                  Contact Us
                </button>
              </DialogTrigger>
            </div>
          </div>
        </div>
      </div>

      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-10 bg-black/50" />
        <DialogContent className="flex items-center justify-center p-4">
          <div className="relative max-h-[90vh] w-[95%] max-w-md overflow-y-auto rounded-lg bg-white p-6">
            <DialogHeader>
              <DialogTitle>Contact Our Team</DialogTitle>
              <DialogDescription>
                Fill in your details and we’ll get back to you shortly.
              </DialogDescription>
            </DialogHeader>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email">Message</Label>
                <Textarea
                  required
                  className="mt-1 w-full"
                  id="pricing-message"
                  placeholder="How can we help? Share what's on your mind..."
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <Button className="w-full" type="submit">
                Send Request
              </Button>
            </form>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
