import { useEffect } from "react";

import { ChevronLeft } from "lucide-react";

import { useCreditsStore } from "./store/creditScore";
import { useStripeStore } from "./store/stripeStore";

import DnB from "@/assets/logos/DnB.png";
import ESOMAR from "@/assets/logos/Esomar-25.webp";
import GPTW from "@/assets/logos/GPTW.jpeg";
import ISO from "@/assets/logos/ISO_whitebg.png";
import MRSI from "@/assets/logos/MRSI_whitebg.svg";

import Loading from "./components/stripe-checkout/loading";
import StripeCheckoutForm from "./components/stripe-checkout/stripe-checkout-form";
import { Button } from "./components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks";

const PaymentsPage = () => {
  const { previousPath } = useStripeStore();

  const navigate = useNavigate();
  const { user, deleteMessage } = useAuth();
  const { pendingCredits } = useCreditsStore();

  const logos = [DnB, MRSI, ESOMAR, ISO, GPTW];

  useEffect(() => {
    if (user !== undefined) {
      deleteMessage();
    }
    // eslint-disable-next-line
  }, [user]);

  const handleBack = () => {
    navigate(previousPath || "/dcx-ai");
  };

  if (
    (user && !user?.email) || // logged in but email not available
    pendingCredits < 10 // no credits selected
  ) {
    navigate("/dcx-ai");
  }

  return pendingCredits > 0 ? (
    <section className="mt-16 flex h-fit flex-col md:pt-12">
      <div className="mx-auto flex w-[95%] max-w-screen-xl flex-col justify-between gap-5 py-2 md:flex-row md:items-center md:gap-10">
        <div className="flex w-fit flex-col items-start justify-start gap-2">
          <Button
            className="flex w-fit min-w-max max-w-screen-xl items-center bg-white py-2 text-gray-700 shadow-none hover:bg-[#EBF7F8]"
            onClick={handleBack}
          >
            <ChevronLeft size={20} />
            <span className="text-lg text-neutral-900">Back</span>
          </Button>
          <hr className="block w-full border-b border-gray-200 md:hidden" />
          <h1 className="mb-6 px-5 text-left text-4xl font-bold text-[#212529]">
            DCX AI Credits Payments
          </h1>
        </div>
        <div className="flex w-full flex-row justify-between gap-4 md:w-[55%] md:gap-6">
          {logos.map((logo, idx) => (
            <div
              key={idx}
              className="relative h-24 w-20 md:h-32 md:w-28 flex items-center"
            >
              <img
                alt={`Certification ${idx + 1}`}
                className="object-contain"
                src={logo}
              />
            </div>
          ))}
        </div>
      </div>

      <StripeCheckoutForm pendingCredits={pendingCredits} user={user} />
    </section>
  ) : (
    <Loading classes="w-full" />
  );
};

export default PaymentsPage;
