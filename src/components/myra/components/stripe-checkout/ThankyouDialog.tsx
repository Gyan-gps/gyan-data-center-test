import React, { useEffect, useRef, useState } from "react";

import { sendEventToDataLayer } from "../../lib/utils";
import { useStripeStore } from "../../store/stripeStore";

import creditIcon from "@/assets/images/credit-img.svg";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useAuth } from "@/hooks";
import { apiClient } from "@/services";
import type { AxiosResponse } from "axios";

type GetSessionStatusResponse = {
  status: "complete" | "failed" | string; // Stripe may return other statuses
  session: unknown; // we’re not using it, so ignore its structure
  quantity: number;
};

const ThankyouDialog: React.FC = () => {
  const { sessionId, setSessionId, setAnonymousUserEmail } = useStripeStore();
  const [creditsQuantity, setCreditsQuantity] = useState<number>();
  const { validateToken } = useAuth();

  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failure" | null
  >(null);
  const lastFetchRef = useRef<{ sessionId: string } | null>(null);
  const aborterRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // nothing to do if we don't have both
    if (!sessionId) return;

    // if we've already fetched for this exact session+token, bail out
    if (lastFetchRef.current?.sessionId === sessionId) return;

    // abort any prior in-flight request
    aborterRef.current?.abort();

    // remember what we're about to fetch
    lastFetchRef.current = { sessionId };

    const controller = new AbortController();
    aborterRef.current = controller;

    apiClient
      .post<GetSessionStatusResponse>(
        `/payments/get-session-status`,
        { sessionId },
        { signal: controller.signal }
      )
      .then((response: AxiosResponse<GetSessionStatusResponse>) => {
        const { status, quantity } = response.data;

        let result: "success" | "failure" | null = null;
        if (status === "complete") result = "success";
        else if (status === "failed") result = "failure";

        if (result === "success") {
          sendEventToDataLayer("myra-payment-success");
        }

        if (result) {
          // clear store’s sessionId
          setSessionId(null);
          setPaymentStatus(result);
        }

        if (quantity) {
          setCreditsQuantity(quantity);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Could not fetch session status", err);
        setPaymentStatus(null);
      })
      .finally(() => {
        setAnonymousUserEmail("");
      });

    // cleanup: abort if effect re-runs or component unmounts
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line
  }, [sessionId, setSessionId]);

  const handleDialogClose = () => {
    setPaymentStatus(null);
    validateToken();
  };

  return (
    <Dialog
      open={paymentStatus !== null}
      onOpenChange={(open) => {
        if (!open) handleDialogClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paymentStatus === "success"
              ? "Payment Successful"
              : paymentStatus === "failure"
              ? "Payment Failed"
              : null}
          </DialogTitle>
          <DialogDescription>
            {paymentStatus === "success" ? (
              <div className="mt-3 flex flex-col gap-3">
                <p>Thank you for your purchase!</p>
                <p className="flex flex-row gap-2">
                  You have purchased{" "}
                  <span className="flex flex-row items-center gap-1 font-bold">
                    <img
                      alt="Credit Icon"
                      className="size-3 text-primary md:size-4"
                      height={16}
                      loading="eager"
                      src={creditIcon}
                      width={16}
                    />
                    {creditsQuantity} Credits
                  </span>{" "}
                  successfully.
                </p>
              </div>
            ) : paymentStatus === "failure" ? (
              "Unfortunately, your payment did not go through. Please try again."
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={handleDialogClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ThankyouDialog;
