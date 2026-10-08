import type { ReactNode } from "react";

import { SearchContextProvider } from "./searchContext";

type TNode = {
  children: ReactNode;
};

export const UseSearchContext = ({ children }: TNode) => {
  return (
    <SearchContextProvider>
      {children}
    </SearchContextProvider>
  );
};