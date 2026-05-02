import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const SYSTEM_PROMPT = `You are VoteGuide AI — an expert, friendly assistant helping Indian citizens understand the election process.

You help with:
- How Indian elections work (Lok Sabha, Vidhan Sabha, local body elections)
- Step-by-step voting process
- Voter registration and Voter ID (EPIC card)
- Election Commission of India (ECI) rules
- Model Code of Conduct
- EVM (Electronic Voting Machine) usage
- Election timeline and phases
- Rights and duties of voters
- Common mistakes to avoid
- Voter eligibility criteria
- Amazing election facts and statistics
- Hindi language support

VOTER ELIGIBILITY CHECKER:
When asked about eligibility, ask these questions one by one:
1. Are you an Indian citizen?
2. How old are you?
3. Are you registered in the electoral roll?
Then give a clear YES/NO eligibility result with explanation.

ELECTION FACTS MODE:
Share amazing facts like:
- India has the world's largest democracy with 900+ million voters
- India uses EVMs since 1999 nationally
- Election Commission was established in 1950
- India conducts elections in multiple phases
- NOTA option was introduced in 2013
Always make facts engaging and surprising!

HINDI LANGUAGE SUPPORT:
If user writes in Hindi or asks for Hindi, respond completely in Hindi.
Use simple Hindi that everyone understands.
Example Hindi response style: "नमस्ते! मैं आपकी चुनाव प्रक्रिया समझने में मदद करूंगा।"

ROLES you adapt to:
- First-time voter: Be extra simple, encouraging, step-by-step
- Returning voter: Be concise, focus on updates and reminders
- Student: Be engaging, use examples
- Curious citizen: Be informative and detailed

SIMULATION MODE: When user asks for simulation, create real-life scenarios like:
"It's election morning. You wake up and realize you forgot where your polling booth is. What do you do?"
Give 3-4 options and guide based on their choice. Give feedback on wrong choices.

QUIZ MODE: Ask 1 question at a time. Give 4 options (A/B/C/D). After answer, explain why it's correct or wrong. Keep score.

RULES:
- Always be encouraging and positive
- Use simple Hindi words occasionally (like "Namaste", "धन्यवाद") to feel more Indian
- Use emojis to make responses friendly
- Always end with a follow-up question or options
- Reference ECI (www.eci.gov.in) when relevant
- Keep responses concise but complete`;

const QUICK_ACTIONS = [
  { icon: '🗳️', label: 'How to Vote', msg: 'Explain the step-by-step voting process in India' },
  { icon: '📋', label: 'Register to Vote', msg: 'How do I register as a voter and get my Voter ID?' },
  { icon: '📅', label: 'Election Timeline', msg: 'Explain the Indian election timeline and phases' },
  { icon: '🎮', label: 'Simulation', msg: 'Start a real-life voting simulation for me' },
  { icon: '🧪', label: 'Quiz Me', msg: 'Start an election quiz to test my knowledge' },
  { icon: '⚠️', label: 'Common Mistakes', msg: 'What are common mistakes voters make?' },
  { icon: '✅', label: 'Am I Eligible?', msg: 'How do I check if I am eligible to vote in India? What are the requirements?' },
  { icon: '📊', label: 'Election Facts', msg: 'Share some amazing and interesting facts and statistics about Indian elections' },
  { icon: '🌐', label: 'हिंदी में', msg: 'अब से हिंदी में जवाब दो। मुझे भारतीय चुनाव प्रक्रिया के बारे में बताओ।' },
];

export default function App() {
  const [role, setRole] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    const welcome = {
      role: 'assistant',
      content: `Namaste! 🙏 Welcome to **VoteGuide AI** — your personal Indian Election Assistant!

I see you're a **${selectedRole}**. I'll personalize my guidance just for you!

Here's what I can help you with:
🗳️ How elections work in India
📋 Voter registration & Voter ID
📅 Election timelines & phases
🎮 Real-life voting simulations
🧪 Quiz mode to test your knowledge
⚠️ Common mistakes to avoid

What would you like to explore today? You can click a quick action below or ask me anything! 👇`
    };
    setMessages([welcome]);
  };

  const sendMessage = async (text) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.REACT_APP_GROQ_API_KEY,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + `\n\nUser role: ${role}` },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ],
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response. Please try again.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: '❌ Error connecting to AI. Please check your API key.' }]);
    }

    setLoading(false);
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  if (!role) {
    return (
      <div className="onboarding">
        <div className="onboarding-card">
          <div className="flag-strip">
            <div className="flag-saffron"></div>
            <div className="flag-white">
              <div className="ashoka-chakra">⊕</div>
            </div>
            <div className="flag-green"></div>
          </div>
          <h1>🗳️ VoteGuide AI</h1>
          <p className="subtitle">Your Personal Indian Election Assistant</p>
          <p className="role-prompt">Who are you? Let me personalize your experience:</p>
          <div className="role-grid">
            {[
              { id: 'First-time Voter', icon: '🌟', desc: 'Never voted before' },
              { id: 'Returning Voter', icon: '✅', desc: 'Voted before, need updates' },
              { id: 'Student', icon: '🎓', desc: 'Learning about elections' },
              { id: 'Curious Citizen', icon: '🔍', desc: 'Just want to know more' },
            ].map(r => (
              <button key={r.id} className="role-card" onClick={() => selectRole(r.id)}>
                <span className="role-icon">{r.icon}</span>
                <span className="role-title">{r.id}</span>
                <span className="role-desc">{r.desc}</span>
              </button>
            ))}
          </div>
          <p className="powered-by">Powered by Claude AI 🤖</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="header-icon">🗳️</span>
          <div>
            <h1>VoteGuide AI</h1>
            <span className="header-sub">Indian Election Assistant</span>
          </div>
        </div>
        <button className="switch-role" onClick={() => { setRole(''); setMessages([]); }}>
          Switch Role
        </button>
      </header>

      <div className="chat-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="avatar">{msg.role === 'assistant' ? '🗳️' : '👤'}</div>
            <div
              className="bubble"
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
            />
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="avatar">🗳️</div>
            <div className="bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="quick-actions">
        {QUICK_ACTIONS.map((a, i) => (
          <button key={i} className="quick-btn" onClick={() => sendMessage(a.msg)}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Ask anything about Indian elections..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          {loading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}