import React, { useCallback, useEffect, useRef, useState } from "react";

import { Coins, Lock } from "lucide-react";

import { sendEventToDataLayer } from "../../lib/utils";
import { useStripeStore } from "../../store/stripeStore";

import PCI from "@/assets/logos/pci_approved.svg";

import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { PRICE_PER_CREDIT_USD } from "../features/credits/CreditsPurchaseModal";
import { Button } from "../ui/button";
import { HaveQuestionDialog } from "./HaveQuestionDialog";
import Loading from "./loading";
import type { User } from "@/types";
import toast from "react-hot-toast";
import { apiClient } from "@/services";

// eslint-disable-next-line
export const CurrencyMap: Record<string, string> = {
  USD: "US Dollars",
  EUR: "Euros",
  INR: "Indian Rupees",
  GBP: "Great Britain Pound",
  JPY: "Japanese Yen",
};

// eslint-disable-next-line
export const currencyToSymbol: Record<string, string> = {
  USD: "$",
  EUR: "€",
  INR: "₹",
  GBP: "£",
  JPY: "¥",
};

export interface StripeCheckoutFormProps {
  user: { email: string | null } | User | null;
  pendingCredits: number;
}

type CurrencyType = "USD" | "EUR" | "INR" | "GBP" | "JPY";

export default function StripeCheckoutForm({
  user,
  pendingCredits,
}: StripeCheckoutFormProps): React.JSX.Element {
  const stripe = useStripeStore((s) => s.stripeInstance);
  const authToken = useStripeStore((s) => s.authToken);
  const setSessionId = useStripeStore((s) => s.setSessionId);
  const previousPath = useStripeStore((s) => s.previousPath);

  const [credits, setCredits] = useState<number>(pendingCredits);
  const [inputValue, setInputValue] = useState<string>(String(pendingCredits));

  const [currency, setCurrency] = useState<CurrencyType>("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const totalCostUsd = PRICE_PER_CREDIT_USD * credits;

  const [unitCostCurrency, setUnitCostCurrency] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalCostCurrency, setTotalCostCurrency] = useState<number>(0);
  const [discountCost, setDiscountCost] = useState<number>(0);

  const fetchController = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchClientSecret = useCallback(
    async (curr: CurrencyType, creds: number) => {
      // abort any previous fetch
      fetchController.current?.abort();

      // create new controller for this round
      const controller = new AbortController();
      fetchController.current = controller;

      const maxRetries = 3;
      let attempt = 0;

      const doFetch = async (): Promise<void> => {
        attempt++;
        try {
          const payload: any = {
            user,
            currency: curr,
            credits: creds,
            previousPath,
          };

          // 1️⃣ checkout-session
          const sessionRes = await apiClient.post(
            `/payments/create-checkout-session`,
            { ...payload },
            { signal: controller.signal }
          );
          sendEventToDataLayer("myra-payment-initiated");
          const {
            clientSecret: cs,
            sessionId: sid,
            error,
          } = sessionRes?.data || {};
          if (error) throw new Error(error);
          if (!cs) throw new Error("No clientSecret returned");
          setClientSecret(cs);
          setSessionId(sid);

          // 2️⃣ get-order-summary
          const orderRes = await apiClient.post(
            `/payments/get-order-summary`,
            {
              total_cost_usd: totalCostUsd,
              unit_cost_usd: PRICE_PER_CREDIT_USD,
              currency: curr,
            },
            { signal: controller.signal }
          );
          const { unit_cost_currency, total_cost_currency, discount_currency } =
            orderRes?.data || {};

          setUnitCostCurrency(unit_cost_currency);
          setTotalCostCurrency(total_cost_currency);
          setDiscountCost(discount_currency);
        } catch (err: any) {
          if (err.name === "AbortError") {
            // aborted: don't retry
            return;
          }
          // if (err.message === 'User already exists') {
          //   toast.error(
          //     'Account already exists with this email. Please login to add credits.'
          //   )
          //   sessionStorage.setItem('guest_checkout_error', 'login_required')
          //   router.push('/chat')
          //   return
          // }

          if (attempt < maxRetries) {
            // simple backoff: wait 300ms × attempt
            await new Promise((r) => setTimeout(r, 300 * attempt));
            return doFetch();
          }
          console.error("fetchClientSecret failed:", err);
          toast.error(err.message || "Failed to load checkout form");
        } finally {
          setIsLoading(false);
        }
      };

      doFetch();
    },
    // eslint-disable-next-line
    [authToken, previousPath, setSessionId, totalCostUsd, user]
  );

  // const debouncedFetch = debounce((val: number) => {
  //   setCredits(val)
  //   setIsLoading(true)
  //   fetchClientSecret(currency, val)
  // }, 2000)

  const handleCreditsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setInputValue(digitsOnly);
  };

  const handleCreditsUpdate = () => {
    const val = Number(inputValue);
    if (!val || Number(val) < 10) {
      toast.error("Please enter a valid amount (min. 10 credits)");
      return;
    } else if (!val || Number(val) > 1000) {
      toast.error("Please enter a valid amount (max. 1000 credits)");
      return;
    }
    // fire the debounced backend update
    // debouncedFetch(Number(inputValue));
    sendEventToDataLayer("myra-credit-update", 0, {
      credits: val,
      currency: currency,
    });
    setCredits(val);
    setIsLoading(true);
    fetchClientSecret(currency, val);
  };

  // Only fetch once when we have a user/email and at least 10 credits
  useEffect(() => {
    if (credits >= 10) {
      setIsLoading(true);
      fetchClientSecret(currency, credits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when currency changes
  const handleCurrencyChange = async (next: CurrencyType) => {
    setCurrency(next);
    if (credits >= 10 && credits <= 1000) {
      setClientSecret(null);
      setIsLoading(true);
      fetchClientSecret(next, credits);
    }
  };

  useEffect(() => {
    if (!stripe || !clientSecret || isLoading) return;

    const container = containerRef.current;
    if (!container) {
      console.error("No #embedded-checkout container to mount into");
      return;
    }

    let checkoutInstance: any;

    stripe
      .initEmbeddedCheckout({ fetchClientSecret: async () => clientSecret })
      .then((inst: any) => {
        checkoutInstance = inst;
        inst.mount(container);
      })
      .catch((err: any) => {
        console.error("initEmbeddedCheckout failed:", err);
        toast.error("Could not load embedded checkout");
      });

    return () => {
      checkoutInstance?.destroy();
    };
  }, [stripe, clientSecret, isLoading]);

  return (
    <div className="relative flex flex-col items-center py-3 text-gray-700">
      <div className="h-60 w-full bg-[#EBF7F8] md:h-80">
        <div className="mx-auto flex w-[95%] max-w-(--breakpoint-xl) flex-col items-start p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col text-[#808080]">
            <h2 className="flex items-center gap-2 text-[20px] md:ml-2">
              <Lock className="size-5" />
              Secure Payment
            </h2>
            <span className="text-[16px] font-medium text-[#212529] md:mx-2">
              Prices are inclusive of taxes
            </span>
          </div>
          <div className="mt-3 flex flex-col items-center gap-6 md:flex-row">
            <div className="text-[15px] font-bold text-[#c34949]">
              You are paying in {CurrencyMap[currency]}, see other currency
              options <span className="text-[24px]">→</span>
            </div>
            <div className="flex w-full flex-row items-center justify-between gap-5 md:w-fit">
              <Select
                value={currency}
                onValueChange={(val: string) =>
                  handleCurrencyChange(val as CurrencyType)
                }
              >
                <SelectTrigger className="w-24 rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none">
                  <SelectValue placeholder={currency} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <img
                alt="PCI Certification"
                className="object-contain"
                height={140}
                width={50}
                src={PCI}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-5 w-full max-w-(--breakpoint-xl) space-y-6 p-4 md:absolute md:top-24 md:mt-0 md:p-6">
        <div className="space-y-6 max-w-full">
          <div className="mx-auto flex size-full max-w-(--breakpoint-xl) flex-col-reverse justify-between gap-6 md:flex-row">
            {/* embedded form */}
            {!isLoading ? (
              <div className="size-full min-w-[300px] rounded-lg shadow md:w-2/3">
                <div
                  ref={containerRef} // ← attach the ref here
                  className="size-full rounded-lg bg-white p-2"
                  id="embedded-checkout"
                />
              </div>
            ) : (
              <Loading classes="w-full md:w-2/3" />
            )}
            <div className="flex flex-col gap-5 md:w-1/3">
              <aside className="h-fit w-full rounded-lg bg-white p-6 shadow ">
                <h2 className="mb-4 text-xl font-semibold">
                  Enter Credits To Purchase
                </h2>
                <div className="relative flex items-center gap-2">
                  <Coins className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    className="pl-9"
                    id="amount"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter credits amount (min. 10 credits)"
                    type="text"
                    value={inputValue}
                    onChange={handleCreditsChange}
                  />
                  <Button
                    disabled={isLoading || credits < 10 || credits > 1000}
                    variant="default"
                    onClick={handleCreditsUpdate}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {isLoading ? "Updating…" : "Update"}
                  </Button>
                </div>
              </aside>
              {isLoading ? (
                <Loading classes="w-full" />
              ) : (
                <aside className="h-fit min-h-[300px] w-full rounded-lg bg-white p-6 shadow">
                  <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span>DCX AI Credits</span>
                      <span>
                        {credits} × {currencyToSymbol[currency]}{" "}
                        {unitCostCurrency.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>
                        {currencyToSymbol[currency]} {discountCost.toFixed(2)}
                      </span>
                    </div>
                    <hr className="border-t border-gray-200" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>
                        {currencyToSymbol[currency]}
                        {(credits * unitCostCurrency).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
          <HaveQuestionDialog />
        </div>
      </div>
    </div>
  );
}
