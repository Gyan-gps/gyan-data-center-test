import React, { useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  getUserProfile,
  getFavoriteDataCenters,
  getFavoriteCompanies,
  getUserTickets,
} from "@/network/user/user.api";
import { Loading } from "@/components/ui";
import { useNavigate } from "react-router";
import { Root, List, Trigger, Content } from "@radix-ui/react-tabs";
import { formatCompanyNameToRedirect } from "@/utils";
import { User, Star, Ticket, Clock } from "lucide-react";

export const UserProfile: React.FC = () => {
  const { setUser, trialState } = useAuthStore();
  const navigate = useNavigate();

  // Run all queries in parallel using useQueries
  const queries = useQueries({
    queries: [
      {
        queryKey: ["userProfile"],
        queryFn: getUserProfile,
      },
      {
        queryKey: ["userFavorites"],
        queryFn: getFavoriteDataCenters,
      },
      {
        queryKey: ["userFavoriteCompanies"],
        queryFn: getFavoriteCompanies,
      },
      {
        queryKey: ["userTickets"],
        queryFn: getUserTickets,
      },
    ],
  });

  // Destructure results from queries array
  const [
    { data: userProfile, isLoading, error },
    { data: favorites, isLoading: favoritesLoading },
    { data: favoriteCompanies, isLoading: favoriteCompaniesLoading },
    { data: userTickets, isLoading: ticketsLoading },
  ] = queries;

  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);
    }
  }, [userProfile, setUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading text="Loading user profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            Error loading user profile:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8 text-gray-500">
          No user profile found
        </div>
      </div>
    );
  }

  const user = userProfile;
  const isActive = user.isActive;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 w-full">
      {/* Header */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-16 h-16 bg-linear-to-br from-gray-200 to-gray-200 rounded-full flex items-center justify-center font-bold text-xl text-gray-600">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-gray-500">{user.role}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user.status}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                !user.trial === true
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user.trial ? "Trial" : "Full Access"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Root defaultValue="profile" className="w-full">
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <List className="flex min-w-max">
            <Trigger
              value="profile"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 transition-colors flex-shrink-0 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <User className="w-4 h-4" />
              Profile
            </Trigger>
            {/* <Trigger
              value="credits"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 transition-colors flex-shrink-0 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4" />
              Credits
            </Trigger> */}
            <Trigger
              value="favorites"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 transition-colors flex-shrink-0 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Star className="w-4 h-4" />
              Favorites
            </Trigger>
            <Trigger
              value="tickets"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 transition-colors flex-shrink-0 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Ticket className="w-4 h-4" />
              Tickets
            </Trigger>
            {user.trial && (
              <Trigger
                value="trial"
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 transition-colors flex-shrink-0 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Clock className="w-4 h-4" />
                Trial Info
              </Trigger>
            )}
          </List>
        </div>

        {/* Profile Tab */}
        <Content value="profile" className="focus:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              <div className="space-y-3">
                {user.company && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Company
                    </span>
                    <span className="text-sm text-gray-900">
                      {user.company}
                    </span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Phone
                    </span>
                    <span className="text-sm text-gray-900">{user.phone}</span>
                  </div>
                )}
                {user.startDate && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Start Date
                    </span>
                    <span className="text-sm text-gray-900">
                      {(() => {
                        const date = new Date(user.startDate);
                        return `${date.getDate()} ${date.toLocaleString(
                          "default",
                          { month: "long" },
                        )}, ${date.getFullYear()}`;
                      })()}
                    </span>
                  </div>
                )}
                {user.expiresOn && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Expiry Date
                    </span>
                    <span className="text-sm text-gray-900">
                      {(() => {
                        const date = new Date(user.expiresOn);
                        return `${date.getDate()} ${date.toLocaleString(
                          "default",
                          { month: "long" },
                        )}, ${date.getFullYear()}`;
                      })()}
                    </span>
                  </div>
                )}
                {user.trial &&
                  trialState?.remainingSeconds !== null &&
                  trialState?.remainingSeconds !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Trial Remaining
                      </span>
                      <span
                        className={`text-sm font-mono font-medium ${trialState.status === "expired" || trialState.remainingSeconds <= 0 ? "text-red-500" : "text-gray-900"}`}
                      >
                        {trialState.status === "expired" ||
                        trialState.remainingSeconds <= 0 ? (
                          "Trial access is over"
                        ) : (
                          <>
                            {Math.floor(trialState.remainingSeconds / 3600) > 0
                              ? `${Math.floor(trialState.remainingSeconds / 3600)}h `
                              : ""}
                            {Math.floor(
                              (trialState.remainingSeconds % 3600) / 60,
                            )}
                            m{" "}
                            {(trialState.remainingSeconds % 60)
                              .toString()
                              .padStart(2, "0")}
                            s
                          </>
                        )}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Permissions
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Data Export
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      user.allowExport ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {user.allowExport ? "Allowed" : "Not allowed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Allowed Pages */}
          {user.trial ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Accessible Pages
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Full Platform Access
                </span>
              </div>
            </div>
          ) : user.allowedPages.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Accessible Pages
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.allowedPages.map((page, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium"
                  >
                    {page}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Notes */}
          {user.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Notes
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                {user.notes}
              </p>
            </div>
          )}

          {/* Account Timestamps */}
          {(user.createdAt || user.updatedAt) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500">
                {user.createdAt && (
                  <span>
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                )}
                {user.updatedAt && (
                  <span>
                    Updated: {new Date(user.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </Content>

        {/* Credits Tab */}
        <Content value="credits" className="focus:outline-none">
          <div className="flex flex-col md:flex-row gap-6">
            {/* MyRA Credits */}
            {userProfile.trial === true &&
            (user.myraTotalCredits !== undefined ||
              user.myraRemainingCredits !== undefined) ? (
              <div className="space-y-4 w-full">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  DCX AI Credits
                </h3>
                <div className="space-y-3">
                  {user.myraTotalCredits !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Total Credits
                      </span>
                      <span className="text-sm text-gray-900">
                        {user.myraTotalCredits}
                      </span>
                    </div>
                  )}
                  {user.myraRemainingCredits !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Remaining Credits
                      </span>
                      <span className="text-sm text-gray-900">
                        {user.myraRemainingCredits}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}

            {/* On Demand Credits */}
            {(user.onDemandTotalCredits !== undefined ||
              user.onDemandRemainingCredits !== undefined) && (
              <div className="space-y-4 w-full">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  On Demand Credits
                </h3>
                <div className="space-y-3">
                  {user.onDemandTotalCredits !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Total Credits
                      </span>
                      <span className="text-sm text-gray-900">
                        {user.onDemandTotalCredits}
                      </span>
                    </div>
                  )}
                  {user.onDemandRemainingCredits !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Remaining Credits
                      </span>
                      <span className="text-sm text-gray-900">
                        {user.onDemandRemainingCredits}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Show message if no credits */}
          {/* {!(
            user.myraTotalCredits !== undefined ||
            user.myraRemainingCredits !== undefined ||
            user.onDemandTotalCredits !== undefined ||
            user.onDemandRemainingCredits !== undefined
          ) && (
            <div className="text-center py-8 text-gray-500">
              No credit information available
            </div>
          )} */}
        </Content>

        {/* Favorites Tab */}
        {/* Favorites Tab */}
        <Content value="favorites" className="focus:outline-none">
          <div className="space-y-6">
            {/* Favorite Data Centers */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Favorite Data Centers
              </h3>
              {favoritesLoading ? (
                <div className="text-sm text-gray-500">
                  Loading favorites...
                </div>
              ) : favorites && favorites.length > 0 ? (
                <div className="space-y-2">
                  {favorites.map(
                    (favorite: {
                      id: string;
                      dcId: string;
                      name: string;
                      operatorName: string;
                    }) => (
                      <div
                        key={favorite.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium text-gray-900 truncate"
                            title={favorite.name}
                          >
                            {favorite.name}
                          </div>
                          <div className="text-sm text-gray-800">
                            {favorite.operatorName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {favorite.dcId}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            navigate(`/datacenter/${favorite.dcId}`)
                          }
                          className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                        >
                          View Details
                        </button>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No favorite data centers yet. Click the star icon on data
                  centers to add them to your favorites.
                </div>
              )}
            </div>

            {/* Favorite Companies */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Favorite Companies
              </h3>
              {favoriteCompaniesLoading ? (
                <div className="text-sm text-gray-500">
                  Loading favorite companies...
                </div>
              ) : favoriteCompanies && favoriteCompanies.length > 0 ? (
                <div className="space-y-2">
                  {favoriteCompanies.map(
                    (favorite: { id: string; name: string }) => (
                      <div
                        key={favorite.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium text-gray-900 truncate"
                            title={favorite.name}
                          >
                            {favorite.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {favorite.id}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            navigate(
                              `/company/${formatCompanyNameToRedirect(
                                favorite.name,
                              )}/${favorite.id}`,
                            )
                          }
                          className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                        >
                          View Details
                        </button>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No favorite companies yet. Click the star icon on companies to
                  add them to your favorites.
                </div>
              )}
            </div>
          </div>
        </Content>

        {/* Tickets Tab */}
        <Content value="tickets" className="focus:outline-none">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">
                My Submitted Tickets
              </h3>
              {ticketsLoading ? (
                <div className="text-sm text-gray-500">Loading tickets...</div>
              ) : userTickets && userTickets.length > 0 ? (
                <div
                  className="space-y-4"
                  // max height with overflow scroll
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  {userTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Ticket ID: {ticket.ticketId}
                          </div>
                          <div className="text-xs text-gray-500">
                            Submitted:{" "}
                            {ticket.submittedAt
                              ? new Date(
                                  ticket.submittedAt,
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.status === "Open"
                              ? "bg-yellow-100 text-yellow-800"
                              : ticket.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : ticket.status === "Closed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                          {ticket.message || "No message provided"}
                        </div>
                      </div>
                      {ticket.attachments && (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Attachments:</span>{" "}
                          <a
                            href={ticket.attachments}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View File
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No tickets submitted yet. You can submit a ticket using the
                  "Ask Analyst" feature.
                </div>
              )}
            </div>
          </div>
        </Content>

        {/* Trial Info Tab */}
        {user.trial && (
          <Content value="trial" className="focus:outline-none">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3 mt-4">
                  Trial Status
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Time Remaining
                      </div>
                      <div className="text-4xl font-mono font-bold text-gray-900">
                        {trialState?.remainingSeconds !== null &&
                        trialState?.remainingSeconds !== undefined ? (
                          <>
                            {Math.floor(trialState.remainingSeconds / 3600) > 0
                              ? `${Math.floor(trialState.remainingSeconds / 3600)}h `
                              : ""}
                            {Math.floor(
                              (trialState.remainingSeconds % 3600) / 60,
                            )}
                            m{" "}
                            {(trialState.remainingSeconds % 60)
                              .toString()
                              .padStart(2, "0")}
                            s
                          </>
                        ) : (
                          "Loading..."
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Time is deducted according to the Airtable allocations.
                      Once your timer expires, you will be required to upgrade
                      your account for continued access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Content>
        )}
      </Root>
    </div>
  );
};
