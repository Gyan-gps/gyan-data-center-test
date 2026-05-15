import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import {
  Button,
  Input,
  CountryCodeDropdown,
  ContactModal,
} from "@/components/ui";
import {
  submitContactForm,
  getCurrentCountryCode,
  type ContactUsRequest,
} from "@/network";
import { contactFormSchema } from "@/utils/validators";
import type { z } from "zod";
import { trackDCIDemoRequest } from "@/utils/ga";

type ContactFormData = z.infer<typeof contactFormSchema>;

export const CTA: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentCountryCode, setCurrentCountryCode] = useState("+91");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      countryCode: "+91",
      countryName: "India",
    },
  });

  const countryCode = watch("countryCode");

  // Get user's country code on component mount
  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const { countryCode, countryName } = await getCurrentCountryCode();
        setCurrentCountryCode(countryCode);
        setValue("countryCode", countryCode);
        setValue("countryName", countryName || "India");
      } catch (error) {
        console.warn("Failed to get country code, using default:", error);
      }
    };

    fetchCountryCode();
  }, [setValue]);

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);

    try {
      const payload: ContactUsRequest = {
        name: data.name,
        email: data.email,
        company: data.company,
        phone: data.phone,
        countryCode: data.countryCode,
        countryName: data.countryName,
        message: data.message,
        windowUrl: window.location.href,
      };

      await submitContactForm(payload);
      trackDCIDemoRequest(data.email, data.name, data.company, data.message, data.phone, data.countryCode);
      setShowSuccessModal(true);
      reset();
    } catch (error) {
      // Error
      setShowErrorModal(true);

      console.error("Contact form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="bg-slate-900" id="request-demo">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm md:p-12">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left side - Content */}
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-[#0a2239] mb-4">
                  See Data Center Intelligence Platform in Action
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Get a personalized demo to see how our platform can transform
                  your data center intelligence workflow.
                </p>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#007ea7] rounded-full mr-3"></div>
                    <span>Real-time data center analytics</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#007ea7] rounded-full mr-3"></div>
                    <span>Comprehensive market intelligence</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#007ea7] rounded-full mr-3"></div>
                    <span>Expert analyst insights</span>
                  </div>
                </div>
              </div>

              {/* Right side - Contact Form */}
              <div className="bg-gray-50 p-3 rounded-2xl">
                <h3 className="text-xl font-semibold text-[#0a2239] mb-4">
                  Request Demo
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name */}
                  <div>
                    <Input
                      {...register("name")}
                      placeholder="Full Name *"
                      className="w-full"
                      error={errors.name?.message}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="Business Email *"
                      className="w-full"
                      error={errors.email?.message}
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <Input
                      {...register("company")}
                      placeholder="Company Name *"
                      className="w-full"
                      error={errors.company?.message}
                    />
                  </div>

                  {/* Phone and Country Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <CountryCodeDropdown
                        value={countryCode || currentCountryCode}
                        onChange={(value, name) => {
                          setValue("countryCode", value);
                          if (name) setValue("countryName", name);
                        }}
                        error={errors.countryCode?.message}
                        placeholder="Code"
                        className="md:w-full"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        {...register("phone")}
                        type="tel"
                        placeholder="Phone Number (Optional)"
                        className="w-full"
                        error={errors.phone?.message}
                        onKeyPress={(e) => {
                          // Allow only numbers, spaces, +, -, (, )
                          const allowedChars = /[0-9\s\-+()]/;
                          if (
                            !allowedChars.test(e.key) &&
                            e.key !== "Backspace" &&
                            e.key !== "Delete"
                          ) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <textarea
                      {...register("message")}
                      placeholder="Tell us about your requirements *"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007ea7] focus:border-transparent resize-vertical"
                    />
                    {errors.message && (
                      <span className="text-sm text-red-500 mt-1 block">
                        {errors.message.message}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#007ea7] hover:bg-[#006a8c] text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Request Demo"
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  By submitting this form, you agree to our{" "}
                  <a
                    href="https://www.mordorintelligence.com/privacy-policy"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="underline"
                  >
                    privacy policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://www.mordorintelligence.com/terms-and-conditions"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="underline"
                  >
                    terms and conditions
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <ContactModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thank you for your interest!"
        message="We've received your demo request. Our team will contact you within 24 hours to schedule your personalized demonstration."
        subMessage="Please check your email for confirmation details."
      />

      {/* Error Modal */}
      <ContactModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        isError={true}
        title="Submission Failed"
        message="We're sorry, but there was an error processing your request. Please try again or contact us directly."
        subMessage="If the problem persists, please email us at support@example.com"
      />
    </>
  );
};
