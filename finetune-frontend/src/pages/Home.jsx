import { useAuth } from "@/components/AuthProvider";


const Home = () => {
    const {user} = useAuth();

    return (
        <div>
            <p className='font-fredoka'>Home</p>
        </div>
    )
}

export default Home;