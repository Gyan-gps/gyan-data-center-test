/**
 * Contact Us API Types
 */

export interface ContactUsRequest {
  name: string;
  email: string;
  company: string;
  phone?: string;
  countryCode?: string;
  countryName?: string;
  message: string;
  windowUrl: string;
}

export interface ContactUsResponse {
  id: string;
  message: string;
}

export interface CountryCodeResponse {
  country: string;
  countryCode: string;
  countryName?: string;
}

export interface CountryCodeOption {
  code: string;
  country: string;
  name: string;
}

export interface CountryFromBackend {
  country_code: string;
  country_name: string;
  calling_code: string;
}

export interface CountryListResponse {
  map(arg0: (country: CountryFromBackend) => { code: string; country: string; name: string; }): CountryCodeOption[] | PromiseLike<CountryCodeOption[]>;
  success: boolean;
  data: CountryFromBackend[];
  message: string;
}
