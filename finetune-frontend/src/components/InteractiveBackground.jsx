import { useRef, useEffect, useState } from 'react'

import { Music, Music2, Music3, Music4 } from "lucide-react"

const colors = ['#a682ff', '#f0a868', '#084c61', '#a63446', '#f5f5f5', '#aaf0ad'];
const svgs = { Music, Music2, Music3, Music4 }
const svgKeys = Object.keys(svgs);
const numNotes = 15

const InteractiveBackground = () => {
    const divRef = useRef(null);
    const [notes, setNotes] = useState([])

    useEffect(()=>{
        const cont = divRef.current;
        const {height, width} = cont.getBoundingClientRect();
        const newNotes = [];
        for (let i = 0; i < numNotes; i++){
            newNotes.push({
                id: i,
                x: Math.floor(Math.random()*width),
                y: Math.floor(Math.random()*height),
                color: colors[Math.floor(Math.random()*colors.length)],
                svgKey: svgKeys[Math.floor(Math.random()*svgKeys.length)]
            })
        }
        setNotes(newNotes);
    },[])

    return (
        <div className='absolute inset-0 bg-transparent pointer-events-none'>
            <div ref={divRef} className='absolute inset-20 pointer-events-none bg-transparent'>
            {notes.map((note)=>{
                const NoteComponent = svgs[note.svgKey];
                return(
                    <div 
                    key={note.id}
                    className='absolute' 
                    style={{top: `${note.y}px`, left: `${note.x}px`}}>
                        <NoteComponent stroke={note.color} width={'70px'} height={'70px'}/>
                    </div>
                )
            })}
            </div>
        </div>
    )
}

export default InteractiveBackground