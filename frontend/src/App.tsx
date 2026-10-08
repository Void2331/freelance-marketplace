import { AppFooter } from "@/components/layout/app-footer";
import AppRoutes from "@/routes";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <AppRoutes />
      </main>

      {isLandingPage ? (
        <AppFooter variant="full" />
      ) : (
        <AppFooter variant="compact" />
      )}
    </div>
  );
}

export default App;