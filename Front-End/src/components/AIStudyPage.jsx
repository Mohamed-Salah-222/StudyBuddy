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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 bg-gray-300 border-2 border-gray-800 text-gray-800" style={{ boxShadow: "4px 4px #323232" }}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gray-800 border-2 border-gray-800 flex items-center justify-center text-2xl text-white" style={{ boxShadow: "2px 2px #323232", borderRadius: "5px" }}>
              🤖
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "var(--font-DelaGothicOne)" }}>
                AI Study Buddy
              </h1>
              <p className="text-gray-600 text-lg font-semibold" style={{ fontFamily: "var(--font-SpaceMono)" }}>
                Your personal learning companion
              </p>
            </div>
          </div>
          <p className="text-gray-600 font-semibold max-w-2xl">Ask me anything about studying, learning techniques, or specific subjects. Let's make learning enjoyable together!</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-gray-100">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-md lg:max-w-lg px-6 py-4 border-2 border-gray-800 font-semibold ${message.sender === "user" ? "bg-white text-gray-800" : "bg-gray-300 text-gray-800"}`}
                style={{
                  boxShadow: "4px 4px #323232",
                  borderRadius: "5px",
                }}
              >
                <div className="flex items-start space-x-3">
                  {message.sender === "ai" && (
                    <div className="w-8 h-8 bg-gray-800 border-2 border-gray-800 flex items-center justify-center text-lg text-white mt-1" style={{ boxShadow: "1px 1px #323232", borderRadius: "5px" }}>
                      🤖
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-relaxed">{message.sender === "ai" ? <AIFormattedMessage text={message.text} /> : <span className="whitespace-pre-wrap">{message.text}</span>}</div>
                    <p className="text-xs mt-3 font-semibold text-gray-600">{message.timestamp}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-6 py-4 bg-gray-300 border-2 border-gray-800 max-w-xs" style={{ boxShadow: "4px 4px #323232", borderRadius: "5px" }}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 border-2 border-gray-800 flex items-center justify-center text-lg text-white" style={{ boxShadow: "1px 1px #323232", borderRadius: "5px" }}>
                    🤖
                  </div>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 bg-gray-800"
                        style={{
                          borderRadius: "5px",
                          animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-8 py-6 bg-gray-300 border-t-2 border-gray-800" style={{ boxShadow: "0 -2px #323232" }}>
          <div className="flex space-x-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your AI study buddy anything..."
                className="w-full border-2 border-gray-800 px-6 py-4 resize-none bg-white text-gray-800 font-semibold placeholder-gray-600"
                style={{
                  boxShadow: "2px 2px #323232",
                  borderRadius: "5px",
                  outline: "none",
                }}
                rows="2"
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 text-xs font-semibold text-gray-600">Press Enter to send</div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`px-8 py-4 font-bold transition-all duration-200 border-2 border-gray-800 ${!inputMessage.trim() || isLoading ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-white text-gray-800 hover:bg-gray-100"}`}
              style={{
                boxShadow: "2px 2px #323232",
                borderRadius: "5px",
              }}
              onMouseEnter={(e) => {
                if (!(!inputMessage.trim() || isLoading)) {
                  e.target.style.transform = "translate(-1px, -1px)";
                  e.target.style.boxShadow = "3px 3px #323232";
                }
              }}
              onMouseLeave={(e) => {
                if (!(!inputMessage.trim() || isLoading)) {
                  e.target.style.transform = "translate(0, 0)";
                  e.target.style.boxShadow = "2px 2px #323232";
                }
              }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 bg-gray-800"
                    style={{
                      borderRadius: "5px",
                      animation: "spin 1s linear infinite",
                    }}
                  />
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
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        textarea:focus {
          border-color: #2d8cf0 !important;
          box-shadow: 2px 2px #323232, 0 0 0 2px #2d8cf0 !important;
        }

        button:active:not(:disabled) {
          transform: translate(1px, 1px) !important;
          box-shadow: 1px 1px #323232 !important;
        }
      `}</style>
    </div>
  );
}
