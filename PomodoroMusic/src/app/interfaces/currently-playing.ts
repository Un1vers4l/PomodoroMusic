export interface CurrentlyPlaying {
    item: Track
    progress_ms: string
    is_playing: boolean
}

export interface Track {
    artists: Artist2[]
    id: string
    name: string
    duration_ms: string
}

export interface Artist2 {
    id: string
    name: string
}