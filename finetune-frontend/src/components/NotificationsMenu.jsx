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

const NotificationsMenu = () => {
    const { user } = useAuth()

    return (
        <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" size='icon'
                className='h-[50px] w-[50px] flex items-center justify-center
                    text-foreground !border-foreground hover:text-background hover:!bg-foreground
                    focus: scale-105 active:scale-105 p-2 border-2'
                ><Bell className='!w-full !h-full'/></Button>
        </SheetTrigger>
        <SheetContent>
            <SheetHeader>
            <SheetTitle className='font-fredoka'>Notifications Menu</SheetTitle>
            <SheetDescription>
                See your recent notifications!
            </SheetDescription>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
                <p className='font-fredoka'>{user}</p>
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