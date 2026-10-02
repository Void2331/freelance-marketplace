import { createContext } from "react";

type TSearchTypeContext = {
    searchTerm: string;
    setSearchTerm:  React.Dispatch<React.SetStateAction<string>>;
}

export const SearchContextProvider = createContext<TSearchTypeContext>({} as TSearchTypeContext)

