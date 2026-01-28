import { useState, useEffect } from 'react'
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

  // Mobile responsiveness states
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mobileView, setMobileView] = useState('list') // 'list' or 'chat'

  const [contacts, setContacts] = useState([
    { id: 1, name: 'John Doe', avatar: 'JD', lastMessage: 'Hey, how\'s it going?', time: '12:45 PM', phone: '+1 555-0101', bio: 'Living the dream!' },
    { id: 2, name: 'Alice Smith', avatar: 'AS', lastMessage: 'See you tomorrow!', time: '10:30 AM', phone: '+1 555-0102', bio: 'Designer & Dreamer' },
  ])

  const [activeContact, setActiveContact] = useState(contacts[0])

  const [messages, setMessages] = useState({
    1: [
      { sender: 'other', text: 'Hey, how\'s it going?', time: '12:45 PM' },
      { sender: 'me', text: 'Hi John! All good, just working on the new chat app. You?', time: '12:46 PM' },
      { sender: 'other', text: 'That sounds awesome! Can\'t wait to see it. 🚀', time: '12:47 PM' },
    ],
    2: [
      { sender: 'other', text: 'See you tomorrow!', time: '10:30 AM' }
    ]
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)

    socket.on('receive_message', (data) => {
      setMessages((prev) => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), data]
      }))
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      socket.off('receive_message')
    }
  }, [activeContact.id])

  const handleSendMessage = (text) => {
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
    <div className={`app-container ${isMobile ? 'mobile' : ''}`}>
      {(!isMobile || mobileView === 'list') && (
        <Sidebar
          contacts={contacts}
          activeContact={activeContact}
          onSelectContact={handleSelectContact}
          currentUser={currentUser}
          onLogout={handleLogout}
          onShowProfile={() => setShowProfile(true)}
          onNewChat={() => setShowAddModal(true)}
          mutedContacts={mutedContacts}
          blockedContacts={blockedContacts}
        />
      )}
      {(!isMobile || mobileView === 'chat') && (
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
      )}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAddContact={handleAddContact}
        />
      )}
    </div>
  )
}

export default App
