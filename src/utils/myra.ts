/**
 * Get domain information based on hostname
 * @param {string} hostname - The hostname to analyze
 * @returns {Object} Object containing domain and iframeDomain information
 */
export function getDomainInfo(hostname) {
  const result = {
    domain: "",
    iframeDomain: ""
  };
  
  // Check for localhost first
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    result.domain = "";
    result.iframeDomain = "";
  } 
  // Check for mordorlabs.com
  else if (hostname.includes("mordorlabs.com")) {
    result.domain = ".mordorlabs.com";
    result.iframeDomain = "https://myra-chat.mordorlabs.com";
  } 
  // Check for mordorintelligence.com
  else if (hostname.includes("mordorintelligence.com")) {
    result.domain = ".mordorintelligence.com";
    result.iframeDomain = "https://myra-chat.mordorintelligence.com";
  }
  // For any other domains, extract the parent domain
  else {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // Get the main domain (last two parts)
      result.domain = '.' + parts.slice(-2).join('.');
      // For now, no iframe domain for unknown domains
      result.iframeDomain = "";
    }
  }
  
  return result;
}

export function setCookie(key: string, value: string, hours = 24) {
  const hostname = window.location.hostname;
  const { domain } = getDomainInfo(hostname);

  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000); // Set the expiration time in milliseconds
  const expires = "expires=" + date.toUTCString();
  document.cookie =
    key + "=" + value + ";expires=" + expires + `;domain=${domain};path=/`;
}