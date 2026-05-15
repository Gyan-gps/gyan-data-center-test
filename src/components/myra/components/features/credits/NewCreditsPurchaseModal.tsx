import { useCreditsStore } from "../../../store/creditScore";
import { useStripeStore } from "../../../store/stripeStore";

import gift_icon from "@/assets/icons/gift.svg";
import lock_icon from "@/assets/icons/lock.svg";
import mordor_logo from "@/assets/images/mordor_mobile_logo.webp";
import affordable_access_image from "@/assets/new-payment-modal/affordable-access.svg";
import analyst_curated_data_image from "@/assets/new-payment-modal/analyst-curated-data.svg";
import deep_co_intelligence_image from "@/assets/new-payment-modal/deep-co-intelligence.svg";
import forecast_on_global_market_image from "@/assets/new-payment-modal/forecast-on-global-market.svg";
import investor_grade_insights_image from "@/assets/new-payment-modal/investor-grade-insights.svg";
import real_time_qa_image from "@/assets/new-payment-modal/real-time-qa.svg";
import strategic_insights_image from "@/assets/new-payment-modal/strategic-insights.svg";
import tailored_data_for_niche_image from "@/assets/new-payment-modal/tailored-data-for-niche.svg";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

type NewCreditsPurchaseModal = {
  isOpen: boolean;
  onClose: () => void;
};

const footerContent = [
  {
    text: "Secure Payment via Stripe",
    image: lock_icon,
  },
  {
    text: "Try Free Before You Buy",
    image: gift_icon,
  },
  {
    text: "Built by Mordor Intelligence",
    image: mordor_logo,
  },
];

const benefitsContent = [
  {
    text: "Forecasts on Global Markets",
    image: forecast_on_global_market_image,
  },
  {
    text: "Deep Company Intelligence",
    image: deep_co_intelligence_image,
  },
  {
    text: "Strategic Insights",
    image: strategic_insights_image,
  },
  {
    text: "Tailored Data for Your Niche",
    image: tailored_data_for_niche_image,
  },
  {
    text: "Investor-Grade Insights",
    image: investor_grade_insights_image,
  },
  {
    text: "Analyst-Curated Data",
    image: analyst_curated_data_image,
  },
  {
    text: "Real Time Q&A",
    image: real_time_qa_image,
  },
  {
    text: "Affordable Access",
    image: affordable_access_image,
  },
];

export const NewCreditsPurchaseModal = ({
  isOpen,
  onClose,
}: NewCreditsPurchaseModal) => {
  const { setPendingCredits } = useCreditsStore();
  const { setPreviousPath } = useStripeStore();
  const navigate = useNavigate();

  const handlePurchase = () => {
    try {
      setPendingCredits(10);
      setPreviousPath(window.location.pathname);
      navigate("/dcx-ai/payment");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment flow");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:pt-auto sm-h:h-full h-full max-w-max overflow-auto bg-[#e4f0ff] px-4 sm:h-fit sm:max-w-2xl md:px-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="mx-auto w-[max(70%,320px)] text-center text-2xl font-semibold md:text-3xl">
            Analyze 4,000+ markets from a single chat interface
          </DialogTitle>
          <DialogDescription className="text-center text-xl text-black">
            Real industry research - no guesswork, no generic AI
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto w-full min-w-fit sm:max-w-2xl">
          {/* Plan Section */}
          <div className="mb-10 flex flex-col-reverse gap-6 sm:flex-row sm:gap-4">
            {/* Premium Plan */}
            <div
              className={`md:w-[80%] max-w-full mx-auto rounded-xl border-2 border-orange-600 bg-[#f7fcfd] p-4 shadow-[0_0_15px_rgba(0,0,0,0.1)] sm:p-3.5`}
            >
              <h3 className="mb-2 text-xl font-semibold text-orange-600">
                Premium Plan
              </h3>
              <ul className="mb-4 space-y-2 text-sm text-black">
                <li>
                  <p className="text-base">10 questions = 10 credits</p>
                </li>
                <li className="relative pl-4 text-sm before:absolute before:left-0 before:content-['✔']">
                  Ask questions from 4000+ markets
                </li>
                <li className="relative pl-4 text-sm before:absolute before:left-0 before:content-['✔']">
                  Insights at fraction of a full-length report cost
                </li>
              </ul>
              <div className="mt-auto">
                <Button
                  className="mt-auto flex h-auto w-full items-center gap-1 rounded-xl bg-orange-500 py-2.5 text-[15px] text-white hover:bg-orange-600"
                  onClick={handlePurchase}
                >
                  Unlock data starting
                  <strong className="text-base">$100</strong>
                  <i className="text-[15px] text-white/70 line-through">
                    $4750
                  </i>
                </Button>
              </div>
            </div>
          </div>

          {/* Grid Section */}
          <div className="flex flex-col items-stretch justify-start">
            {/* ─── Heading with fading lines ─── */}
            <div className="mb-6 flex items-center">
              <div className="h-px flex-1 bg-linear-to-l from-black to-transparent" />
              <h2 className="mx-4 whitespace-nowrap text-lg font-light text-black">
                Why use DCX AI
              </h2>
              <div className="h-px flex-1 bg-linear-to-r from-black to-transparent" />
            </div>

            <div className="relative mb-10 grid grid-cols-4 gap-6 text-center sm:grid-cols-4">
              {benefitsContent.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <img
                    alt={item.text}
                    className="image-gradient"
                    height={40}
                    src={item.image}
                    width={40}
                  />
                  <p className="text-xs md:text-base">{item.text}</p>
                </div>
              ))}
              <div className="absolute -bottom-2 h-2 w-full shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"></div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex flex-row flex-wrap justify-between gap-2 text-center text-xs text-gray-500">
            {footerContent.map((item, index) => (
              <div
                key={index}
                className="flex min-w-fit flex-1 items-center justify-center gap-1"
              >
                <img alt={item.text} height={16} width={16} src={item.image} />
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
