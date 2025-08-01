import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const PlaylistCarousel = ({songs}) => {
    return (
        <div className="w-full flex justify-center">
            <div className="relative max-w-md w-full">
                <Carousel className="w-full">
                <CarouselContent>
                    {songs.map((song) => (
                    <CarouselItem key={song.id} className="basis-full">
                        <iframe data-testid="embed-iframe" className='rounded-lg' 
                        src={`https://open.spotify.com/embed/track/${song.spotify_id}?utm_source=generator`} 
                        width="100%" height="200px" allow="autoplay; 
                        clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 top-[90%]" />
                <CarouselNext className="right-2 top-[90%]" />
                </Carousel>
            </div>
        </div>
    )
}


export default PlaylistCarousel;