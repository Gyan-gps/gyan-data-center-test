import ChatConversationPage from "@/components/myra";
import AppProviders from "@/components/myra/providers/app-providers";
import React from "react";

export const MyRA: React.FC = () => {
  return (
    <AppProviders>
      <ChatConversationPage />
    </AppProviders>
  );
};
