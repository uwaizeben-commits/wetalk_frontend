import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Profile from './components/Profile'
import UserDetail from './components/UserDetail'
import CallInterface from './components/CallInterface'
import AddContactModal from './components/AddContactModal'
import Recovery from './components/Auth/Recovery'
import StoryViewer from './components/StoryViewer'
import NavRail from './components/NavRail'
import './App.css'

const socket = io('http://127.0.0.1:3001')

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  })
  const [authMode, setAuthMode] = useState('login')
  const [showProfile, setShowProfile] = useState(false)
  const [selectedProfileUser, setSelectedProfileUser] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  const [mutedContacts, setMutedContacts] = useState([])
  const [blockedContacts, setBlockedContacts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStoryUser, setSelectedStoryUser] = useState(null)
  const storyInputRef = useRef(null)

  // Mobile responsiveness states
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mobileView, setMobileView] = useState('list') // 'list' or 'chat'

  const [contacts, setContacts] = useState([
    { id: 1, name: 'OVER_NKEM❤️❤️🌹', avatar: 'ON', lastMessage: 'You don Dey come?', time: '04:17', unread: 0 },
    { id: 2, name: 'Ksolo', avatar: 'KS', lastMessage: '📞 Missed voice call', time: 'Monday', unread: 10 },
    { id: 3, name: 'Mucm❤️❤️', avatar: 'MC', lastMessage: '✓ Good morning uncle Chris.', time: 'Yesterday', unread: 0 },
    { id: 4, name: 'NARVIK GMC SOFTWARE DEV.', avatar: 'NG', lastMessage: '~ JOJOMIWA: Onto the Next Great ...', time: '04:24', unread: 4 },
  ])

  const [activeContact, setActiveContact] = useState(null) // Start null for empty view
  const [activeTab, setActiveTab] = useState('chats')

  const [messages, setMessages] = useState({
    1: [{ sender: 'other', text: 'You don Dey come?', time: '04:17' }],
    2: [{ sender: 'other', text: 'Missed voice call', time: 'Monday' }],
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)

    socket.on('receive_message', (data) => {
      if (activeContact) {
        setMessages((prev) => ({
          ...prev,
          [activeContact.id]: [...(prev[activeContact.id] || []), data]
        }))
      }
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      socket.off('receive_message')
    }
  }, [activeContact?.id])

  const handleSendMessage = (text) => {
    if (!activeContact) return
    const newMessage = {
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    socket.emit('send_message', newMessage)
    setMessages((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
    }))
  }

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('http://127.0.0.1:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
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
      const response = await fetch('http://127.0.0.1:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registration successful! Please login.');
        setAuthMode('login');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Failed to connect to server: ' + err.message);
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('user')
    setAuthMode('login')
    setShowProfile(false)
    setSelectedProfileUser(null)
    setActiveCall(null)
  }

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser)
    setShowProfile(false)
    alert('Profile updated successfully!')
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username })
      });
      if (response.ok) {
        alert('Account deleted successfully. You can now register again with the same phone number.');
        handleLogout();
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

  const handleNewChat = () => {
    const names = ['Emma Wilson', 'Liam Brown', 'Sophia Davis', 'Jackson Miller'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newId = Date.now();
    const newContact = {
      id: newId,
      name: randomName,
      avatar: randomName.split(' ').map(n => n[0]).join(''),
      lastMessage: 'Let\'s chat!',
      time: 'Just now',
      phone: '+1 555-0' + Math.floor(Math.random() * 1000),
      bio: 'New to Wetalk!'
    };
    setContacts(prev => [newContact, ...prev]);
    setActiveContact(newContact);
    if (isMobile) setMobileView('chat');
  }

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    if (isMobile) setMobileView('chat');
  }

  const handleAddContact = (user) => {
    // Basic check if contact exists
    if (contacts.find(c => c.id === user.id)) {
      handleSelectContact(contacts.find(c => c.id === user.id));
      return;
    }

    const newContact = {
      ...user,
      lastMessage: 'Contact added!',
      time: 'Just now'
    };
    setContacts(prev => [newContact, ...prev]);
    handleSelectContact(newContact);
  }

  const handleUploadStory = () => {
    storyInputRef.current?.click()
  }

  const handleStoryFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    if (isVideo) {
      // Basic 30s check (simulated or via video element)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        if (video.duration > 30) {
          alert('Video must be 30 seconds or less')
          return
        }
        processUpload(file, 'video')
      }
      video.src = URL.createObjectURL(file)
    } else {
      processUpload(file, 'image')
    }
  }

  const processUpload = async (file, type) => {
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3001/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.username, // Using username as id for simplicity
            username: currentUser.firstName || currentUser.username,
            type,
            url: reader.result
          })
        })
        if (response.ok) {
          alert('Status uploaded successfully!')
        }
      } catch (err) {
        alert('Failed to upload status')
      }
    }
    reader.readAsDataURL(file)
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

  if (showProfile) {
    return (
      <Profile
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onDeleteAccount={handleDeleteAccount}
        onBack={() => setShowProfile(false)}
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
            if (tab === 'settings') setShowProfile(true);
            else setActiveTab(tab);
          }}
          currentUser={currentUser}
        />
      )}

      {(!isMobile || mobileView === 'list') && (
        <Sidebar
          contacts={contacts}
          activeContact={activeContact}
          onSelectContact={handleSelectContact}
          currentUser={currentUser}
          onNewChat={() => setShowAddModal(true)}
          mutedContacts={mutedContacts}
          blockedContacts={blockedContacts}
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
            />
          ) : (
            <div className="empty-wa-view glass">
              <div className="empty-wa-content">
                <div className="wa-large-icon">💬</div>
                <h1>WhatsApp for Windows</h1>
                <p>Grow, organise and manage your business account.</p>
                <div className="wa-encryption-footer">
                  <span>🔒 Your personal messages are end-to-end encrypted</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAddContact={handleAddContact}
        />
      )}
      {selectedStoryUser && (
        <StoryViewer
          userStories={selectedStoryUser}
          onClose={() => setSelectedStoryUser(null)}
        />
      )}
      <input
        type="file"
        ref={storyInputRef}
        style={{ display: 'none' }}
        accept="image/*,video/*"
        onChange={handleStoryFileChange}
      />
    </div>
  )
}

export default App
