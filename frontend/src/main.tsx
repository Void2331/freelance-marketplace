import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/features/auth/auth-context";
import { SearchContextProvider } from "@/features/search/searchContext";
import SetPageContextProvider from "./features/page/setPageContextProvider";

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SetPageContextProvider>
            <SearchContextProvider>
              <App />
            </SearchContextProvider>
          </SetPageContextProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);