import { useState } from "react";


function AIFormattedMessage({ text }) {
  const formatAIMessage = (text) => {

    const processBoldText = (str) => {

      return str.split(/(\*[^*]+\*)/).map((part, index) => {
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          const boldText = part.slice(1, -1);
          return (
            <strong key={index} className="font-bold" style={{ color: "#2d5016" }}>
              {boldText}
            </strong>
          );
        }
        return part;
      });
    };


    const lines = text.split("\n").filter((line) => line.trim() !== "");

    return lines.map((line, index) => {
      const trimmedLine = line.trim();


      if (!trimmedLine) return null;


      if (trimmedLine.endsWith(":") && trimmedLine.length < 60 && !trimmedLine.includes("?")) {
        return (
          <div key={index} className="mb-4 mt-5 first:mt-0">
            <h4 className="font-bold text-base border-l-4 pl-3 py-1" style={{ color: "#2d5016", borderColor: "#84a98c" }}>
              {processBoldText(trimmedLine)}
            </h4>
          </div>
        );
      }

      const numberedMatch = trimmedLine.match(/^(\d+\.)\s+(.+)/);
      if (numberedMatch) {
        return (
          <div key={index} className="flex items-start space-x-3 mb-3 ml-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: "#84a98c" }}>
              {numberedMatch[1].replace(".", "")}
            </div>
            <div className="text-sm leading-relaxed flex-1">{processBoldText(numberedMatch[2])}</div>
          </div>
        );
      }


      const bulletMatch = trimmedLine.match(/^[-•*]\s+(.+)/);
      if (bulletMatch) {
        return (
          <div key={index} className="flex items-start space-x-3 mb-3 ml-2">
            <div className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0" style={{ backgroundColor: "#d4a574" }}></div>
            <div className="text-sm leading-relaxed flex-1">{processBoldText(bulletMatch[1])}</div>
          </div>
        );
      }

      if (trimmedLine.endsWith("?")) {
        return (
          <div
            key={index}
            className="mb-4 p-4 rounded-lg border-l-4 shadow-sm"
            style={{
              backgroundColor: "#fefcf7",
              borderColor: "#d4a574",
            }}
          >
            <div className="flex items-start space-x-2">
              <span className="text-lg">❓</span>
              <span className="text-sm font-medium flex-1">{processBoldText(trimmedLine)}</span>
            </div>
          </div>
        );
      }


      if (trimmedLine.includes("()") || trimmedLine.includes("{}") || trimmedLine.includes("function") || trimmedLine.includes("const ") || trimmedLine.includes("import ") || trimmedLine.includes("</") || trimmedLine.includes("```")) {
        return (
          <div
            key={index}
            className="mb-4 p-4 rounded-lg font-mono text-sm border border-opacity-30 shadow-sm"
            style={{
              backgroundColor: "#f8f6f0",
              borderColor: "#84a98c",
              color: "#2d5016",
            }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold opacity-60">CODE</span>
            </div>
            {trimmedLine}
          </div>
        );
      }

      const noteMatch = trimmedLine.match(/^(Note|Tip|Remember|Important|Warning|Alert):\s*(.+)/i);
      if (noteMatch) {
        const noteType = noteMatch[1].toLowerCase();
        const noteContent = noteMatch[2];
        const noteIcons = {
          note: "📝",
          tip: "💡",
          remember: "🧠",
          important: "⚠️",
          warning: "🚨",
          alert: "🔔",
        };

        return (
          <div
            key={index}
            className="mb-4 p-4 rounded-lg border-2 border-opacity-30"
            style={{
              backgroundColor: "#fefcf7",
              borderColor: "#d4a574",
            }}
          >
            <div className="flex items-start space-x-3">
              <span className="text-lg">{noteIcons[noteType] || "📝"}</span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider" style={{ color: "#d4a574" }}>
                  {noteMatch[1]}
                </span>
                <div className="text-sm mt-1 leading-relaxed">{processBoldText(noteContent)}</div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div key={index} className="mb-4 leading-relaxed">
          <span className="text-sm">{processBoldText(trimmedLine)}</span>
        </div>
      );
    });
  };

  return <div className="space-y-1">{formatAIMessage(text)}</div>;
}

export default function AIStudyPage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const getAIResponse = async (userMessage) => {
    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        text: msg.text,
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat-gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponseText = await getAIResponse(inputMessage);

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again!",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <div className="max-w-5xl mx-auto h-screen flex flex-col">

        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div
            className="relative px-8 py-6 text-white shadow-xl"
            style={{
              background: `linear-gradient(135deg, #52796f 0%, #84a98c 50%, #52796f 100%)`,
            }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg">🤖</div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Study Buddy</h1>
                <p className="text-white/90 text-lg font-medium">Your personal learning companion</p>
              </div>
            </div>
            <p className="text-white/80 max-w-2xl leading-relaxed">Ask me anything about studying, learning techniques, or specific subjects. Let's make learning enjoyable together!</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6" style={{ backgroundColor: "#fefcf7" }}>
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
              <div
                className={`max-w-md lg:max-w-lg px-6 py-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${message.sender === "user" ? "rounded-br-md" : "rounded-bl-md border-2 border-opacity-20"}`}
                style={{
                  backgroundColor: message.sender === "user" ? "#52796f" : "#f8f6f0",
                  color: message.sender === "user" ? "white" : "#2d5016",
                  borderColor: message.sender === "ai" ? "#84a98c" : "transparent",
                }}
              >
                <div className="flex items-start space-x-3">
                  {message.sender === "ai" && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm mt-1" style={{ backgroundColor: "#84a98c", color: "white" }}>
                      🤖
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-relaxed font-medium">{message.sender === "ai" ? <AIFormattedMessage text={message.text} /> : <span className="whitespace-pre-wrap">{message.text}</span>}</div>
                    <p
                      className={`text-xs mt-3 font-medium ${message.sender === "user" ? "text-white/70" : ""}`}
                      style={{
                        color: message.sender === "user" ? "rgba(255,255,255,0.7)" : "#6b7280",
                      }}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="px-6 py-4 rounded-2xl rounded-bl-md shadow-sm border-2 border-opacity-20 max-w-xs" style={{ backgroundColor: "#f8f6f0", borderColor: "#84a98c" }}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm" style={{ backgroundColor: "#84a98c", color: "white" }}>
                    🤖
                  </div>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full animate-bounce"
                        style={{
                          backgroundColor: "#84a98c",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className="px-8 py-6 border-t-2 border-opacity-20 backdrop-blur-sm"
          style={{
            backgroundColor: "#fefcf7",
            borderColor: "#84a98c",
          }}
        >
          <div className="flex space-x-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your AI study buddy anything..."
                className="w-full border-2 border-opacity-30 rounded-2xl px-6 py-4 resize-none focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all duration-200 font-medium placeholder-opacity-60 shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: "#f8f6f0",
                  borderColor: "#84a98c",
                  color: "#2d5016",
                  focusRingColor: "#52796f",
                }}
                rows="2"
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 text-xs font-medium opacity-50" style={{ color: "#6b7280" }}>
                Press Enter to send
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none disabled:hover:shadow-sm ${!inputMessage.trim() || isLoading ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5"}`}
              style={{
                backgroundColor: !inputMessage.trim() || isLoading ? "#6b7280" : "#52796f",
                color: "white",
              }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Send</span>
                  <span className="text-lg">📤</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        textarea:focus {
          ring-color: #52796f !important;
          border-color: #52796f !important;
        }
      `}</style>
    </div>
  );
}
