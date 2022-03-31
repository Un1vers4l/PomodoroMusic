import { Playlist } from "./playlist";

export interface Timer {
    studyPlaylist: Playlist;
    pausePlaylist: Playlist;
    studyTime: number;
    pauseTime: number;
    playSound: boolean;
}
