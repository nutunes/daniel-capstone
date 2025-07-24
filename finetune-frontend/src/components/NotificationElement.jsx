import { useState } from 'react'

import { BellRing, CheckCheck, Trash, Mail, MailOpen } from 'lucide-react';
import { Button } from './ui/button';


const NotificationElement = ({notification, updated}) => {
    const [open, setOpen] = useState(false);
    const [read, setRead] = useState(notification.read)
    const subject = notification.subject;
    const content = notification.content


    const handleRead = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/notifications/open?notification_id=${notification.id}`, {
                method: 'PATCH',
                credentials: 'include',
            })
            if (!response || !response.ok){
                throw new Error('updating notification error')
            }
            //Trigger a rerender locally, don't have to requery for all notifications each time you open one
            setRead(true);
        } catch(error){
            console.error('failed to set notification to read ' + error)
        }
    }

    const handleDelete = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/notifications/?notification_id=${notification.id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (!response || !response.ok){
                throw new Error('failed to delete notification')
            }
            updated();
        } catch(error){
            console.error('failed to delete notification ' + error)
        }
    }
    
    const handleOpen = async() => {
        if (!open){
            if (!read){
                await handleRead();
            } 
            setOpen(true);
        } else{
            setOpen(false);
        }
    }


    return (
        <div className='rounded-3xl border border-offwhite p-3 flex flex-col justify-between w-full'>
            <div className='flex flex-row gap-3 justify-between items-center w-full'>
                {read ? <CheckCheck /> : <BellRing />}
                <p className='font-fredoka'>{subject}</p>
                <div className='flex flex-row'>
                    <Button variant='outline' size='icon'
                        className='h-[30px] w-[30px] flex items-center justify-center
                        text-foreground !border-background hover:text-background hover:!bg-foreground
                        focus:scale-105 active:scale-105 p-1'
                        onClick={handleOpen}>
                            {open ? <MailOpen className='!w-full !h-full' /> : <Mail className='!w-full !h-full'/>}
                            </Button>
                    <Button variant='outline' size='icon'
                        className='h-[30px] w-[30px] flex items-center justify-center
                        text-foreground !border-background hover:text-background hover:!bg-foreground
                        focus:scale-105 active:scale-105 p-1'
                        onClick={handleDelete}><Trash className='!w-full !h-full'/></Button>
                </div>
            </div>
            {open && <div className='flex flex-row'>
                <div className='flex flex-col text-sm text-muted-foreground'>
                    {content.split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                    ))}
                </div>
            </div>}
        </div>
    )
}


export default NotificationElement