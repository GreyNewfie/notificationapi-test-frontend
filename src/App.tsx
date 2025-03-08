import { NotificationAPIProvider, NotificationPopup } from '@notificationapi/react'
import { useEffect } from 'react'
import './App.css'

function App() {
  const userId = import.meta.env.VITE_USER_ID
  const clientId = import.meta.env.VITE_CLIENT_ID

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('Current service worker registrations:', registrations)
      })

      // Check if push manager is available
      navigator.serviceWorker.ready.then(registration => {
        console.log('Service worker ready:', registration)
        registration.pushManager.getSubscription().then(subscription => {
          console.log('Push subscription:', subscription)
        })
      }).catch(err => {
        console.log('Service worker ready error:', err)
      })
    }
  }, [])

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
        </div>
        <NotificationPopup />
      </NotificationAPIProvider>
    </div>
  )
}

export default App
