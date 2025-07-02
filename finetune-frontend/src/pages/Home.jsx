import { useAuth } from "@/components/AuthProvider";

import LoggedInHeader from "@/components/LoggedInHeader";


const Home = () => {
    const {user} = useAuth();

    return (
        <div className='flex flex-col flex-1 w-full relative'>
            <LoggedInHeader page='home'/>
            <div className='flex-1 flex justify-center items-center'>
                <p>Please be centered</p>
            </div>
        </div>
    )
}

export default Home;