import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useRepoStore } from '@/store/repoStore'
import Welcome from './pages/Welcome'
import Repository from './pages/Repository'

const queryClient = new QueryClient()

function AppContent() {
  const { repoInfo } = useRepoStore()
  return repoInfo ? <Repository /> : <Welcome />
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
