import { NotificationAPIProvider, NotificationPopup } from '@notificationapi/react'
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const userId = import.meta.env.VITE_USER_ID
  const clientId = import.meta.env.VITE_CLIENT_ID
  const [notificationStatus, setNotificationStatus] = useState<string>('')

  const checkNotificationState = async () => {
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
          console.log('Active service worker:', registration.active?.state)
          console.log('Waiting service worker:', registration.waiting?.state)
          console.log('Installing service worker:', registration.installing?.state)

          // Check push subscription
          const subscription = await registration.pushManager.getSubscription()
          console.log('Push subscription details:', subscription ? {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime,
            options: subscription.options
          } : 'No subscription')
        }
      } catch (error) {
        console.error('Error checking service worker state:', error)
      }
    }
  }

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/notificationapi-test-frontend/notificationapi-service-worker.js', {
        scope: '/notificationapi-test-frontend/'
      }).then(registration => {
        console.log('Service worker registration successful:', registration)
        checkNotificationState()
      }).catch(error => {
        console.log('Service worker registration failed:', error)
      })

      // Listen for service worker state changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed')
        checkNotificationState()
      })

      // Set up periodic check for push subscription status
      const checkInterval = setInterval(checkNotificationState, 5000)
      return () => clearInterval(checkInterval)
    }
  }, [])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        console.log('Notification permission request result:', permission)
        await checkNotificationState()
      } catch (error) {
        console.error('Error requesting notification permission:', error)
      }
    }
  }

  return (
    <div className="app">
      <NotificationAPIProvider
        clientId={clientId}
        userId={userId}
        playSoundOnNewNotification={true}
        customServiceWorkerPath="/notificationapi-test-frontend/notificationapi-service-worker.js"
      >
        <h1>NotificationAPI Secure Mode Test</h1>
        <div>
          <h4>Here are your notifications!</h4>
          <p>Notification Permission Status: {notificationStatus}</p>
          <button onClick={checkNotificationState}>
            Check Notification State
          </button>
          {notificationStatus !== 'granted' && (
            <button onClick={requestNotificationPermission}>
              Enable Push Notifications
            </button>
          )}
        </div>
        <NotificationPopup />
      </NotificationAPIProvider>
    </div>
  )
}

export default App
