import React, { useState } from 'react';
import { msalInstance, loginRequest } from '../authConfig';
import MessageBubble from './MessageBubble';
import ChartView from './ChartView';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [chartType, setChartType] = useState(null);
  const [chartData, setChartData] = useState(null);

  const sendQuery = async () => {
    if (!query) return;
    // Append user message to chat
    const newMessages = [...messages, { sender: "user", text: query }];
    setMessages(newMessages);
    setQuery("");  // clear input

    // Call backend API
    try {
      // Ensure we have a valid token
      const account = msalInstance.getAllAccounts()[0];
      const resp = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
      const token = resp.accessToken;
      const res = await fetch("<YOUR_FUNCTION_APP_URL>/query", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: query })
      });
      const data = await res.json();
      if (!res.ok) {
        // handle error from API
        throw new Error(data.detail || "Query failed");
      }
      // Append assistant message (could be a textual response or confirmation)
      setMessages(prev => [...prev, { sender: "assistant", text: "Query executed. Rendering results..." }]);
      // Store chart data and suggestions
      setChartData({ columns: data.columns, rows: data.rows });
      if (data.chartSuggestions && data.chartSuggestions.length > 0) {
        setChartType(data.chartSuggestions[0]);  // default to first suggestion
      }
    } catch (err) {
      console.error("Error querying API:", err);
      setMessages(prev => [...prev, { sender: "assistant", text: "Sorry, I couldn't process that query." }]);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} sender={msg.sender} text={msg.text} />
        ))}
      </div>
      {chartData && (
        <div className="chart-section">
          {/* Dropdown to select chart type if multiple suggestions */}
          {chartData && (
            <div>
              <label>Choose chart type:</label>
              <select value={chartType || ""} onChange={e => setChartType(e.target.value)}>
                {/* Include AI suggestion and other common chart options */}
                {chartType && !data.chartSuggestions.includes(chartType) && 
                  <option value={chartType}>{chartType}</option>}
                {data.chartSuggestions.map(type => (
                  <option key={type} value={type}>{type} (suggested)</option>
                ))}
                <option value="table">Table</option>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
              </select>
            </div>
          )}
          <ChartView data={chartData} chartType={chartType || "table"} />
        </div>
      )}
      <div className="input-bar">
        <input 
          type="text" 
          placeholder="Ask a question about the data..." 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
        />
        <button onClick={sendQuery}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;