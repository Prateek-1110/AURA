import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../api/AuthContext";
import Navbar from "../../components/Navbar";

const MOCK_CONVERSATIONS = [
  {
    id: 1, name: "Luminary Studio", role: "creator", avatar: "L",
    lastMessage: "Looking forward to seeing you on Saturday!", time: "2m", unread: 2,
    messages: [
      { id: 1, from: "them", text: "Hi! Your booking for Balayage is confirmed for Saturday at 3 PM.", time: "10:30 AM" },
      { id: 2, from: "me", text: "Great! Should I come with dry or washed hair?", time: "10:45 AM" },
      { id: 3, from: "them", text: "Please come with dry, unwashed hair for best results 😊", time: "11:00 AM" },
      { id: 4, from: "them", text: "Looking forward to seeing you on Saturday!", time: "11:01 AM" },
    ],
  },
  {
    id: 2, name: "The Mane Club", role: "creator", avatar: "T",
    lastMessage: "We have slots available next week.", time: "1h", unread: 0,
    messages: [
      { id: 1, from: "me", text: "Do you have availability for a keratin treatment next week?", time: "Yesterday" },
      { id: 2, from: "them", text: "We have slots available next week.", time: "Yesterday" },
    ],
  },
  {
    id: 3, name: "Meera (Customer)", role: "customer", avatar: "M",
    lastMessage: "Can you accommodate a 4 PM slot?", time: "3h", unread: 1,
    messages: [
      { id: 1, from: "them", text: "Hi, I saw your portfolio on AURA. Your balayage work is stunning!", time: "2:00 PM" },
      { id: 2, from: "me", text: "Thank you so much! Would love to do your hair. When works for you?", time: "2:30 PM" },
      { id: 3, from: "them", text: "Can you accommodate a 4 PM slot?", time: "3:00 PM" },
    ],
  },
];

function formatTime(time) { return time; }

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const messages = activeConv ? activeConv.messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim() || !activeConvId) return;
    const currentInput = input.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = { id: Date.now(), from: "me", text: currentInput, time: timeStr };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: currentInput,
          time: "Just now",
          unread: 0
        };
      }
      return c;
    }));
    setInput("");

    // Simulate an automatic realistic reply after 1.5 seconds!
    const replies = [
      "Thanks! Let me check the schedule and get back to you in a few minutes.",
      "Sounds good! We will be ready for you. See you soon!",
      "Perfect! Let me know if you need to adjust the time.",
      "Yes, we can accommodate that. Let me lock in the slot.",
      "That works perfectly for us! See you then."
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    setTimeout(() => {
      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const replyMessage = { id: Date.now() + 1, from: "them", text: randomReply, time: replyTime };
          return {
            ...c,
            messages: [...c.messages, replyMessage],
            lastMessage: replyMessage.text,
            time: "Just now"
          };
        }
        return c;
      }));
    }, 1500);
  }

  const relevantConvs = user?.role === "creator"
    ? conversations.filter(c => c.role === "customer")
    : conversations.filter(c => c.role === "creator");

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-5 pt-6 flex-shrink-0">
        <Link to={user?.role === "creator" ? "/creator/dashboard" : "/customer/dashboard"} className="text-xs text-gray-400 hover:text-charcoal transition inline-block">
          ← Back to Dashboard
        </Link>
      </div>
      <div className="max-w-5xl mx-auto w-full px-0 sm:px-5 sm:pb-6 sm:pt-2 flex-1 flex">
        <div className="flex flex-1 bg-white sm:rounded-2xl sm:border border-gray-100 sm:shadow-sm overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>

          {/* Conversations list */}
          <div className={`w-full sm:w-72 border-r border-gray-100 flex flex-col flex-shrink-0 ${activeConv ? "hidden sm:flex" : "flex"}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-charcoal text-sm">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {relevantConvs.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No conversations yet.</div>
              ) : (
                relevantConvs.map(conv => (
                  <button key={conv.id} onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 border-b border-gray-50 hover:bg-cream transition ${
                      activeConv?.id === conv.id ? "bg-burgundy/5" : ""
                    }`}>
                    <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-charcoal truncate">{conv.name}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{conv.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 bg-burgundy text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          {activeConv ? (
            <div className="flex-1 flex flex-col">
              {/* Chat header */}
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setActiveConvId(null)} className="sm:hidden text-gray-400 hover:text-charcoal mr-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {activeConv.avatar}
                </div>
                <div>
                  <p className="font-semibold text-charcoal text-sm">{activeConv.name}</p>
                  <p className="text-xs text-teal-500">● Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.from === "me"
                        ? "bg-burgundy text-white rounded-br-md"
                        : "bg-gray-100 text-charcoal rounded-bl-md"
                    }`}>
                      <p>{m.text}</p>
                      <p className={`text-xs mt-1 ${m.from === "me" ? "text-white/60" : "text-gray-400"}`}>{formatTime(m.time)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-burgundy transition" />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="w-10 h-10 bg-burgundy text-white rounded-xl flex items-center justify-center hover:bg-burgundy-dark transition disabled:opacity-40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex flex-1 items-center justify-center text-center">
              <div>
                <p className="text-4xl mb-3">💬</p>
                <p className="font-display text-xl text-charcoal mb-1">Select a conversation</p>
                <p className="text-sm text-gray-400">Choose from your messages on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
