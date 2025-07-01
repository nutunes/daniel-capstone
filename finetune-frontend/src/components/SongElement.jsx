

const SongElement = ({name, artists, image}) => {
    return (
        <div className='rounded-4xl border border-offwhite p-3 flex flex-row'>
            <div className='flex flex-row gap-3'>
                <img className='rounded-sm h-20 w-20' src={image} />
                <div className='flex flex-col justify-between'>
                    <p className='font-fredoka'>{name}</p>
                    <p className='font-fredoka'>
                        {artists.map(artist=>artist.name).join(', ')}</p>
                </div>
            </div>
        </div>
    )
}

export default SongElement;