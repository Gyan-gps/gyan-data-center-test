import React from "react";
import styles from "./styles.module.css";
import { APP_NAME } from "@/utils/constants";
import { PWAInstallButton } from '@/components/common';

const driftImg =
  "https://subscription-public.s3.us-west-2.amazonaws.com/static-assets/images/drift_design.svg";
const heroBanner1 =
  "https://subscription-public.s3.us-west-2.amazonaws.com/static-assets/images/hero_banner_1.svg";
const heroBanner2 =
  "https://subscription-public.s3.us-west-2.amazonaws.com/static-assets/images/hero_banner_2.svg";

export const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const Year = new Date().getFullYear();

  return (
    <div className={styles.wrapper}>
      <img src={driftImg} alt="driftImg" className={styles.driftSection} />

      <div className={styles.mainContainer}>
        <div className={styles.topBar}>

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="main logo" />
            <span className="text-base sm:text-lg font-semibold tracking-tight">
              {APP_NAME}
            </span>
          </div>

          {/* RIGHT SIDE */}
          <PWAInstallButton
            className="rounded-xl border-2 border-[#007ea7] text-[#007ea7] hover:bg-[#007ea7] hover:text-white px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold transition-colors flex items-center justify-center"
          >
            {/* MOBILE → icon */}
            <span className="sm:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
              </svg>
            </span>

            {/* DESKTOP → text */}
            <span className="hidden sm:inline">Install App</span>
          </PWAInstallButton>
        </div>


        <div className={styles.mainDetailsContainer}>
          <section className={styles.leftSection}>
            <div className={styles.textWrapper}>
              <h4 className={styles.nametag}>
                Delivering Competitive Edge, <span>Turning Precise Data into Decisions</span>
              </h4>
              <h4 className={styles.nametag}>
                Mapping Complex Business Ecosystems, <span>Predicting Butterfly Effects</span>
              </h4>
            </div>

            <div className={styles.imgWrapper}>
              <img src={heroBanner1} className={styles.bgFade} />
              <img src={heroBanner2} className={styles.bgFade2} />
            </div>
          </section>

          <section className={styles.rightSection}>{children}</section>
        </div>
      </div>

      <div className={styles.credit}>© {Year}. All Rights Reserved.</div>
    </div>
  );
};