import React, { useState, useEffect, useRef } from "react";

interface LeftNavItem {
  link: string;
  title: string;
  children?: LeftNavItem[];
}

interface SidebarProps {
  leftNavData: LeftNavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ leftNavData }) => {
  const [activeSection, setActiveSection] = useState("");
  const isProgrammaticScroll = useRef(false); // Track if scroll was triggered by click

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, link: string): void => {
    e.preventDefault();
    const targetId: string = link.replace("#", "");
    
    // Set flag to indicate this is a programmatic scroll
    isProgrammaticScroll.current = true;
    setActiveSection(targetId); // Highlight immediately
    
    const element: HTMLElement | null = document.getElementById(targetId);
    if (element) {
      const top: number = element.offsetTop - 80; // 80 is the header height
      window.scrollTo({ top, behavior: "smooth" });
    }
    
    // Reset the flag after scroll completes
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);
  };

  const isLinkActive = (link: string): boolean => activeSection === link.replace("#", "");

  interface LinkStyles {
    backgroundColor: string;
    borderLeftColor: string;
    color: string;
    fontWeight: string | number;
    [key: string]: string | number; // Allow additional properties
  }

  const getLinkStyles = (link: string, isParent: boolean = false): LinkStyles => {
    const isActive: boolean = isLinkActive(link);
    const baseStyles: React.CSSProperties = isParent ? sidebarStyles.parentLink : sidebarStyles.childLink;

    return {
      ...baseStyles,
      backgroundColor: isActive ? "#e3f2fd" : "transparent",
      borderLeftColor: isActive ? "#2196f3" : "transparent",
      color: isActive ? "#1976d2" : (isParent ? "#2c3e50" : "#6c757d"),
      fontWeight: isActive ? "600" : (isParent ? "600" : "normal"),
    };
  };

  useEffect(() => {
    const sectionIds: string[] = [];

    leftNavData.forEach(item => {
      sectionIds.push(item.link.replace("#", ""));
      item.children?.forEach(child =>
        sectionIds.push(child.link.replace("#", ""))
      );
    });

    const observer = new IntersectionObserver(
      entries => {
        // Don't update active section if scroll was triggered by click
        if (isProgrammaticScroll.current) return;
        
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        rootMargin: "-50% 0px -20% 0px", 
        threshold: 0 
      }
    );

    sectionIds.forEach(id => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [leftNavData]);

  return (
 <nav
  className="hidden lg:block lg:w-[260px] flex-shrink-0"
  style={sidebarStyles.nav}
>
    <ul style={sidebarStyles.list}>
      {leftNavData?.map((item, i) => (
        <li key={`${item.link}-${i}`} style={sidebarStyles.listItem}>
          <a
            href={item.link}
            style={getLinkStyles(item.link, true)}
            onClick={(e) => handleScroll(e, item.link)}
            className="hover:bg-gray-50 cursor-pointer block"
          >
            {item.title}
          </a>

          {item.children && (
            <ul style={sidebarStyles.subList}>
              {item.children.map((child, ci) => (
                <li key={`${child.link}-${ci}`} style={sidebarStyles.subListItem}>
                  <a
                    href={child.link}
                    style={getLinkStyles(child.link, false)}
                    onClick={(e) => handleScroll(e, child.link)}
                    className="hover:bg-gray-100 cursor-pointer block"
                  >
                    {child.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </nav>
);
};


const sidebarStyles: { [key: string]: React.CSSProperties } = {
  nav: {
    height: "fit-content",
    paddingTop: "8px",
    paddingLeft: "20px",
    paddingBottom: "0px",
    border: "1px solid #e1e5e9",
    borderLeft: "1px solid #e1e5e9",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    fontFamily: "sans-serif",
    // overflowY: "auto",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    marginBottom: "2px",
  },
  parentLink: {
    display: "block",
    fontWeight: "600",
    textDecoration: "none",
    color: "#2c3e50",
    padding: "12px 20px",
    fontSize: "16px",
    borderLeft: "3px solid transparent",
    transition: "all 0.2s ease",
    borderRadius: "0 4px 4px 0",
  },
  subList: {
    listStyle: "none",
    paddingLeft: "0",
    margin: "4px 0 8px 0",
    borderLeft: "2px solid #e9ecef",
  },
  subListItem: {
    marginBottom: "2px",
  },
  childLink: {
    display: "block",
    textDecoration: "none",
    color: "#6c757d",
    padding: "8px 20px 8px 35px",
    fontSize: "14px",
    transition: "all 0.2s ease",
    borderRadius: "0 4px 4px 0",
    borderLeft: "2px solid transparent",
  },
};

export default Sidebar;
