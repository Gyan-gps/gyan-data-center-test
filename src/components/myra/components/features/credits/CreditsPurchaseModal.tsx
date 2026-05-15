import { useState } from "react";

import { CheckCircle2, Info } from "lucide-react";

import { useCreditsStore } from "../../../store/creditScore";
import { useStripeStore } from "../../../store/stripeStore";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

/**
 * 1 credit = $10 USD
 */
export const PRICE_PER_CREDIT_USD = 10;

type TCreditsPurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  myraRemainingCredits?: number;
};

export const CreditsPurchaseModal = ({
  isOpen,
  onClose,
  myraRemainingCredits,
}: TCreditsPurchaseModalProps) => {
  const navigate = useNavigate();
  const { setPendingCredits } = useCreditsStore();
  const { setPreviousPath } = useStripeStore();

  const [amount, setAmount] = useState<number>(10);

  const creditsAmount = amount || 10;
  const totalCost = (creditsAmount * PRICE_PER_CREDIT_USD).toFixed(2);

  const handlePurchase = () => {
    if (creditsAmount < 10) {
      toast.error("Please enter at least 10 credits");
      return;
    }

    if (creditsAmount > 1000) {
      toast.error("Maximum purchase credits are 1000 credits only.");
      return;
    }

    try {
      setPendingCredits(creditsAmount);
      setPreviousPath(window.location.pathname);
      navigate("/dcx-ai/payment");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment flow");
    }
  };

  const presets = [10];

  const [presetValues, setPresetValues] = useState(() =>
    Object.fromEntries(presets.map((n) => [n, "10"]))
  );

  const handlePresetChange = (n: number, raw: string) => {
    // strip non-digits
    const digits = raw.replace(/\D/g, "");
    const val = Number(digits);

    if (val > 1000) {
      toast.error("Maximum is 1000 credits");
      return;
    }

    setPresetValues((pv) => ({ ...pv, [n]: digits }));

    if (val >= 10) {
      setAmount(val);
    }
  };

  const handlePresetBlur = (n: number) => {
    const raw = presetValues[n];
    const val = Number(raw);
    if (!raw || val < 10) {
      toast.error("Minimum is 10 credits");
      // reset to the original preset
      setPresetValues((pv) => ({ ...pv, [n]: "10" }));
      setAmount(10);
      return;
    }
    if (val > 1000) {
      toast.error("Maximum is 1000 credits");
      setPresetValues((pv) => ({ ...pv, [n]: "1000" }));
      setAmount(1000);
      return;
    }

    // update state to exactly this value
    setPresetValues((pv) => ({ ...pv, [n]: val.toString() }));
    setAmount(val);
  };

  const adjustBy = (n: number, delta: number) => {
    // figure out current value (fallback to n if empty)
    const current = Number(presetValues[n]) || n;
    const next = current + delta;
    if (next < 10) {
      toast.error("Minimum is 10 credits");
      return;
    }
    if (next > 1000) {
      toast.error("Maximum is 1000 credits");
      return;
    }
    // update both the preset input and your amount state
    setPresetValues((pv) => ({ ...pv, [n]: next.toString() }));
    setAmount(next);
  };

  const modalContent = {
    title:
      myraRemainingCredits && myraRemainingCredits < 1
        ? "You've used your complementary questions."
        : "Purchase Credits.",
    sub_title: "Upgrade now for uninterrupted insights.",
    features: [
      {
        title: "Cost-efficient",
        desc: "a fraction of a US $4,750 report and usable across every industry we cover",
      },
      {
        title: "Deeper answers",
        desc: "& richer visualizations",
      },
      {
        title: "No daily caps",
        desc: "– use credits whenever insight strikes",
      },
      {
        title: "Priority access",
        desc: "to new features",
      },
      {
        title: "More exhaustive",
        desc: "answers compared to free trial",
      },
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalContent.title}</DialogTitle>
          <DialogDescription>{modalContent.sub_title}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 md:gap-4">
          <div className="space-y-3">
            {/* Only show the email input if user is not logged in for Guest Checkout */}
            {/* Credits selection */}
            <div className="flex w-full flex-row items-center justify-between gap-5">
              <Label className="flex flex-1 items-center" htmlFor="amount">
                Select Number of Credits
                <span className="group relative ml-1">
                  <Info className="size-4 cursor-help text-muted-foreground" />
                  <span className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-32 -translate-x-1/2 whitespace-pre-line rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                    {`1 credit = 1 question`}
                  </span>
                </span>
              </Label>

              <div className="flex w-full flex-1 flex-wrap justify-between">
                {presets.map((n) => (
                  <div
                    key={n}
                    className="flex w-full divide-x divide-gray-200 overflow-hidden rounded-none border border-gray-200"
                  >
                    <Button
                      className="flex-1/2 rounded-none text-sm focus:outline-none"
                      size="sm"
                      variant="ghost"
                      onClick={() => adjustBy(n, -n)}
                    >
                      −
                    </Button>

                    <Input
                      className="flex-1 rounded-none text-center focus:outline-none"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Credits"
                      title="Input credits"
                      type="text"
                      value={presetValues[n]}
                      onBlur={() => handlePresetBlur(n)}
                      onChange={(e) => handlePresetChange(n, e.target.value)}
                    />

                    <Button
                      className="flex-1/2 rounded-none text-sm focus:outline-none"
                      size="sm"
                      variant="ghost"
                      onClick={() => adjustBy(n, n)}
                    >
                      +
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="relative">
              <Coins className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                className="pl-9"
                id="amount"
                placeholder="Enter amount (min. 10)"
                type="text"
                value={amount}
                onChange={handleAmountChange}
              />
            </div> */}

            <div className="flex flex-row gap-5">
              <div className="flex flex-1 items-center justify-start">
                {/* <button
                  className="text-[18px] text-[rgb(44,141,191)] underline hover:text-[rgb(20,113,160)]"
                  onClick={() => setShowUpgradeSection(!showUpgradeSection)}
                >
                  Why Upgrade?
                </button> */}
              </div>
              <div className="flex flex-1 flex-col items-start pl-4 text-sm text-muted-foreground">
                <p>1 credit = 1 question</p>
                <p>Cost per credit: USD ${PRICE_PER_CREDIT_USD}.00 </p>
                <p className="text-black">Total cost: USD ${totalCost}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={creditsAmount < 10 || creditsAmount > 1000}
              onClick={handlePurchase}
            >
              Purchase {creditsAmount || "0"} Credits
            </Button>
          </div>

          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground md:text-sm">
              <strong>Note:</strong> Clicking on &apos;Purchase Credit&apos;
              will redirect....
            </p>
          </div>

          <div className="group mx-auto max-w-md rounded-2xl bg-white duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Why upgrade?</h2>
            </div>

            {/* Feature list */}
            <ul className="mt-3 space-y-2 text-sm md:mt-5 md:space-y-4 md:text-base">
              {modalContent.features.map((feat) => (
                <li key={feat.title} className="flex items-start">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500 md:mt-1 md:size-5" />
                  <p className="ml-3 text-gray-700">
                    <span className="font-semibold">{feat.title}</span>{" "}
                    {feat.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
