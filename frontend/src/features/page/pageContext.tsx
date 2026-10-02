import { createContext } from "react";

interface IPageInterface {
    currentPage: number
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>
}

export const PageContext = createContext<IPageInterface>({
    currentPage: 1,
    setCurrentPage: (x) =>  x
})