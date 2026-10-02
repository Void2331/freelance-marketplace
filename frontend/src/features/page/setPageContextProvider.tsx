import { useState } from "react";
import { PageContext } from "./pageContext"



interface IChildrenProp {
    children: React.ReactNode;
}

const SetPageContextProvider = ({children}: IChildrenProp) => {
    const [currentPage,setCurrentPage] = useState(1)
  return (
    <div>
        <PageContext value={{currentPage, setCurrentPage}}>
            {children}
        </PageContext>
    </div>
  )
}

export default SetPageContextProvider