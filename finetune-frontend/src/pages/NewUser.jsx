import SpotifyAuth from "@/components/SpotifyAuth";
import AddSongs from "@/components/AddSongs";

const NewUser = () => {
    return (
        <div className='z-1 bg-background rounded-4xl p-5 flex flex-col gap-5'>
            <SpotifyAuth />
            <AddSongs />
        </div>
    )
}


export default NewUser;