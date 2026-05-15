import parse, { domToReact } from "html-react-parser";
import type { DOMNode } from "html-react-parser";
import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";

interface ParsedReportPageProps {
  HTML: string;
  template?: string | null;
}

interface CreateOptionsConfig {
  openAccordion: boolean;
  handleAccordion: (e: React.MouseEvent) => void;
  template: string | null;
}

interface ParsedDOMNode {
  attribs?: Record<string, string>;
  children?: DOMNode[];
  name?: string;
  type?: string;
}

export default function ParsedReportPage({
  HTML,
  template = null,
}: ParsedReportPageProps) {
  const [openAccordion, setOpenAccordion] = useState<boolean>(false);

  const handleAccordion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenAccordion((p) => !p);
  };

  const options = createOptions({
    openAccordion,
    handleAccordion,
    template,
  });

  useEffect(() => {
    const aboutReportMenu = document.getElementsByClassName("about-report-menu")[0];
    const headingTitles = document.getElementsByClassName("heading-title");
    if (aboutReportMenu && headingTitles) {
      handleTableScroll(
        aboutReportMenu.children,
        headingTitles
      );
    }
    const tocElement = document.getElementById("clicked-on-toc");
    if (tocElement) {
      handleTableScroll(
        [tocElement],
        document.getElementsByClassName("customize-toc")
      );
    }

    // Handle new navigation TOC
    setTimeout(() => {
      const allTocUls = document.getElementsByClassName("tocUl2K");
      for (const ul of allTocUls) {
        handleTableScroll(
          ul.children,
          document.getElementsByClassName("heading-title")
        );
      }

      // Handle About This Report toggle
      const aboutReportLink = document.getElementsByClassName("aboutReportLink")[0] as HTMLElement;
      if (aboutReportLink) {
        const submenu = aboutReportLink.parentElement?.querySelector("ul") as HTMLElement;
        if (submenu) {
          submenu.style.display = "none"; // Initially hidden
          aboutReportLink.style.cursor = "pointer";
          aboutReportLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            submenu.style.display = submenu.style.display === "none" ? "block" : "none";
          });
        }
      }

      // Handle individual navigation items (including nested ones)
      const navItems = document.querySelectorAll(".navLinksRdTemplateNavListItem2P");
      navItems.forEach((item) => {
        const htmlItem = item as HTMLElement;
        const text = htmlItem.innerText?.trim().toLowerCase();
        
        if (text && text !== "about this report" && text in sideBarHeadingRelationship) {
          htmlItem.style.cursor = "pointer";
          htmlItem.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const headings = document.getElementsByClassName("heading-title");
            const matchedItem = findMatchingComponentForAccordion(
              sideBarHeadingRelationship[text as keyof typeof sideBarHeadingRelationship],
              Object.values(headings)
            );
            
            if (matchedItem) {
              const idToScroll = findIdToScroll(matchedItem);
              if (idToScroll) {
                scrollToSection(idToScroll);
              }
            }
          });
        }
      });
    }, 1000);

    const container = document.getElementsByClassName(
      "flex container preview-rd-page"
    )[0] as HTMLElement;
    if (container) {
      container.style.height = `100%`;
      container.style.position = "relative";
    }

    const openAcc = setTimeout(() => {
      setOpenAccordion(true);
    }, 3000);

    return () => {
      clearTimeout(openAcc);
    };
  }, [template]);

  return parse(HTML, options);
}

// Modify attributes

// Helper function to safely render children
const safeRenderChildren = (children: DOMNode[] | undefined, config: CreateOptionsConfig): React.ReactNode => {
  return children ? domToReact(children, createOptions(config)) : null;
};

// Helper function to convert style string to object
const styleStringToObject = (styleString: string): Record<string, string> => {
  const styleObject: Record<string, string> = {};
  styleString.split(';').forEach(pair => {
    const [key, value] = pair.split(':');
    if (key && value) {
      styleObject[key.trim()] = value.trim();
    }
  });
  return styleObject;
};

// Modify attributes
const createOptions = (config: CreateOptionsConfig) => {
  const { openAccordion, template } = config;
  return {
    replace(domNode: DOMNode) {
      const { attribs, children, name, type } = domNode as ParsedDOMNode;


      // Market Overview Table and Overview Points List Styling
      if (type === "tag" && name === "div" && attribs && attribs.class?.includes("overview-points-list")) {
        return <div className={styles.overviewPointsList}>{safeRenderChildren(children, config)}</div>;
      }
      if (type === "tag" && name === "p" && attribs && attribs.class?.includes("market-snapshot-table-heading")) {
        return <p className={styles.marketSnapshotTableHeading} role="heading" aria-level={3}>{safeRenderChildren(children, config)}</p>;
      }
      if (type === "tag" && name === "table" && attribs && attribs.class?.includes("table-top-no-margin")) {
        return <table className={styles.tableTopNoMargin}>{safeRenderChildren(children, config)}</table>;
      }
      if (type === "tag" && name === "tr" && attribs && attribs.class?.includes("overview-points")) {
        return <tr className={styles.overviewPoints}>{safeRenderChildren(children, config)}</tr>;
      }
      if (type === "tag" && name === "td" && attribs && attribs.class?.includes("overview-label")) {
        return <td className={styles.overviewLabel} scope="row">{safeRenderChildren(children, config)}</td>;
      }
      if (type === "tag" && name === "td" && attribs && attribs.class?.includes("overview-value")) {
        return <td className={styles.overviewValue}>{safeRenderChildren(children, config)}</td>;
      }
      if (type === "tag" && name === "td" && attribs && attribs.class?.includes("key-player-images")) {
        return <td className={styles.keyPlayerImages} colSpan={2}>{safeRenderChildren(children, config)}</td>;
      }
      if (type === "tag" && name === "h3" && attribs && attribs.class?.includes("snapshop-logos-title")) {
        return <h3 className={styles.snapshopLogosTitle}>{safeRenderChildren(children, config)}</h3>;
      }
      if (type === "tag" && name === "p" && attribs && attribs.class?.includes("major-player-disclaimer")) {
        return <p className={styles.majorPlayerDisclaimer}>{safeRenderChildren(children, config)}</p>;
      }
      if (type === "tag" && name === "figure" && attribs && attribs.class?.includes("market-summary-graph")) {
        return <figure className={styles.marketSummaryGraph}>{safeRenderChildren(children, config)}</figure>;
      }
      if (type === "tag" && name === "figcaption" && attribs && attribs.class?.includes("cc-attribution")) {
        return <figcaption className={styles.ccAttribution}>{safeRenderChildren(children, config)}</figcaption>;
      }

      // Major Players Section Styling
      if (type === "tag" && name === "div" && attribs && attribs.id === "major_players") {
        return <div id="major_players" className={styles.majorPlayersSection}>{safeRenderChildren(children, config)}</div>;
      }
      if (type === "tag" && name === "ol" && attribs && attribs.class?.includes("companyPlayerList_m4")) {
        return <ol className={styles.companyPlayerListM4}>{safeRenderChildren(children, config)}</ol>;
      }
      if (type === "tag" && name === "li" && attribs && attribs.class?.includes("market-leaders-name")) {
        return <li className={styles.marketLeadersName} data-index={attribs["data-index"]}>{safeRenderChildren(children, config)}</li>;
      }
      if (type === "tag" && name === "small" && attribs && attribs.class?.includes("desclaimer")) {
        return <small className={styles.desclaimer}>{safeRenderChildren(children, config)}</small>;
      }
      if (type === "tag" && name === "figure" && attribs && attribs.class?.includes("img-container")) {
        return <figure className={styles.imgContainer}>{safeRenderChildren(children, config)}</figure>;
      }
      if (type === "tag" && name === "img" && attribs && attribs.class?.includes("full-width")) {
        const { style, ...otherAttribs } = attribs;
        const imgStyle = style ? styleStringToObject(style) : {};
        return <img {...otherAttribs} style={imgStyle} className={styles.fullWidthImg} />;
      }
      if (type === "tag" && name === "figcaption" && attribs && attribs.class?.includes("ccAttribution_L2")) {
        return <figcaption className={styles.ccAttributionL2}>{safeRenderChildren(children, config)}</figcaption>;
      }

      // Free with this report section styling
      if (type === "tag" && name === "div" && attribs && attribs.class?.includes("free-with-this-report")) {
        return <div className={styles.freeWithThisReport}>{safeRenderChildren(children, config)}</div>;
      }
      if (type === "tag" && name === "figure" && attribs && attribs.class?.includes("enlarge image-container")) {
        return <figure className={styles.enlargeImageContainer}>{safeRenderChildren(children, config)}</figure>;
      }
      if (type === "tag" && name === "img" && attribs && attribs.class?.includes("rd-img")) {
        const { style, ...otherAttribs } = attribs;
        const imgStyle = style ? styleStringToObject(style) : {};
        return <img {...otherAttribs} style={imgStyle} className={styles.rdImg} />;
      }

      // Table of Contents styling
      if (type === "tag" && name === "section" && attribs && attribs.class?.includes("sectionComponent_8L")) {
        return <section className={styles.sectionComponent8L}>{safeRenderChildren(children, config)}</section>;
      }
      if (type === "tag" && name === "h2" && attribs && attribs.class?.includes("sectionHeading_pO")) {
        return <h2 className={styles.sectionHeadingPO}>{safeRenderChildren(children, config)}</h2>;
      }
      if (type === "tag" && name === "div" && attribs && attribs.id === "table-of-content") {
        return <div id="table-of-content" className={styles.tableOfContent}>{safeRenderChildren(children, config)}</div>;
      }
      if (type === "tag" && name === "p" && attribs && attribs.class?.includes("toc-level-1")) {
        return <p className={styles.tocLevel1} id={attribs.id}>{safeRenderChildren(children, config)}</p>;
      }
      if (type === "tag" && name === "ul") {
        return <ul className={styles.tocUl}>{safeRenderChildren(children, config)}</ul>;
      }
      if (type === "tag" && name === "li" && attribs && attribs.class?.includes("toc-level-2")) {
        return <li className={styles.tocLevel2}>{safeRenderChildren(children, config)}</li>;
      }
      if (type === "tag" && name === "li" && attribs && attribs.class?.includes("toc-level-3")) {
        return <li className={styles.tocLevel3}>{safeRenderChildren(children, config)}</li>;
      }
      if (type === "tag" && name === "li" && attribs && attribs.class?.includes("toc-level-4")) {
        return <li className={styles.tocLevel4}>{safeRenderChildren(children, config)}</li>;
      }
      if (type === "tag" && name === "li" && attribs && attribs.class?.includes("toc-level-5")) {
        return <li className={styles.tocLevel5}>{safeRenderChildren(children, config)}</li>;
      }

      // Segment Analysis styling
      if (type === "tag" && name === "p" && attribs && attribs.class?.includes("component-subheading")) {
        return <p className={styles.componentSubheading}>{safeRenderChildren(children, config)}</p>;
      }
      if (type === "tag" && name === "figure" && attribs && attribs.class?.includes("img-section")) {
        return <figure className={styles.imgSection}>{safeRenderChildren(children, config)}</figure>;
      }
      if (type === "tag" && name === "picture" && attribs && attribs.class?.includes("embed-code-context")) {
        return <picture className={styles.embedCodeContext}>{safeRenderChildren(children, config)}</picture>;
      }
      if (type === "tag" && name === "img" && attribs && attribs.class?.includes("fullWidthImg_md")) {
        const { style, ...otherAttribs } = attribs;
        const imgStyle = style ? styleStringToObject(style) : {};
        return <img {...otherAttribs} style={imgStyle} className={styles.fullWidthImgMd} />;
      }
      if (type === "tag" && name === "p" && attribs && attribs.class?.includes("img-note")) {
        return <p className={styles.imgNote}>{safeRenderChildren(children, config)}</p>;
      }

      // Navigation TOC styling
      if (type === "tag" && name === "nav" && attribs && attribs.class?.includes("tocNav_7y")) {
        return <nav className={styles.tocNav7y}>{safeRenderChildren(children, config)}</nav>;
      }
      if (type === "tag" && name === "nav" && attribs && attribs.class?.includes("templateNavContainer_rS")) {
        return <nav className={styles.templateNavContainerRS}>{safeRenderChildren(children, config)}</nav>;
      }
      if (type === "tag" && name === "ul" && attribs && attribs.class?.includes("tocUl_2K")) {
        return <ul className={styles.tocUl2K}>{safeRenderChildren(children, config)}</ul>;
      }
      if (type === "tag" && name === "li" && attribs && attribs.class?.includes("nav-links-rd templateNavListItem_2P")) {
        return <li className={styles.navLinksRdTemplateNavListItem2P} id={attribs.id}>{safeRenderChildren(children, config)}</li>;
      }
      if (type === "tag" && name === "span" && attribs && attribs.class?.includes("about-report-link")) {
        return <span className={styles.aboutReportLink} style={attribs.style ? styleStringToObject(attribs.style) : undefined}>{safeRenderChildren(children, config)}</span>;
      }

      if (type === "tag" && name === "table" && attribs && attribs.class?.includes("driverAccordionTable")) {
        return (
          <table className={styles.driverAccordionTable}>
            {safeRenderChildren(children, config)}
          </table>
        );
      }
      if (type === "tag" && name === "thead") {
        return <thead className={styles.driverAccordionThead}>{safeRenderChildren(children, config)}</thead>;
      }
      if (type === "tag" && name === "tbody") {
        return <tbody className={styles.driverAccordionTbody}>{safeRenderChildren(children, config)}</tbody>;
      }
      if (type === "tag" && name === "tfoot") {
        return <tfoot className={styles.driverAccordionTfoot}>{safeRenderChildren(children, config)}</tfoot>;
      }
      if (type === "tag" && name === "tr" && attribs && attribs.class?.includes("accordion-row")) {
        // Add active/hover styling
        return <tr className={styles.accordionRow}>{safeRenderChildren(children, config)}</tr>;
      }
      if (type === "tag" && name === "th" && attribs && attribs.class?.includes("table-data-head")) {
        return <th className={styles.tableDataHead}>{safeRenderChildren(children, config)}</th>;
      }
      if (type === "tag" && name === "td" && attribs && attribs["data-label"]) {
        // Optionally add data-label as attribute for accessibility
        return <td data-label={attribs["data-label"]}>{safeRenderChildren(children, config)}</td>;
      }
      if (type === "tag" && name === "td" && attribs && attribs.class?.includes("table-source")) {
        return <td className={styles.tableSource}>{safeRenderChildren(children, config)}</td>;
      }
      if (type === "tag" && name === "tr" && attribs && attribs.class?.includes("table-source")) {
        return <tr className={styles.tableSourceRow}>{safeRenderChildren(children, config)}</tr>;
      }
      if (type === "tag" && name === "tr" && attribs && attribs.class?.includes("table-note-source")) {
        return <tr className={styles.tableNoteSource}>{safeRenderChildren(children, config)}</tr>;
      }
      if (type === "tag" && name === "td" && attribs && attribs.class?.includes("table-text-align-left")) {
        return <td className={styles.tableTextAlignLeft}>{safeRenderChildren(children, config)}</td>;
      }
      if (!attribs) return;

      if (type === "tag" && name && ["link"].includes(name)) {
        return <></>;
      }

      if (attribs.class && classesToRemove.includes(attribs.class.trim()))
        return <></>;
      if (attribs.id && idsToRemove.includes(attribs.id.trim())) return <></>;

      // // styles

      if (attribs.id === "component-heading-marketsnapshot-1") {
        return (
          <h1 className={styles.reportTitle}>{safeRenderChildren(children, config)}</h1>
        );
      }

      if(attribs.id && attribs.id === "main" && type === "tag" && name === "main"){
        return <main className={styles.mainInfoContainer}>{safeRenderChildren(children, config)}</main>
      }

      if(attribs.class && attribs.class.includes("container flex justify-between align-start main-container-wrapper")){
        return <div className={styles.wrapper}>{safeRenderChildren(children, config)}</div>
      }

      if(attribs.id && attribs.id === "component-1"){
        return <div className={styles.component1}>{safeRenderChildren(children, config)}</div>
      }

      if (attribs.class && attribs.class.includes("component-heading")) {
        return (
          <h2 className={styles.sectionHeading}>{safeRenderChildren(children, config)}</h2>
        )
      }

      if(type === "tag" && name === "ol" && attribs.class && attribs.class.includes("flex-40 flex flex-column justify-between align-stretch")){
        return <ol className={styles.companyPlayerList}>{safeRenderChildren(children, config)}</ol>
      }

      if(type === "tag" && name === "section" && attribs.class && attribs.class.includes("component")){
        return <section className={styles.sectionComponent}>{safeRenderChildren(children, config)}</section>
      }

      if (attribs.class && attribs.class.includes("toc-navigation")) {
        return <></>
        return (<nav className={styles.tocNav}>{safeRenderChildren(children, config)}</nav>
        );
      }

      if (attribs.class && attribs.class === "opacity-toggle") {
        attribs.style = "margin:2rem 0";
      }

      if (
        attribs.class &&
        attribs.class.includes("breadcrumb-container breadcrumb")
      ) {
        return <></>
      }

      // if (attribs.class === "about-report-link") {
      //   return (
      //     <p className={styles.aboutReportLink} onClick={handleAccordion}>
      //       About this Report
      //       <span>
      //         <button className={styles.iconButton} onClick={handleAccordion}>
      //           {openAccordion ? (
      //             <ChevronUp style={{ color: "#189CDE" }} />
      //           ) : (
      //             <ChevronDown />
      //           )}
      //         </button>
      //       </span>
      //     </p>
      //   );
      // }

      if (attribs.id === "download-sample-left") {
        return <></>;
      }

      if (openAccordion) {
        if (attribs.class === "about-report-menu") {
          return (
            <ul
              className={`show-about-report-menu ${styles.minorList}`}
              style={{ marginTop: openAccordion ? "1rem" : 0 }}
            >
              {safeRenderChildren(children, config)}
            </ul>
          );
        }
      } else {
        if (attribs.class === "about-report-menu show-about-report-menu") {
          return (
            <ul className={`${styles.minorList}`}>
              {safeRenderChildren(children, config)}
            </ul>
          );
        }
      }

      if (attribs.class === "rd-page-navigation") {
        return <></>
        return (
          <nav
            className={
              template === "extended-preview-new-e"
                ? styles.templateNavContainer
                : styles.navContainer
            }
          >
            {safeRenderChildren(children, config)}
          </nav>
        );
      }

      if (
        attribs.class === "main-nav-list" ||
        attribs.class === "main-nav-list-lorien-rd"
      ) {
        return (
          <ul className={styles.mainNavList}>
            {safeRenderChildren(children, config)}
          </ul>
        );
      }

      if (attribs.class === "nav-links-rd" && name === "li") {
        const firstChild = children?.[0] as { data?: string } | undefined;
        if (
          firstChild?.data &&
          [
            "list of tables & figures",
            "scope of the report",
            "frequently asked questions",
            "market definition",
            "research methodology",
            "list of figures",
            "coffee market infographic",
          ].includes(firstChild.data.trim().toLowerCase())
        )
          return <></>;
        if (attribs.id === "clicked-on-toc") {
          return (
            <li
              className={`${attribs.class} ${
                template === "extended-preview-new-e"
                  ? styles.templateNavListItem
                  : styles.navListItem
              }`}
              id={attribs.id}
            >
              Table of Contents
            </li>
          );
        }
        return (
          <li
            className={`${attribs.class} ${
              template === "extended-preview-new-e"
                ? styles.templateNavListItem
                : styles.navListItem
            }`}
            id={attribs.id}
          >
            {safeRenderChildren(children, config)}
          </li>
        );
      }

      if (
        (attribs.class && attribs.class.includes("component-heading")) ||
        attribs.id?.includes("competitive_landscape")
      ) {
        return (
          <h2
            id={attribs.id}
            className={`${attribs.class} ${styles.headingTitle} heading-title`}
          >
            {safeRenderChildren(children, config)}
          </h2>
        );
      }

      if (attribs.class === "buy-from-us") {
        return (
          <h3 id={attribs.id} className={`${styles.minorHeading}`}>
            {safeRenderChildren(children, config)}
          </h3>
        );
      }

      if (attribs.class === "block-heading") {
        return (
          <h3 className={`${styles.blockHeading}`}>
            {safeRenderChildren(children, config)}
          </h3>
        );
      }
    },
  };
};

const handleTableScroll = (sideBar: HTMLCollection | Element[], components: HTMLCollection) => {
  const sideBarList = Object.values(sideBar);
  sideBarList.forEach((li: Element) => {
    const htmlLi = li as HTMLElement;
    const key = htmlLi.innerText?.trim().toLowerCase();
    
    if (key && key in sideBarHeadingRelationship) {
      const matchedItem = findMatchingComponentForAccordion(
        sideBarHeadingRelationship[key as keyof typeof sideBarHeadingRelationship],
        Object.values(components)
      );
      
      if (matchedItem) {
        const idToScroll = findIdToScroll(matchedItem);
        
        if (idToScroll) {
          htmlLi.style.cursor = "pointer";
          htmlLi.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            scrollToSection(idToScroll);
          });
        }
      }
    }
  });
};

const findMatchingComponentForAccordion = (reqItem: string[] | undefined, list: Element[]) => {
  if (!reqItem) return null;

  // Always treat reqItem as an array
  for (let i = 0; i < list.length; i++) {
    if (!list[i]) continue;

    for (let j = 0; j < reqItem.length; j++) {
      const currentItem = reqItem[j];
      const htmlElement = list[i] as HTMLElement;
      const headingText = htmlElement.innerText?.toLowerCase() || "";
      
      if (headingText.includes(currentItem.toLowerCase())) {
        return list[i];
      }
    }
  }
  return null;
};

const findIdToScroll = (comp: HTMLElement | Element | null): string | null => {
  if (!comp) return null;
  const htmlElement = comp as HTMLElement;
  if (htmlElement.id) {
    return htmlElement.id;
  } else {
    return findIdToScroll(htmlElement.parentElement);
  }
};

const scrollToSection = (section: string) => {
  const sectionElement = document.getElementById(section);

  if (sectionElement) {
    // Get the bounding rect of the section
    const rect = sectionElement.getBoundingClientRect();
    // Scroll to the top of the section with a smooth behavior
    window.scrollTo({
      top: rect.top - 70 + window.scrollY, // Adjust the scroll position here
      behavior: "smooth",
    });
  }
};

const classesToRemove = [
  // "breadcrumb-container breadcrumb",
  "unconventional-table-container",
  "container hub-container",
  "hub-container",
  "best-selling-reports-wrapper",
  "site-header-wrapper",
  "flex rd-heading-section rd-banner",
  "row breadcrumb text-center",
  "container faqsection-font",
  "container",
  "know-more",
  "fixed-bottom-div",
  "flex submit-customize-form-section",
  "price-breakup",
  "demo-class",
  "listoffigures",
  "fixed-customize-form",
  "close-fixed-customize-form",
  "seo-text-section",
  "modal-content download-free-sample",
  "purchase-report-section-desktop",
  "new_div sticky-banner-top",
  "offshoot-section-from-partial demo-class",
  "modal",
  "page-content_selectBox",
  "accordion-icon",
];

const idsToRemove = [
  "rd-page-banner",
  "FAILURE-DIALOG",
  "SUCCESS-DIALOG",
  "FIXED-CUSTOMIZE-DAILOG",
  "CUSTOMIZE-FORM-DIALOG",
  "EMBED-DIALOG",
  "SHARE-DIALOG",
  "fixed-buttons",
  "scope-of-the-report-section",
  "market-definition-section",
  "frequently-asked-questions-section",
  "keysellingpoints",
  "footer",
  "related-reports-section",
  "seo-text-section",
  "initial-banner",
  // "download-sample-left",
  "key-market-trends-download-sample",
  "geography-trends-form",
  "market-definition-cutomize",
  "research-methodology-customize",
  "scopeof-the-report-customize",
  "share-button",
  "key-market-trends-download-sample-selected-indicators-1-0",
  "key-market-trends-download-sample-selected-indicators-0-0",
  "market-definition",
  "research-methodology",
  "scope-of-the-report",
  "faqs",
  "scope-of-the-report-bottom",
  "market-concentration-download",
  "get-price-break-up",
  "tables-and-figures",
  "infographics-section",
  "header",
  "downloadSampleModal",
  "downloadSampleModalMobile",
  "downloadSampleToc",
  "customizeFrommodal",

];

const sideBarHeadingRelationship = {
  "market snapshot": ["market size", "size and share", "market snapshot"],
  "market overview": ["market analysis"],
  "market analysis": ["market analysis"],
  "key market trends": ["trends"],
  "competitive landscape": [
    "industry overview",
    "competitive landscape",
    "landscape",
  ],
  "major players": ["leaders", "key players", "players", "industry leaders"],
  "recent developments": [
    "market news",
    "recent developments",
    "industry developments",
  ],
  "free with this report": ["free with this report"],
  "table of contents": ["table of contents"],
  "segment analysis": ["segment analysis"],
  "geography analysis": ["geography segment analysis"],
  "industry developments": [
    "industry overview", 
    "industry developments",
    "developments",
  ],
  "size & share": ["size and share", "size & share"],
  "trends and insights": ["trends and insights"],
  // New navigation mappings
  "market size & share": ["market size", "size and share", "market snapshot"],
};
