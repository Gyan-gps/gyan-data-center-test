import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = window.location.pathname;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <div id="pdfCaptureRoot" className="max-w-container mx-auto w-full flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </main>
      {!pathname.includes("/dcx-ai") && !pathname.includes("/location-intelligence") ? <Footer /> : null}
    </div>
  );
};
