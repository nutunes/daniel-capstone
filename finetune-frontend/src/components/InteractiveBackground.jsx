import { useRef, useEffect, useState } from 'react'

import { Music, Music2, Music3, Music4 } from "lucide-react"

const colors = ['#a682ff', '#f0a868', '#084c61', '#a63446', '#f5f5f5', '#aaf0ad'];
const svgs = { Music, Music2, Music3, Music4 }
const svgKeys = Object.keys(svgs);
const maxNumFails = 70;
const showDist = 160;
const flashlightRadius = 200;

const InteractiveBackground = ({coords}) => {
    const divRef = useRef(null);
    const [notes, setNotes] = useState([]);

    const getDistance = (x1, y1, x2, y2)=> Math.sqrt((x1-x2)**2 + (y1-y2)**2);

    const checkClosest = (x, y, newNotes, distTolerance) => {
        for (const note of newNotes){
            if (getDistance(x, y, note.x, note.y) < distTolerance){
                return false;
            }
        }
        return true;
    }

    useEffect(()=>{ 
        const cont = divRef.current;
        const {height, width} = cont.getBoundingClientRect();
        const distTolerance = (width/30)
        const newNotes = [];
        let shouldBreak = false;
        let i = 0;
        while (true){
            let x = Math.floor(Math.random()*width);
            let y = Math.floor(Math.random()*height);
            let numFails=0;
            while (!checkClosest(x,y, newNotes, distTolerance)){
                //Force the x and y values to be far enough away from the closest other node so that there is no overlap
                x=Math.floor(Math.random()*width);
                y=Math.floor(Math.random()*height);
                numFails++;
                if (numFails >= maxNumFails){
                    shouldBreak=true;
                    break;
                }
            }
            if (shouldBreak) break;
            newNotes.push({
                id: i,
                x,
                y,
                color: colors[Math.floor(Math.random()*colors.length)],
                svgKey: svgKeys[Math.floor(Math.random()*svgKeys.length)]
            })
            i++;
        }
        setNotes(newNotes);
    },[])


    return (
        <div className='absolute inset-0 bg-transparent pointer-events-none cursor-none'>
            <div className='absolute inset-0 pointer-events-none' style={{
                background: `radial-gradient(circle ${flashlightRadius}px at ${coords.x + 25}px ${coords.y + 25}px, rgba(245, 245, 245, 0.8) 0%, rgba(245,245,245,0) 100%)`,
                transition: 'background 0.1s ease-out'
            }}>

            </div>
            <div ref={divRef} className='absolute top-0 left-0 right-5 bottom-5 md:bottom-10 md:right-10 lg:bottom-20 lg:right-20 xl:bottom-30 xl:right-30 pointer-events-auto bg-transparent'>
            {notes.map((note)=>{
                const NoteComponent = svgs[note.svgKey];
                //Check if mouse is close enough
                const show = getDistance(note.x, note.y, coords.x, coords.y)<=showDist;
                return(
                    <div 
                    key={note.id}
                    className='absolute size-[10px] md:size-[25px] lg:size-[40px] xl:size-[50px]' 
                    style={{top: `${note.y}px`, left: `${note.x}px`}}>
                        <NoteComponent stroke={show ? note.color : 'transparent'} className={`w-full h-full 
                            ${show? 'animate-brightpulse': ''}
                        `}/>
                    </div>
                )
            })}
            </div>
        </div>
    )
}

export default InteractiveBackground