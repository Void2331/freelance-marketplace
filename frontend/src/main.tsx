import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/features/auth/auth-context";

import App from "./App";
import "./index.css";
import { UseSearchContext } from "./features/search/searchContextProvider";
import SetPageContextProvider from "./features/page/setPageContextProvider";


createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SetPageContextProvider>
            <UseSearchContext>
              <App />
            </UseSearchContext>
          </SetPageContextProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);