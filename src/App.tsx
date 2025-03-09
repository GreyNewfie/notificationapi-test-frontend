import { NotificationAPIProvider, NotificationPopup } from '@notificationapi/react'
import { useState } from 'react'
import './App.css'

interface UserInfo {
  id: string;
  email: string;
}

function UserLoginForm({ onSubmit }: { onSubmit: (userInfo: UserInfo) => void }) {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userId && email) {
      // Save to localStorage for persistence
      const userInfo = { id: userId, email }
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      onSubmit(userInfo)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Enter User Details</h2>
      <div>
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Set User</button>
    </form>
  )
}

function NotificationControls({ userInfo }: { userInfo: UserInfo }) {
  const notificationapi = NotificationAPIProvider.useNotificationAPIContext()
  const [notificationStatus, setNotificationStatus] = useState<string>('')
  const [error, setError] = useState<string>('')

  const checkNotificationState = async () => {
    setError('')
    // Log origin and protocol
    console.log('Current origin:', window.location.origin)
    console.log('Current protocol:', window.location.protocol)
    
    // Check notification permission
    if ('Notification' in window) {
      const permission = Notification.permission
      console.log('Current notification permission:', permission)
      setNotificationStatus(permission)
    }

    // Check service worker registration
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        console.log('Service worker registrations:', registrations)

        if (registrations.length > 0) {
          const registration = registrations[0]
          console.log('Service worker scope:', registration.scope)
          console.log('Active service worker:', registration.active?.state)
          console.log('Waiting service worker:', registration.waiting?.state)
          console.log('Installing service worker:', registration.installing?.state)

          // Check push subscription
          const subscription = await registration.pushManager.getSubscription()
          if (subscription) {
            console.log('Push subscription exists:', {
              endpoint: subscription.endpoint,
              expirationTime: subscription.expirationTime,
              options: subscription.options
            })
          } else {
            console.log('No push subscription exists. Checking push manager support...')
            try {
              const supportedContentEncodings = PushManager.supportedContentEncodings || []
              console.log('Supported content encodings:', supportedContentEncodings)
              
              // Try to get subscription options
              const options = await registration.pushManager.permissionState({
                userVisibleOnly: true
              })
              console.log('Push permission state:', options)
            } catch (error) {
              console.error('Error checking push support:', error)
              setError('Error checking push support. Please try again.')
            }
          }
        }
      } catch (error) {
        console.error('Error checking service worker state:', error)
        setError('Error checking service worker state. Please refresh the page.')
      }
    }
  }

  const requestNotificationPermission = async () => {
    setError('')
    try {
      console.log('Requesting web push opt-in through NotificationAPI...')
      await notificationapi.setWebPushOptIn(true)
      console.log('Web push opt-in requested')
      await checkNotificationState()
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setError('Failed to enable notifications. Please try refreshing the page.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    window.location.reload()
  }

  return (
    <div className="notification-controls">
      <div className="user-info">
        <h4>Current User</h4>
        <p>ID: {userInfo.id}</p>
        <p>Email: {userInfo.email}</p>
        <button onClick={handleLogout}>Change User</button>
      </div>
      <h4>Here are your notifications!</h4>
      <div className="status-info">
        <p>Notification Permission Status: {notificationStatus}</p>
        <p>Protocol: {window.location.protocol}</p>
        {error && <p className="error-message">{error}</p>}
      </div>
      <div className="button-group">
        <button onClick={checkNotificationState}>
          Check Notification State
        </button>
        <button onClick={requestNotificationPermission}>
          Enable Push Notifications
        </button>
      </div>
    </div>
  )
}

function App() {
  const clientId = import.meta.env.VITE_CLIENT_ID
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    const saved = localStorage.getItem('userInfo')
    return saved ? JSON.parse(saved) : null
  })

  if (!userInfo) {
    return <UserLoginForm onSubmit={setUserInfo} />
  }

  return (
    <div className="app">
      <NotificationAPIProvider
        clientId={clientId}
        userId={userInfo.id}
        user={{
          id: userInfo.id,
          email: userInfo.email
        }}
        playSoundOnNewNotification={true}
        customServiceWorkerPath={`${window.location.origin}/notificationapi-test-frontend/notificationapi-service-worker.js`}
        webPushOptInMessage="AUTOMATIC"
      >
        <h1>NotificationAPI Secure Mode Test</h1>
        <NotificationControls userInfo={userInfo} />
        <NotificationPopup iconColor='#ffffff'/>
      </NotificationAPIProvider>
    </div>
  )
}

export default App
