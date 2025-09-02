import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { postMessage, getRepositoryMessages } from '../utils/userActions';
import { useAuth } from '../context/AuthContext';
import { client } from '../lib/appwrite';
import { DATABASES_ID, MESSAGES_COLLECTION_ID } from '../lib/appwrite';
import { ID } from 'appwrite';
import { recordUserActivity, startUserPresence, stopUserPresence } from '../utils/realtimeUtils';

function RepoChat({ repoId, repoName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [subscription, setSubscription] = useState(null);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const messagesData = await getRepositoryMessages(repoId);
        setMessages(messagesData);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setError('Failed to load chat messages');
      } finally {
        setLoading(false);
      }
    };

    if (repoId) {
      fetchMessages();
    }

    return () => {
      // Clean up subscription when component unmounts
      if (subscription) {
        subscription();
      }
    };
  }, [repoId, subscription]);

  // Set up realtime subscription with database
  useEffect(() => {
    if (!repoId) return;
    
    // Subscribe to changes in the messages collection for this repo
    const unsubscribe = client.subscribe(
      `databases.${DATABASES_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
      (response) => {
        // Get event type and payload
        const eventType = response.events[0];
        const payload = response.payload;
        
        // Only process events for this repo's messages
        if (payload.repoId === repoId) {
          console.log('Database real-time event received:', eventType, payload);
          
          if (eventType.includes('documents.*.create')) {
            // Add new message to the list
            setMessages(prevMessages => {
              // Check if message already exists to avoid duplicates
              const exists = prevMessages.some(msg => msg.$id === payload.$id);
              if (!exists) {
                return [...prevMessages, payload];
              }
              return prevMessages;
            });
          } 
          else if (eventType.includes('documents.*.update')) {
            // Update existing message
            setMessages(prevMessages => 
              prevMessages.map(msg => msg.$id === payload.$id ? payload : msg)
            );
          }
          else if (eventType.includes('documents.*.delete')) {
            // Remove deleted message
            setMessages(prevMessages => 
              prevMessages.filter(msg => msg.$id !== payload.$id)
            );
          }
        }
      }
    );
    
    setSubscription(() => unsubscribe);

    // Clean up subscription when component unmounts or repoId changes
    return () => {
      unsubscribe();
    };
  }, [repoId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Set up user presence tracking
  useEffect(() => {
    if (!repoId || !user) return;
    
    // Start tracking presence for this user in this repo
    startUserPresence(repoId, user.$id, user.name, user.email);
    
    // Clean up presence tracking when component unmounts
    return () => {
      stopUserPresence();
    };
  }, [repoId, user]);
  
  // Handle user typing indicator
  const handleTyping = () => {
    if (!user || !repoId) return;
    
    // Record activity with typing flag
    recordUserActivity(repoId, user.$id, user.name, user.email);
    
    // Clear existing timeout if any
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing status
    setTyping(true);
    
    // Clear typing status after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    try {
      const messageText = newMessage.trim();
      
      // Show optimistic UI update by adding temporary message immediately
      const tempId = ID.unique();
      const tempMessage = {
        $id: tempId,
        userId: user.$id,
        repoId: repoId,
        text: messageText,
        createdAt: new Date().toISOString(),
        isOptimistic: true, // Flag to identify optimistic updates
        status: 'sending',
        userName: user.name || 'User',
        userEmail: user.email || ''
      };
      
      // Add to local state immediately for better UX
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setNewMessage('');
      
      // Track message sending
      console.log('Sending message:', tempMessage);
      
      // Send message using the postMessage function that uses Appwrite Database
      const sentMessage = await postMessage(user.$id, repoId, messageText);
      console.log('Message sent successfully:', sentMessage);
      
      // Update the optimistic message with the actual message ID
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.isOptimistic && msg.$id === tempId
            ? { ...msg, isOptimistic: false, status: 'sent', $id: sentMessage.$id }
            : msg
        )
      );
      
      // Note: The actual message will come through the subscription
      // and any further updates will be handled there
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Update the optimistic message to show error
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.isOptimistic 
            ? { ...msg, status: 'error' }
            : msg
        )
      );
    }
  };

  // Group messages by date for display
  const groupedMessages = () => {
    const groups = [];
    let currentDate = null;
    
    messages.forEach(msg => {
      const messageDate = new Date(msg.createdAt);
      const formattedDate = messageDate.toLocaleDateString();
      
      // Check if this is a new date group
      if (formattedDate !== currentDate) {
        currentDate = formattedDate;
        groups.push({ type: 'date', date: formattedDate });
      }
      
      groups.push({ type: 'message', ...msg });
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] rounded-xl backdrop-blur-lg bg-white/30 shadow-lg border border-white/20 p-6 flex items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-t-[#FD366E] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="h-12 w-12 absolute top-0 rounded-full border-2 border-t-transparent border-r-[#FD366E] border-b-transparent border-l-transparent animate-spin" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-[#FD366E] animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-xl backdrop-blur-lg bg-white/30 shadow-lg border border-red-200/30 p-6 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Something went wrong</h3>
          <p className="text-gray-600 mt-1">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full rounded-2xl backdrop-blur-xl bg-black/20 shadow-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#f02e65]/10 to-[#2de0c0]/10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] rounded-xl flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              {repoName || 'Repository Chat'}
            </h2>
            <p className="text-sm text-gray-400 mt-1 ml-11">
              Discuss issues and collaborate with other contributors
            </p>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="p-6 h-96 overflow-y-auto bg-black/10 backdrop-blur-sm"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f02e65]/20 flex items-center justify-center mb-4 border border-[#f02e65]/30">
              <MessageCircle size={32} className="text-[#f02e65]" />
            </div>
            <p className="text-gray-300 text-center font-medium mb-2">
              No messages yet
            </p>
            <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
              Be the first to start a conversation about this repository
            </p>
            {user ? (
              <button 
                onClick={() => document.getElementById('message-input').focus()} 
                className="px-4 py-2 bg-[#FD366E] hover:bg-[#E8245C] text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start the discussion
              </button>
            ) : (
              <p className="text-sm text-gray-500">Sign in to join the conversation</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {groupedMessages().map((item, index) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${index}`} className="flex justify-center my-4">
                    <div className="px-3 py-1 rounded-full bg-gray-700 text-xs text-gray-300 border border-gray-600">
                      {new Date(item.date).toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                );
              }
              
              // For message items
              const msg = item;
              const isCurrentUser = user && msg.userId === user.$id;
              
              return (
                <div 
                  key={msg.$id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] ${isCurrentUser 
                      ? 'bg-[#FD366E]/10 rounded-t-2xl rounded-bl-2xl' 
                      : 'bg-white/50 rounded-t-2xl rounded-br-2xl'} 
                      px-4 py-3 shadow-sm backdrop-blur-sm border ${isCurrentUser 
                        ? 'border-[#FD366E]/10' 
                        : 'border-white/50'}`}
                  >
                    <div className="flex items-center mb-1">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                          isCurrentUser ? 'bg-[#FD366E]' : 'bg-gray-500'
                        }`}
                      >
                        {(msg.userName || 'U').charAt(0)}
                      </div>
                      <span className="text-xs font-medium ml-2">
                        {msg.userName || 'User'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {/* Message status indicators */}
                      {isCurrentUser && (
                        <>
                          {msg.status === 'sending' && (
                            <span className="ml-1 text-gray-400" title="Sending">
                              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </span>
                          )}
                          
                          {msg.status === 'sent' && (
                            <span className="ml-1 text-green-500" title="Delivered">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                          
                          {msg.status === 'error' && (
                            <span className="ml-1 text-red-500" title="Failed to send">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <p className="break-words text-sm">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800 backdrop-blur-md">
        <form className="space-y-2">
          <div className="flex items-center gap-3 pl-1">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-r from-[#f02e65] to-[#ff6b9d]"
              title={user.email || 'User'}
            >
              {(user.name || 'U').charAt(0)}
            </div>
            <div className="text-sm">
              <p className="font-medium text-white">{user.name || 'User'}</p>
              <p className="text-xs text-gray-400">{user.email || ''}</p>
            </div>
          </div>
          <div className="relative">
            <input
              id="message-input"
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (newMessage.trim()) handleSubmit(e);
                }
                handleTyping();
              }}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-[#f02e65]/50 focus:border-[#f02e65] transition-all outline-none text-white placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                newMessage.trim() 
                  ? 'bg-gradient-to-r from-[#f02e65] to-[#ff6b9d] text-white hover:shadow-lg hover:shadow-[#f02e65]/25' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400 px-1">
            <span>Press Enter to send</span>
          </div>
        </form>
      </div>

      {/* Add glassmorphism styles */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </motion.div>
  );
}

export default RepoChat;
