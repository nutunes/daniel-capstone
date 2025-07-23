import { useState } from 'react'

import { BellRing, CheckCheck, Trash, Mail, MailOpen } from 'lucide-react';
import { Button } from './ui/button';


const NotificationElement = ({notification, updated}) => {
    const [open, setOpen] = useState(false);
    const subject = notification.subject;
    const content = notification.content;
    const opened = notification.read;

    const setRead = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/notifications/open?notification_id=${notification.id}`, {
                method: 'PATCH',
                credentials: 'include',
            })
            if (!response || !response.ok){
                throw new Error('updating notification error')
            }
            updated();
        } catch(error){
            console.error('failed to set notification to read ' + error)
        }
    }

    return (
        <div className='rounded-3xl border border-offwhite p-3 flex flex-row justify-between'>
            {!open && <div className='flex flex-row gap-3 justify-between items-center w-full'>
                {opened ? <CheckCheck /> : <BellRing />}
                <p className='font-fredoka'>{subject}</p>
                <div className='flex flex-row'>
                    <Button variant='outline' size='icon'
                        className='h-[30px] w-[30px] flex items-center justify-center
                        text-foreground !border-background hover:text-background hover:!bg-foreground
                        focus:scale-105 active:scale-105 p-1'
                        onClick={setRead}><Mail className='!w-full !h-full'/></Button>
                    <Button variant='outline' size='icon'
                        className='h-[30px] w-[30px] flex items-center justify-center
                        text-foreground !border-background hover:text-background hover:!bg-foreground
                        focus:scale-105 active:scale-105 p-1'
                        onClick={()=>console.log('click')}><Trash className='!w-full !h-full'/></Button>
                </div>

            </div>}
        </div>
    )
}


export default NotificationElement