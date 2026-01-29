import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import UserDetail from './components/UserDetail'
import CallInterface from './components/CallInterface'
import AddContactModal from './components/AddContactModal'
import Recovery from './components/Auth/Recovery'
import Feed from './components/Feed'
import Settings from './components/Settings'
import Calls from './components/Calls'
import NavRail from './components/NavRail'
import CreateGroupModal from './components/CreateGroupModal'
import './App.css'
import API_URL from './config'

const socket = io(API_URL)

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (!parsed.id && parsed._id) parsed.id = parsed._id;
      return parsed;
    }
    return null;
  })
  const [authMode, setAuthMode] = useState('login')
  const [showSettings, setShowSettings] = useState(false)
  const [selectedProfileUser, setSelectedProfileUser] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  const [mutedContacts, setMutedContacts] = useState([])
  const [blockedContacts, setBlockedContacts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)

  // Mobile responsiveness states
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mobileView, setMobileView] = useState('list') // 'list' or 'chat'

  const [contacts, setContacts] = useState([])
  const [activeContact, setActiveContact] = useState(null)
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'chats')
  const [messages, setMessages] = useState({})

  // Group Chat States
  const [groups, setGroups] = useState([])
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)

    if (currentUser?.id) {
      socket.emit('join', currentUser.id)
      fetchContacts()
      fetchGroups()
      // Apply theme and font size
      document.body.className = `theme-${currentUser.settings?.chat?.theme || 'light'} font-${currentUser.settings?.chat?.fontSize || 'medium'}`;
    }

    socket.on('receive_message', (data) => {
      // If message is from currently active chat, show it
      if (activeContact && (data.senderId === activeContact.id)) {
        setMessages((prev) => ({
          ...prev,
          [activeContact.id]: [...(prev[activeContact.id] || []), { sender: 'other', text: data.text, time: data.time }]
        }))
      }
      // Refresh contacts/groups to show last message update
      fetchContacts()
      fetchGroups() // Also refresh groups in case of group messages
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      socket.off('receive_message')
    }
  }, [currentUser?.id, activeContact?.id])

  const fetchContacts = async () => {
    if (!currentUser?.id) return
    try {
      const response = await fetch(`${API_URL}/contacts/${currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (err) {
      console.error('Fetch contacts error:', err)
    }
  }

  const fetchGroups = async () => {
    if (!currentUser?.id) return
    try {
      const response = await fetch(`${API_URL}/groups/user/${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);

        // Join socket rooms for groups
        data.forEach(group => {
          socket.emit('join', group._id);
        });
      }
    } catch (err) {
      console.error('Fetch groups error:', err);
    }
  };

  const handleCreateGroup = (newGroup) => {
    setGroups(prev => [...prev, newGroup]);
    socket.emit('join', newGroup._id); // Join the new group room
    setActiveContact({
      id: newGroup._id,
      name: newGroup.name,
      avatar: newGroup.icon || '👥',
      isGroup: true,
      admins: newGroup.admins,
      members: newGroup.members
    });
    setShowCreateGroupModal(false);
  };

  const fetchMessages = async (contactId, isGroup = false) => {
    try {
      const endpoint = isGroup
        ? `${API_URL}/groups/${contactId}/messages`
        : `${API_URL}/messages/${currentUser.id}/${contactId}`;

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setMessages(prev => ({ ...prev, [contactId]: data }))
      }
    } catch (err) {
      console.error('Fetch messages error:', err)
    }
  }

  const handleSendMessage = (text) => {
    if (!activeContact) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMessage = {
      senderId: currentUser.id,
      text,
      time
    };

    if (activeContact.isGroup) {
      newMessage.groupId = activeContact.id;
      // No receiverId for groups
    } else {
      newMessage.receiverId = activeContact.id;
    }

    socket.emit('send_message', newMessage)

    // For groups, we wait for socket to reflect back or we can optimistic update if careful
    // For now, optimistic update for better UX, similar to 1-on-1
    setMessages((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), {
        sender: 'me',
        text,
        time,
        // For groups, we might want to show our own name? Usually 'me' is fine for UI logic
      }]
    }))

    // Optimistic UI for last message in sidebar
    if (activeContact.isGroup) {
      setGroups(prev => prev.map(g =>
        g._id === activeContact.id ? { ...g, lastMessage: { text, sender: currentUser.id } } : g
      ));
    } else {
      setContacts(prev => prev.map(c =>
        c.id === activeContact.id ? { ...c, lastMessage: text, time: 'Just now' } : c
      ));
    }
  }

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (response.ok) {
        const user = data.user;
        if (!user.id && user._id) user.id = user._id; // Normalize ID
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Failed to connect to server: ' + err.message);
    }
  }

  const handleRegister = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (response.ok) {
        // Auto login on successful registration
        const user = data.user;
        if (!user.id && user._id) user.id = user._id;
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Failed to connect to server: ' + err.message);
    }
  }

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await fetch(`${API_URL}/users/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        const freshUser = await response.json();
        setCurrentUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  }

  const handleUpdateSettings = async (newSettings) => {
    try {
      const response = await fetch(`${API_URL}/users/${currentUser.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      if (response.ok) {
        const freshUser = await response.json();
        setCurrentUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        // Apply theme/font immediately
        document.body.className = `theme-${newSettings.chat.theme} font-${newSettings.chat.fontSize}`;
      }
    } catch (err) {
      console.error('Update settings error:', err);
    }
  }

  const handleClearChats = async () => {
    if (window.confirm('Are you sure you want to delete ALL messages? This cannot be undone.')) {
      try {
        const response = await fetch(`${API_URL}/messages/clear/${currentUser.id}`, { method: 'DELETE' });
        if (response.ok) {
          setMessages({});
          alert('All chat history cleared!');
        }
      } catch (err) {
        console.error('Clear chats error:', err);
      }
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('user')
    setAuthMode('login')
    setShowSettings(false)
    setSelectedProfileUser(null)
    setActiveCall(null)
    setContacts([])
    setMessages({})
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/account/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username })
      });
      if (response.ok) {
        handleLogout();
        alert('Account deleted successfully. You can now register again with the same phone number.');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete account');
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
  }

  const handleCall = (user, type) => {
    setActiveCall({ user, type })
    setSelectedProfileUser(null)
  }

  const handleMute = (contactId) => {
    setMutedContacts(prev =>
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    )
  }

  const handleClearChat = (contactId) => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
      // In a real app, you'd add a DELETE messages endpoint
      setMessages(prev => ({ ...prev, [contactId]: [] }))
    }
  }

  const handleBlock = (contactId) => {
    const isBlocked = blockedContacts.includes(contactId)
    if (isBlocked) {
      setBlockedContacts(prev => prev.filter(id => id !== contactId))
    } else {
      if (window.confirm('Block this contact? You will no longer receive messages from them.')) {
        setBlockedContacts(prev => [...prev, contactId])
      }
    }
  }

  const handleArchiveChat = async (contact) => {
    try {
      const response = await fetch(`${API_URL}/users/${currentUser.id}/chat/${contact.id}/archive`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        // Optimistic or Refetch
        fetchContacts();
        fetchGroups(); // Just easier to refetch all
      }
    } catch (err) {
      console.error('Archive error:', err);
    }
  };

  const handleStarChat = async (contact) => {
    try {
      const response = await fetch(`${API_URL}/users/${currentUser.id}/chat/${contact.id}/star`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        fetchContacts();
        fetchGroups();
      }
    } catch (err) {
      console.error('Star error:', err);
    }
  };

  const handleNewChat = () => {
    setShowAddModal(true)
  }

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    fetchMessages(contact.id);
    if (isMobile) setMobileView('chat');
  }

  const handleAddContact = async (user) => {
    try {
      const response = await fetch(`${API_URL}/contacts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, contactId: user.id })
      })
      if (response.ok) {
        fetchContacts()
        handleSelectContact(user)
        setShowAddModal(false)
      }
    } catch (err) {
      console.error('Add contact error:', err)
    }
  }

  if (!currentUser) {
    if (authMode === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthMode('register')}
          onForgotPassword={() => setAuthMode('recovery')}
        />
      )
    } else if (authMode === 'register') {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      )
    } else {
      return (
        <Recovery
          onSwitchToLogin={() => setAuthMode('login')}
        />
      )
    }
  }

  if (activeCall) {
    return (
      <CallInterface
        user={activeCall.user}
        callType={activeCall.type}
        onEndCall={() => setActiveCall(null)}
      />
    )
  }

  if (showSettings) {
    return (
      <Settings
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onUpdateSettings={handleUpdateSettings}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        onClearChats={handleClearChats}
        onBack={() => setShowSettings(false)}
      />
    )
  }

  if (selectedProfileUser) {
    return (
      <UserDetail
        user={selectedProfileUser}
        onBack={() => setSelectedProfileUser(null)}
        onCall={handleCall}
      />
    )
  }

  return (
    <div className={`whatsapp-layout ${isMobile ? 'mobile' : ''}`}>
      {!isMobile && (
        <NavRail
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'settings') setShowSettings(true);
            else {
              setActiveTab(tab);
              if (tab !== 'chats') setActiveContact(null);
            }
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onProfileClick={() => setSelectedProfileUser(currentUser)}
          groups={groups}
          onGroupClick={(group) => {
            setActiveContact({
              id: group._id,
              name: group.name,
              avatar: group.icon || '👥',
              isGroup: true,
              members: group.members
            });
            setActiveTab(`group-${group._id}`);
            fetchMessages(group._id, true);
          }}
          onCreateGroup={() => setShowCreateGroupModal(true)}
        />
      )}

      {activeTab === 'chats' && (
        <>
          {(!isMobile || mobileView === 'list') && (
            <Sidebar
              contacts={contacts}
              activeContact={activeContact}
              onSelectContact={handleSelectContact}
              currentUser={currentUser}
              onNewChat={() => setShowAddModal(true)}
              activeTab={activeTab}
              mutedContacts={mutedContacts}
              blockedContacts={blockedContacts}
              onArchiveChat={handleArchiveChat}
              onStarChat={handleStarChat}
            />
          )}

          {(!isMobile || mobileView === 'chat') && (
            <div className="main-content-wa">
              {activeContact ? (
                <ChatWindow
                  activeContact={activeContact}
                  messages={messages[activeContact.id] || []}
                  onSendMessage={handleSendMessage}
                  onShowUserProfile={setSelectedProfileUser}
                  onCall={handleCall}
                  onMute={() => handleMute(activeContact.id)}
                  onClearChat={() => handleClearChat(activeContact.id)}
                  onBlock={() => handleBlock(activeContact.id)}
                  onBack={() => setMobileView('list')}
                  isMuted={mutedContacts.includes(activeContact.id)}
                  isBlocked={blockedContacts.includes(activeContact.id)}
                  isMobile={isMobile}
                  wallpaper={currentUser.settings?.chat?.wallpaper || 'default'}
                />
              ) : (
                <div className="empty-wa-view glass">
                  <div className="empty-wa-content">
                    <div className="wa-large-icon">💬</div>
                    <h1>WE TALK</h1>
                    <p>Grow, organise and manage your account.</p>
                    <div className="wa-encryption-footer">
                      <span>🔒 Your personal messages are end-to-end encrypted</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'calls' && (
        <div className="main-content-wa full-width">
          <Calls currentUser={currentUser} onCall={handleCall} />
        </div>
      )}

      {activeTab === 'status' && (
        <div className="main-content-wa full-width">
          <Feed currentUser={currentUser} />
        </div>
      )}

      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAddContact={handleAddContact}
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupModal
          currentUser={currentUser}
          onClose={() => setShowCreateGroupModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  )
}

export default App
