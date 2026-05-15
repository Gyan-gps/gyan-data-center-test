/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as HoverCard from "@radix-ui/react-hover-card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Edit2,
  Menu as MenuIcon,
  MessageSquarePlus,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type { TConversation, TMessage } from "../../../types/models";
import { cn, sendEventToDataLayer } from "../../../lib/utils";
import {
  useDeleteConversation,
  useGetConversations,
  useUpdateConversation,
} from "../../../hooks/api/useConversations";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { InfoHoverCard } from "../../../components/ui/InfoHoverCard";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useAuth } from "@/hooks";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import creditImg from "@/assets/images/credit-img.svg";

// Enable relative time formatting (e.g., "2 hours ago")
// eslint-disable-next-line
dayjs.extend(relativeTime as any);

type TConversationSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId: string | null;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpened: string[];
  setSidebarOpened: React.Dispatch<React.SetStateAction<string[]>>;
  setMessages: React.Dispatch<React.SetStateAction<TMessage[]>>;
  convSidebarOpen: boolean;
  messagesEmpty: boolean;
};

/**
 * Conversation Sidebar Component
 *
 * Displays user's chat history with search, rename, and delete functionality.
 *
 * Key features:
 * - Supports both authenticated and anonymous users
 * - Real-time search filtering
 * - Infinite scroll for performance with large conversation lists
 * - Rename and delete capabilities (authenticated users only)
 * - Responsive design (overlay on mobile, sidebar on desktop)
 * - Active conversation highlighting
 *
 * The component intelligently switches between authenticated and anonymous
 * conversation APIs based on user state, providing a seamless experience
 * for all users.
 */
export const ConversationSidebar = ({
  isOpen,
  onClose,
  currentConversationId,
  setIsSidebarOpen,
  sidebarOpened,
  setSidebarOpened,
  setMessages,
  messagesEmpty,
}: TConversationSidebarProps) => {
  const {
    user,
    deleteMessage,
    message: stateMessage,
    credits,
    shouldDeductCredit,
  } = useAuth();
  const navigate = useNavigate();

  // should users credit be deducted? Trail users should have credits deducted only
  const deductCreditForThisUser = shouldDeductCredit();

  // Search state for filtering conversations
  const [searchQuery, setSearchQuery] = useState("");

  // Display count for infinite scroll (starts with 20)
  const [displayCount, setDisplayCount] = useState(20);

  // Dialog states for rename and delete operations
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Currently selected conversation for operations
  const [selectedConversation, setSelectedConversation] =
    useState<TConversation | null>(null);

  // New title for rename operation
  const [newTitle, setNewTitle] = useState("");

  // Ref for scroll container (infinite scroll)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Conditional Data Fetching
   *
   * Uses different hooks based on authentication status:
   * - Authenticated: Fetches user's conversations from backend
   * - Anonymous: Fetches fingerprint-based conversations
   *
   * Only one hook is active at a time based on user state.
   */
  const { data: conversations, isLoading } = useGetConversations({
    enabled: !!user,
  });

  // Select appropriate data based on auth state
  // const conversations = authenticatedConversations || [];
  //  useMemo(
  //   () => (user ? authenticatedConversations : anonymousConversations || []),
  //   [user, anonymousConversations, authenticatedConversations]
  // );
  // const isLoading = authLoading; // user ? authLoading : anonLoading;

  // Mutation hooks for conversation operations
  const { mutate: deleteConversation } = useDeleteConversation();
  const { mutate: updateConversation } = useUpdateConversation();

  /**
   * Filter conversations based on search query
   *
   * Case-insensitive search through conversation titles.
   * Returns empty array if no conversations loaded.
   */
  const filteredConversations = searchQuery
    ? [...(Array.isArray(conversations) ? conversations : [])].filter(
        (conv: TConversation) =>
          conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    : conversations || [];

  /**
   * Implement virtual scrolling for performance
   *
   * Only renders visible conversations plus a buffer.
   * Prevents performance issues with hundreds of conversations.
   */
  const displayedConversations = searchQuery
    ? filteredConversations.slice(0, displayCount)
    : conversations || [];

  /**
   * Infinite Scroll Handler
   *
   * Loads more conversations as user scrolls near bottom.
   * Threshold: 100px from bottom triggers load.
   * Loads 20 more conversations at a time.
   */
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      // Load more when near bottom (100px threshold)
      setDisplayCount((prev) =>
        Math.min(prev + 20, filteredConversations.length)
      );
    }
  }, [filteredConversations.length]);

  useEffect(() => {
    if (
      !isLoading &&
      Array.isArray(conversations) &&
      conversations.length < 1 &&
      window &&
      window.innerWidth < 1221
    ) {
      setIsSidebarOpen(false);
      setSidebarOpened(["inactive"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, user, isLoading, credits]);

  /**
   * Set up scroll listener
   *
   * Attaches scroll handler to container.
   * Properly cleans up on unmount.
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /**
   * Handle Conversation Selection
   *
   * Navigates to selected conversation and closes sidebar on mobile.
   * Uses client-side navigation for smooth transition.
   */
  const handleSelectConversation = (conversationId: string) => {
    if (Object.keys(stateMessage || {})?.length) {
      deleteMessage();
    }
    // window.location.href = `/chat/${conversationId}`;
    navigate(`/dcx-ai/${conversationId}`);
    if (window.innerWidth <= 1300) onClose(); // Close sidebar on mobile after selection
  };

  /**
   * Handle Rename Click
   *
   * Opens rename dialog with current title pre-filled.
   * Stops event propagation to prevent conversation selection.
   */
  const handleRenameClick = (
    conversation: TConversation,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent conversation selection
    setSelectedConversation(conversation);
    setNewTitle(conversation.title);
    setRenameDialogOpen(true);
  };

  /**
   * Handle Delete Click
   *
   * Opens confirmation dialog for deletion.
   * Stops event propagation to prevent conversation selection.
   */
  const handleDeleteClick = (
    conversation: TConversation,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent conversation selection
    setSelectedConversation(conversation);
    setDeleteDialogOpen(true);
  };

  /**
   * Execute Rename Operation
   *
   * Validates new title and calls mutation.
   * Trims whitespace and requires non-empty title.
   * Dialog closes on successful submission.
   */
  const handleRename = () => {
    if (selectedConversation && newTitle.trim()) {
      updateConversation({
        conversationId: selectedConversation.conversation_id,
        title: newTitle.trim(),
      });
      setRenameDialogOpen(false);
    }
  };

  /**
   * Execute Delete Operation
   *
   * Deletes conversation and handles navigation.
   * If deleting current conversation, redirects to new chat.
   * This prevents showing 404 for deleted conversation.
   */
  const handleDelete = () => {
    if (selectedConversation) {
      deleteConversation(selectedConversation.conversation_id);
      setDeleteDialogOpen(false);

      // Redirect if deleting current conversation
      if (currentConversationId === selectedConversation.conversation_id) {
        // window.location.href = "/dcx-ai";
      }
    }
  };

  const toggleSidebar = () => {
    const shouldOpen = !isOpen;

    setIsSidebarOpen(shouldOpen);
    setSidebarOpened([shouldOpen ? "active" : "closed"]);
  };

  const handleSidebarAnimationOnHover = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).id === "options-container" || isOpen)
      return;

    const { type } = event;

    if (
      type === "mouseenter" &&
      sidebarOpened.length <= 1 &&
      !sidebarOpened.includes("closed")
    ) {
      setSidebarOpened((prev) => [...prev, "hover"]);
    } else if (type === "mouseleave" && sidebarOpened.length <= 2) {
      if (sidebarOpened.includes("closed")) {
        setSidebarOpened([]);
      } else if (sidebarOpened.includes("hover")) {
        setSidebarOpened(["inactive"]);
      }
    }
  };

  return (
    <>
      {/* 
        Mobile Overlay
        
        Semi-transparent backdrop for mobile devices.
        Clicking overlay closes the sidebar.
        Only visible when sidebar is open on mobile.
      */}
      {(isOpen || sidebarOpened.includes("hover")) && (
        <div
          className="fixed top-0 inset-0 z-30 bg-black/20 backdrop-blur-sm min-[1300px]:hidden"
          onClick={onClose}
        />
      )}

      {/* 
        Main Sidebar Container
        
        Responsive positioning:
        - Mobile: Fixed overlay with slide-in animation
        - Desktop: Static sidebar always visible
        
        Uses transform for smooth animations and GPU acceleration.
      */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-full min-[1300px]:w-72 translate-x-0 overflow-x-hidden border-r border-[#e1e7ef] bg-[#f7fcfd] transition-all duration-500 min-[1300px]:relative",
          isOpen || (!isOpen && sidebarOpened.includes("hover"))
            ? ""
            : "max-[1300px]:-translate-x-full xl:w-16"
        )}
        onMouseEnter={(e: React.MouseEvent) =>
          !isOpen ? handleSidebarAnimationOnHover(e) : null
        }
        onMouseLeave={(e: React.MouseEvent) =>
          !isOpen ? handleSidebarAnimationOnHover(e) : null
        }
      >
        {isOpen || (!isOpen && sidebarOpened.includes("hover")) ? (
          <div className="flex h-full flex-col">
            {/* 
            Sidebar Header
            
            Fixed header with title and close button.
            Close button only visible on mobile.
          */}
            <div className="flex w-72 items-center justify-between border-b bg-background/95 py-3 pl-4 pr-3 xl:hidden">
              {/* <h3 className="font-semibold text-foreground"> */}
              <h3 className="py-2 font-semibold text-[#727676]">Chats</h3>
              <Button
                // className="md:hidden"
                size="icon"
                variant="ghost"
                onClick={onClose}
              >
                <X className="size-4" />
              </Button>
            </div>

            {deductCreditForThisUser ? (
              <div className="flex w-full items-center justify-between p-3 pb-0">
                <button
                  className="flex cursor-auto! items-center justify-center gap-1 w-full rounded-md bg-[#dde3ea] px-4 py-2 hover:bg-[#ced3da]"
                  title={`${Math.max(credits, 0)} credits remaining`}
                  aria-label={`${Math.max(credits, 0)} credits remaining`}
                  type="button"
                >
                  <img
                    alt="Credit Icon"
                    loading="eager"
                    width="16"
                    height="16"
                    decoding="async"
                    data-nimg="1"
                    className="size-3 text-primary md:size-4"
                    src={creditImg}
                  />
                  <span>{Math.max(credits, 0)} credits</span>
                </button>
              </div>
            ) : null}

            {/* 
            Search Input
            
            Real-time search through conversation titles.
            Icon positioned absolutely for consistent alignment.
            Filters update immediately as user types.
          */}
            <div className="flex items-center justify-start gap-1 px-3 pb-3 max-xl:mt-2 xl:p-4">
              {/* Sidebar Toggle */}
              <Button
                className="bottom-1 hidden p-0 xl:flex"
                size="icon"
                title={
                  isOpen // && sidebarOpened === 'active'
                    ? "Close Sidebar"
                    : "Open Sidebar"
                }
                variant="ghost"
                onClick={toggleSidebar}
              >
                <MenuIcon className="size-6" />
              </Button>

              {/* Animated Search Input */}
              <div
                className={`relative bg-white transition-all duration-300 ease-in-out ${
                  searchOpen
                    ? "w-full scale-100 opacity-100"
                    : "pointer-events-auto w-full scale-100 opacity-100 md:pointer-events-none md:w-0 md:scale-95 md:opacity-0"
                }`}
                style={{ transitionProperty: "opacity, transform, width" }}
              >
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus={isOpen && searchOpen}
                  className="h-9 pl-9 text-sm"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Toggle Search Button */}
              <Button
                className="hidden md:ml-auto md:flex"
                size="icon"
                title={searchOpen ? "Close Search" : "Open Search"}
                variant="ghost"
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                {searchOpen ? (
                  <X className="size-4" />
                ) : (
                  <Search className="size-4" />
                )}
              </Button>
            </div>

            {/* 
            New Chat Button
            
            Quick action to start a fresh conversation.
            Benefits:
            - Always accessible
            - Preserves current chat in history
            - Resets context for new topics
            
            Uses window.location for full page refresh to ensure
            clean state initialization.
          */}
            <div className="flex w-72 items-center justify-between px-3 pb-3">
              <Button
                className="w-full gap-2 text-primary hover:bg-primary/10 hover:text-[#2E8BBD]"
                disabled={window.location.pathname === "/dcx-ai" && messagesEmpty}
                size="sm"
                variant="outline"
                onClick={() => {
                  sendEventToDataLayer("new-chat-start");
                  navigate("/dcx-ai");
                  setMessages([]);
                  if (window.innerWidth <= 1300) onClose(); // Close sidebar on mobile after selection
                }}
              >
                <MessageSquarePlus className="size-4" />
                <span>New Chat</span>
              </Button>
            </div>

            <div className="mb-2 hidden items-center justify-between border-t-[#e1e7ef] px-4 py-1 xl:flex">
              <h3 className="py-2 text-sm font-semibold text-[#727676]">
                Chats
              </h3>

              <InfoHoverCard />
            </div>

            {/* 
            Conversations List Container
            
            Scrollable area with infinite scroll implementation.
            Ref attached for scroll event handling.
            Flex-1 ensures it takes remaining height.
          */}
            <div
              ref={scrollContainerRef}
              className="custom-scrollbar w-72 flex-1 overflow-y-auto px-3 md:px-4"
            >
              {isLoading ? (
                // Loading state with spinner
                <div className="py-8 text-center">
                  <div className="mx-auto size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredConversations.length === 0 ? (
                // Empty state with contextual message
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
              ) : (
                // Conversation items list
                <div className="space-y-1 pb-4">
                  {displayedConversations.map((conversation: TConversation) => (
                    <div
                      key={conversation.conversation_id}
                      className={cn(
                        "group relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-primary/10",
                        currentConversationId ===
                          conversation.conversation_id &&
                          "bg-primary/20 hover:bg-primary/20"
                      )}
                    >
                      {/* Conversation click target */}
                      <HoverCard.Root closeDelay={100} openDelay={100}>
                        <HoverCard.Trigger asChild>
                          <button
                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                            onClick={() =>
                              handleSelectConversation(
                                conversation.conversation_id
                              )
                            }
                          >
                            <p className="w-[95%] truncate text-sm font-normal text-gray-600">
                              {conversation.title}
                            </p>
                          </button>
                        </HoverCard.Trigger>

                        <HoverCard.Portal>
                          <HoverCard.Content
                            align="center"
                            className="max-600:absolute max-600:top-6 max-600:-left-52 max-600:min-w-fit max-600:max-w-72 z-50 break-words rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-lg ring-1 ring-black/10 sm:max-w-sm"
                            side="right"
                            sideOffset={30}
                          >
                            {conversation.title}
                          </HoverCard.Content>
                        </HoverCard.Portal>
                      </HoverCard.Root>

                      {/* 3-dot menu, visible on hover only for authenticated users */}
                      {user ? (
                        <DropdownMenu.Root
                          onOpenChange={(open: boolean) => {
                            if (open && !isOpen) {
                              setIsSidebarOpen(true);
                              setSidebarOpened(["active"]);
                            }
                          }}
                        >
                          <DropdownMenu.Trigger asChild>
                            <button
                              aria-label="Options"
                              className="absolute right-1 top-1 rounded px-1 py-2 opacity-0 hover:bg-transparent hover:text-black group-hover:opacity-100 data-[state=open]:opacity-100"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenu.Trigger>

                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              align="start"
                              className="z-50 w-40 rounded-md bg-white p-1 shadow-lg ring-1 ring-black/5"
                              side="right"
                              sideOffset={20}
                            >
                              <DropdownMenu.Item
                                className={cn(
                                  "group flex w-full cursor-pointer items-center gap-2 rounded p-2 text-sm text-gray-700 hover:bg-[#2e8bbd1a] hover:outline-none"
                                )}
                                onSelect={(e: any) =>
                                  handleRenameClick(conversation, e)
                                }
                              >
                                <Edit2 className="size-4" />
                                Rename
                              </DropdownMenu.Item>

                              <DropdownMenu.Item
                                className={cn(
                                  "group flex w-full cursor-pointer items-center gap-2 rounded p-2 text-sm text-destructive hover:bg-[#2e8bbd1a] hover:text-destructive hover:outline-none"
                                )}
                                onSelect={(e: any) =>
                                  handleDeleteClick(conversation, e)
                                }
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      ) : null}
                    </div>
                  ))}
                  {/* 
                  Loading More Indicator
                  
                  Shows spinner when more conversations are available.
                  Appears at bottom of list during infinite scroll.
                */}
                  {displayedConversations.length <
                    filteredConversations.length && (
                    <div className="py-2 text-center">
                      <div className="mx-auto size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className="hidden flex-col items-start justify-start gap-3.5 px-3 pb-3 md:p-4 xl:flex"
            id="options-container"
          >
            {/* <button
              className="flex items-center cursor-auto! justify-center gap-1 w-full rounded-md bg-[#dde3ea] p-2 hover:bg-[#ced3da]"
              title={`${Math.max(credits, 0)} credits remaining`}
              aria-label={`${Math.max(credits, 0)} credits remaining`}
              type="button"
            >
              <img
                alt="Credit Icon"
                loading="eager"
                width="16"
                height="16"
                decoding="async"
                data-nimg="1"
                className="size-3 text-primary md:size-4"
                src={creditImg}
              />
            </button> */}

            {/* Sidebar Toggle */}
            <Button
              className="hidden md:flex"
              size="icon"
              title="Open Sidebar"
              variant="ghost"
              onClick={() => (isOpen ? onClose() : setIsSidebarOpen(true))}
            >
              <MenuIcon className="size-6" />
            </Button>

            {/* Toggle Search Button */}
            {/* <Button
              className="hidden md:flex"
              size="icon"
              title="Search chats"
              variant="ghost"
              onClick={() => {
                setIsSidebarOpen(true)
                setSearchOpen(true)
              }}
            >
              <Search className="size-4" />
            </Button> */}

            <Button
              className="hidden md:flex"
              size="icon"
              title="New chat"
              variant="ghost"
              onClick={() => {
                if (window.location.pathname === "/dcx-ai" && messagesEmpty) {
                  toast.custom("You are already in a new chat.");
                  return;
                }
                navigate("/dcx-ai");
                setMessages([]);
                // window.location.href = "/dcx-ai";
              }}
            >
              <Plus className="size-4" />
            </Button>

            <InfoHoverCard />
          </div>
        )}
      </aside>

      {/* 
        Rename Dialog
        
        Modal for renaming conversations.
        Features:
        - Pre-filled with current title
        - Enter key submits
        - Validation for empty titles
        - Cancel and confirm actions
      */}
      {renameDialogOpen ? (
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Conversation</DialogTitle>
              <DialogDescription>
                Enter a new name for this conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-title">New Title</Label>
                <Input
                  autoFocus
                  id="new-title"
                  placeholder="Enter new title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setRenameDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={!newTitle.trim()}
                  onClick={handleRename}
                >
                  Rename
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* 
        Delete Confirmation Dialog
        
        Modal for confirming conversation deletion.
        Features:
        - Clear warning about permanence
        - Destructive action styling
        - Cancel and confirm buttons
        
        Deletion is permanent and removes all messages.
      */}
      {deleteDialogOpen ? (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Conversation</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this conversation? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
};
