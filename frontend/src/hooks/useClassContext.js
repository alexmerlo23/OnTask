import { ClassesContext } from "../context/ClassContext"
import { useContext } from "react"

export const useClassContext = () => {
  const context = useContext(ClassesContext)
  console.log(context)

  if(!context) {
    throw Error('useClassContext must be used inside a ClassContextProvider')
  }

  return context
}