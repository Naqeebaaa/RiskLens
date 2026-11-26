import { Outlet } from 'react-router-dom'
import { TopNavigation } from './TopNavigation'

export function AppLayout() {
  return (
    <div className="risklens-app">
      <TopNavigation />
      <main className="risklens-main">
        <Outlet />
      </main>
    </div>
  )
}
