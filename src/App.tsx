import { NotificationAPIProvider, NotificationPopup } from '@notificationapi/react'
import { useEffect, useState } from 'react'
import './App.css'

function NotificationControls() {
  const notificationapi = NotificationAPIProvider.useNotificationAPIContext()
  const [notificationStatus, setNotificationStatus] = useState<string>('')

  const checkNotificationState = async () => {
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
            }
          }
        }
      } catch (error) {
        console.error('Error checking service worker state:', error)
      }
    }
  }

  useEffect(() => {
    checkNotificationState()

    // Set up periodic check for push subscription status
    const checkInterval = setInterval(checkNotificationState, 5000)
    return () => clearInterval(checkInterval)
  }, [])

  const requestNotificationPermission = async () => {
    try {
      console.log('Requesting web push opt-in through NotificationAPI...')
      await notificationapi.setWebPushOptIn(true)
      console.log('Web push opt-in requested')
      await checkNotificationState()
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  return (
    <div>
      <h4>Here are your notifications!</h4>
      <p>Notification Permission Status: {notificationStatus}</p>
      <p>Protocol: {window.location.protocol}</p>
      <button onClick={checkNotificationState}>
        Check Notification State
      </button>
      <button onClick={requestNotificationPermission}>
        Enable Push Notifications
      </button>
    </div>
  )
}

function App() {
  const userId = import.meta.env.VITE_USER_ID
  const clientId = import.meta.env.VITE_CLIENT_ID

  return (
    <div className="app">
      <NotificationAPIProvider
        clientId={clientId}
        userId={userId}
        playSoundOnNewNotification={true}
        customServiceWorkerPath={`${window.location.origin}/notificationapi-test-frontend/notificationapi-service-worker.js`}
        webPushOptInMessage="AUTOMATIC"
      >
        <h1>NotificationAPI Secure Mode Test</h1>
        <NotificationControls />
        <NotificationPopup />
      </NotificationAPIProvider>
    </div>
  )
}

export default App
