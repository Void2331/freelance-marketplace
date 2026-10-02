import { useState, type ReactNode } from "react"
import { SearchContextProvider } from "./searchContext"


type TNode = {
    children: ReactNode
}


export const UseSearchContext = ({children}: TNode) => {
    const [searchTerm,setSearchTerm] = useState('')

    return (
        <div>
            <SearchContextProvider value= {{searchTerm,setSearchTerm}} >
                {children}
            </SearchContextProvider>
        </div>
    )
}