export default function HowTo() {
    
return(

    <section className="py-4 mb-24">
    <div className="mx-auto max-w-7xl px-4">
        <div className="mb-14 text-center">
            <h2 className="text-5xl text-center font-bold text-white py-4">
                breaking it down
            </h2>
            <p className="text-lg font-normal text-[#ECE9E4]  mx-auto">
                Choose your key and scale, then use hand gestures and movement to play notes, chords, and any music you'd like.
            </p>
        </div>
        <div
            className="mx-24 flex justify-center items-top  gap-y-8  gap-x-24 flex-wrap md:flex-wrap lg:flex-nowrap lg:flex-row lg:justify-between ">
            <div className="relative w-full text-center ">
                
                <h4 className="text-2xl font-medium text-white ">
                    hand gestures
                </h4>
                <p className="text-md font-normal text-[#ECE9E4] text-left">
                    For your right hand, the number of fingers you hold up determine the duration of the note played, 
                    ranging from a sixteenth note to a whole note.
                    For your left hand, the number of fingers you hold up determine 
                    the chord played— from C major to F major. 
                    A fist stops the notes/chords.
                    
                </p>
            </div>
            <div className="relative w-full text-center ">
                
                <h4 className="text-2xl font-medium text-white ">
                    hand position
                </h4>
                <p className="text-md font-normal text-[#ECE9E4] text-left">
                    The position of your right hand, relative to the right edge of the web camera, determines the pitch of the note played.
                </p>
            </div>
        
            
        </div>
    </div>
</section>
                                        

);
}