import { type ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// import { useStripeStore } from '../store/stripeStore'
import { StreamProvider } from "../providers/stream-provider";

// import ThankyouDialog from "../components/stripe-checkout/ThankyouDialog";
import { queryClient } from "../lib/query-client";

const AppProviders = ({ children }: { children: ReactNode }) => {
  // const setStripe = useStripeStore((s) => s.setStripeInstance)
  // const STRIPE_PUB = import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

  return (
    <QueryClientProvider client={queryClient}>
      {/* <AuthProvider> */}
      <StreamProvider>
        {/* <Script
              id="stripe-js"
              src="https://js.stripe.com/v3/"
              strategy="afterInteractive"
              onLoad={() => {
                if (window.Stripe) {
                  const stripe = window.Stripe(STRIPE_PUB)
                  setStripe(stripe)
                } else {
                  console.error("Stripe.js didn't load!")
                }
              }}
            /> */}
        {children}
        {/* <ThankyouDialog /> */}
        {/* <Toaster
              closeButton
              position="top-right"
              toastOptions={{
                className:
                  'bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg rounded-lg sm:mt-10',
                classNames: {
                  closeButton: 'text-black hover:text-gray-800'
                }
              }}
            /> */}
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      </StreamProvider>
      {/* </AuthProvider> */}
    </QueryClientProvider>
  );
};

export default AppProviders;
