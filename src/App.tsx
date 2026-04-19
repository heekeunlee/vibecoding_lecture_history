import { useState } from 'react';
import { Book, Calendar, Search, Shield, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import historyData from './data/history.json';

interface Message {
  role: string;
  content: string;
  logs?: {
    action: string;
    details: string;
    diff?: string;
    artifact?: string;
    artifact_content?: string;
  }[];
}

interface Conversation {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? true : false;
  });
  const [password, setPassword] = useState('');
  const [conversations] = useState<Conversation[]>(historyData);
  const [activeId, setActiveId] = useState<string>(historyData[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const activeConversation = conversations.find(c => c.id === activeId);

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--bg-tertiary)', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        >
          <Lock size={48} style={{ margin: '0 auto 1.5rem auto', color: 'var(--accent-primary)' }} />
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 600 }}>Access Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Please enter the 4-digit PIN to access</p>
          <input 
            type="password" 
            maxLength={4}
            placeholder="••••"
            value={password}
            onChange={(e) => {
              const val = e.target.value;
              setPassword(val);
              if(val === '1234') {
                setTimeout(() => setIsAuthenticated(true), 200);
              }
            }}
            autoFocus
            style={{
              fontSize: '2rem',
              letterSpacing: '0.8rem',
              textAlign: 'center',
              width: '160px',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '2px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Vibe Logbook</h1>
          <div style={{ marginTop: '1rem', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div className="conversation-list">
          {filteredConversations.map((conv) => (
            <div 
              key={conv.id}
              className={`conversation-item ${activeId === conv.id ? 'active' : ''}`}
              onClick={() => setActiveId(conv.id)}
            >
              <div className="conversation-item-title">{conv.title}</div>
              <div className="conversation-item-date">
                <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {conv.date}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={14} />
          <span>Vibe Coding Authored</span>
        </div>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeConversation ? (
            <motion.div 
              key={activeConversation.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="chat-view"
            >
              <div style={{ maxWidth: '900px', margin: '0 auto 3rem auto' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{activeConversation.title}</h2>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>{activeConversation.date}</span>
                  <span>•</span>
                  <span>{activeConversation.messages.length} messages</span>
                </div>
              </div>

              <div className="message-group">
                {activeConversation.messages.map((msg, idx) => (
                  <div key={idx} className={`message role-${msg.role}`}>
                    <div className="message-header">
                      <div className="role-badge">{msg.role}</div>
                    </div>
                    <div className="message-content">
                      <div className="markdown-content">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {msg.logs && msg.logs.length > 0 && (
                        <div className="technical-logs">
                          <div className="logs-header">
                            <Shield size={14} />
                            <span>Blackbox: Technical Step Log</span>
                          </div>
                          <div className="logs-body">
                            {msg.logs.map((log, lidx) => (
                              <div key={lidx} className="log-entry">
                                <div className="log-action">{log.action}</div>
                                <div className="log-details">{log.details}</div>
                                {log.artifact && (
                                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
                                    📦 Artifact: {log.artifact}
                                  </div>
                                )}
                                {log.artifact_content && (
                                  <pre className="log-diff" style={{ color: '#8be9fd' }}>
                                    <code>{log.artifact_content}</code>
                                  </pre>
                                )}
                                {log.diff && (
                                  <pre className="log-diff">
                                    <code>{log.diff}</code>
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="empty-state">
              <Book size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
              <h2>No conversation selected</h2>
              <p>Select a history log from the sidebar to view details.</p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
