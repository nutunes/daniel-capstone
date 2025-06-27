import { useAuth } from "@/components/AuthProvider";


const Home = () => {
    const {user} = useAuth();

    return (
        <h1>{`user: ${user}`}</h1>
    )
}

export default Home;