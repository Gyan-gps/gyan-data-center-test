import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Loading, Button } from "@/components/ui";
import { getCompanyAssets } from "@/network";
import type { CompanyAssetsContacts } from "@/network";
import type { ExtendedCompany } from "./types";
import { 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  Globe,
  User,
  Mail,
  Phone,
  Linkedin,
} from "lucide-react";
import { Link } from "react-router";

interface CompanyAssetPanelProps {
  company: ExtendedCompany | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyAssetPanel: React.FC<CompanyAssetPanelProps> = ({
  company,
  isOpen,
  onClose,
}) => {
  const [companyData, setCompanyData] = useState<CompanyAssetsContacts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyAssets = useCallback(async () => {
    if (!company?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCompanyAssets(company.id);
      setCompanyData(data);
    } catch (err) {
      console.error("Error fetching company assets:", err);
      setError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  useEffect(() => {
    if (isOpen && company?.id) {
      fetchCompanyAssets();
    }
  }, [isOpen, company?.id, fetchCompanyAssets]);

  const formatNumber = (num: number | string) => {
    const n = typeof num === "string" ? parseFloat(num) : num;
    return isNaN(n) ? "N/A" : n.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "operational":
      case "active":
        return "bg-green-100 text-green-800";
      case "under construction":
      case "planned":
        return "bg-blue-100 text-blue-800";
      case "inactive":
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "tier iv":
      case "tier 4":
        return "bg-purple-100 text-purple-800";
      case "tier iii":
      case "tier 3":
        return "bg-blue-100 text-blue-800";
      case "tier ii":
      case "tier 2":
        return "bg-green-100 text-green-800";
      case "tier i":
      case "tier 1":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!company) return null;

  return (
    <div 
      className={`fixed top-0 right-0 h-full bg-white shadow-2xl border-l border-gray-200 z-40 transition-transform duration-300 ease-in-out w-full sm:w-96 md:w-[480px] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">{company.name}</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {companyData ? `${companyData.assets.length} Assets • ${companyData.contacts.length} Contacts` : "Loading..."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex items-center gap-1 shrink-0 ml-2 p-1 sm:p-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]">
        {loading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <Loading text="Loading assets..." />
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 px-3 sm:px-6">
            <div className="text-red-500 text-base sm:text-lg mb-2">Error</div>
            <div className="text-gray-600 mb-4 text-xs sm:text-sm">{error}</div>
            <Button onClick={fetchCompanyAssets} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : !companyData || (companyData.assets.length === 0 && companyData.contacts.length === 0) ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 px-3 sm:px-6">
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm sm:text-base font-medium mb-1 text-gray-700">
              No data found
            </h3>
            <p className="text-xs sm:text-sm">This company doesn't have any associated assets or contacts.</p>
          </div>
        ) : (
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
            {/* Contacts Section */}
            {companyData.contacts && companyData.contacts.length > 0 && (
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-green-900 text-xs sm:text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Company Contacts
                  </h3>
                  <span className="text-xl sm:text-2xl font-bold text-green-900">{companyData.contacts.length}</span>
                </div>
                
                <div className="space-y-3">
                  {companyData.contacts.map((contact) => (
                    <Card key={contact.id} className="bg-white border border-green-200">
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900 text-xs sm:text-sm">
                                {contact.Contact_Person}
                              </h5>
                              <p className="text-xs text-gray-600">{contact.Contact_Person_Designation}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-1.5 sm:gap-2 text-xs">
                            {contact.Contact_Person_Email && (
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                <a href={`mailto:${contact.Contact_Person_Email}`} className="text-blue-600 hover:underline truncate">
                                  {contact.Contact_Person_Email}
                                </a>
                              </div>
                            )}
                            
                            {contact.Contact_Person_Phone && (
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                <a href={`tel:${contact.Contact_Person_Phone}`} className="text-blue-600 hover:underline">
                                  {contact.Contact_Person_Phone}
                                </a>
                              </div>
                            )}
                            
                            {contact.Contact_Person_LinkedIn_ID && (
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Linkedin className="w-3 h-3 text-gray-400 shrink-0" />
                                <a 
                                  href={contact.Contact_Person_LinkedIn_ID.startsWith('http') ? contact.Contact_Person_LinkedIn_ID : `https://linkedin.com/in/${contact.Contact_Person_LinkedIn_ID}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate"
                                >
                                  LinkedIn Profile
                                </a>
                              </div>
                            )}
                            
                            {contact.region && contact.region.length > 0 && (
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Globe className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="text-gray-600 truncate">
                                  {contact.region.join(', ')} {contact.country && contact.country.length > 0 && `• ${contact.country.join(', ')}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Assets Summary */}
            {companyData.assets && companyData.assets.length > 0 && (
              <>
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900 text-xs sm:text-sm">Total Assets</h3>
                      <p className="text-xl sm:text-2xl font-bold text-blue-900">{companyData.assets.length}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-blue-900">
                        {formatNumber(companyData.assets.reduce((sum, asset) => sum + (asset["IT Load (Total/Planned, MW)"] || 0), 0))} MW
                      </div>
                      <div className="text-xs text-blue-700">Total IT Load</div>
                    </div>
                  </div>
                </div>

                {/* Assets List */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Data Center Assets
                  </h4>
                  
                  {companyData.assets.map((asset) => (
                    <Card key={asset.id} className="hover:shadow-sm transition-shadow border border-gray-100">
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2 sm:space-y-3">
                          {/* Asset Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 truncate text-xs sm:text-sm">
                                <Link to={`/datacenter/${asset.dcId}`} className="hover:underline hover:text-blue-500">
                                  {asset["Data Center"]}
                                </Link>
                              </h5>
                              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getStatusColor(asset.status)}`}>
                                  {asset.status}
                                </span>
                                {asset["Uptime Tier"] && (
                                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getTierColor(asset["Uptime Tier"])}`}>
                                    {asset["Uptime Tier"]}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <div className="text-sm sm:text-lg font-bold text-blue-600">
                                {formatNumber(asset["IT Load (Total/Planned, MW)"])} MW
                              </div>
                            </div>
                          </div>

                          {/* Asset Details */}
                          <div className="grid grid-cols-1 gap-1.5 sm:gap-2 text-xs">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="text-gray-600 truncate">{asset.city}, {asset.country}</span>
                            </div>

                            {asset["Facility Type"] && (
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="text-gray-600 truncate">{asset["Facility Type"]}</span>
                              </div>
                            )}

                            {asset["Commissioned (Year)"] && (
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="text-gray-600">Commissioned {asset["Commissioned (Year)"]}</span>
                              </div>
                            )}

                            {asset["Operator / Owner"] && (
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Globe className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="text-gray-600 truncate">{asset["Operator / Owner"]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};