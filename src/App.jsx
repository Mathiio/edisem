import { useState } from 'react'
import {Button, ButtonGroup} from "@nextui-org/button";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="text-3xl font-bold underline bg-red-100">
        Hello world!
      </h1>
      <Button color="primary">
        Button
      </Button>
    </>
  )
}

export default App
