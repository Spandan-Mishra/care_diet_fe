import { useRoutes } from 'raviger';
import './App.css';
import './index.css'
import Navbar from './components/Navbar';
import { SidebarProvider, SidebarTrigger, useSidebar } from './components/ui/sidebar';
import Dashboard from "./pages/dashboard/Dashboard";
import MealRequests from "./pages/dietician/MealRequests";

function NotFound() {
  return <h1>404 - Not Found</h1>;
}

const ROUTES = {
  '/': () => <Dashboard />, // Show Dashboard at root
  '/meal-requests': () => <MealRequests />, // Use the new MealRequests page
  '/patients': () => <h1>Patients</h1>,
  '*': () => <NotFound />, // fallback
};

function FloatingSidebarTrigger() {
  const { state } = useSidebar();
  if (state === "expanded") return null;
  return (
    <div className="fixed top-4 left-4 z-50">
      <SidebarTrigger />
    </div>
  );
}

export default function App() {
  const routeResult = useRoutes(ROUTES);
  return (
    <SidebarProvider>
      <FloatingSidebarTrigger />
      <Navbar />
      <main>
        {routeResult}
      </main>
    </SidebarProvider>
  );
}
