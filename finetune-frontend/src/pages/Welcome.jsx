import { useState } from "react";
import InteractiveBackground from "@/components/InteractiveBackground";
import LoginMenu from "@/components/LoginMenu";


const WelcomePage = () => {
    const [coords, setCoords] = useState({x:-1000,y:-1000})

    const handleMouseMove = (e) => {
        setCoords({x: e.clientX, y: e.clientY})
    }

    return (
        <div className='flex flex-col flex-none w-fit self-center' onMouseMove={handleMouseMove}>
            <LoginMenu />
            <InteractiveBackground coords={coords}/>
        </div>
    )
}

export default WelcomePage