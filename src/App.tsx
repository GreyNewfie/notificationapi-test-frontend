import { NotificationAPIProvider, NotificationPopup } from '@notificationapi/react'
import './App.css'

function App() {
  const userId = import.meta.env.VITE_USER_ID
  const clientId = import.meta.env.VITE_CLIENT_ID

  return (
    <div className="app">
      <NotificationAPIProvider
        clientId={clientId}
        userId={userId}
        playSoundOnNewNotification={true}
        webPushOptInMessage={true}
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
