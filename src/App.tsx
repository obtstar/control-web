import { RouterProvider } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { AuthProvider } from '@/auth/AuthContext'
import { router } from '@/router/router'

function App() {
  return (
    <PrimeReactProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </PrimeReactProvider>
  )
}

export default App
