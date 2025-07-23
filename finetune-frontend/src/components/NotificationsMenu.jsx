import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { Bell } from "lucide-react"
import { useAuth } from "./AuthProvider"
import NotificationElement from './NotificationElement'

const NotificationsMenu = () => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState(null)

    const fetchNotifications = async() => {
        try{
            const response = await fetch('http://127.0.0.1:3000/notifications', {
                credentials: 'include',
            })
            if (!response || !response.ok){
                throw new Error('failed to get recommended songs')
            }
            const notifs = await response.json()
            console.log(notifs);
            setNotifications(notifs);
        } catch(error){
            console.error('failed to fetch notifications ' + error)
        }
    }


    return (
        <Sheet onOpenChange={fetchNotifications}>
            <SheetTrigger asChild>
                <Button variant="outline" size='icon'
                    className='h-[50px] w-[50px] flex items-center justify-center
                        text-foreground !border-foreground hover:text-background hover:!bg-foreground
                        focus: scale-105 active:scale-105 p-2 border-2'
                    ><Bell className='!w-full !h-full'/></Button>
            </SheetTrigger>
            <SheetContent className='flex flex-col items-center'>
                <SheetHeader>
                    <SheetTitle className='font-fredoka text-2xl'>Notifications Menu</SheetTitle>
                        <SheetDescription>
                            See your recent notifications!
                        </SheetDescription>
                </SheetHeader>
                <div className="items-center flex flex-col">
                    {!notifications && 
                        <p className='font-fredoka'>Loading notifications...</p> 
                    }
                    {notifications?.length === 0 && 
                        <p className='font-fredoka'>You have no notifications!</p>
                    }
                    {notifications?.length > 0 && 
                        <div>
                            {notifications.map(notification => {
                                return(
                                    <NotificationElement notification={notification} key={notification.id}/>
                                )
                            })}
                        </div>}
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default NotificationsMenu