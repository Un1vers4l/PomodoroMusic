import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DebugElement, Injectable } from '@angular/core';
import { CurrentlyPlaying } from '../interfaces/currently-playing';
import { PlaybackState } from '../interfaces/playback-state';
import { SpotifyAuthService } from './spotify-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  NEXT = "https://api.spotify.com/v1/me/player/next";
  PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
  PLAY = "https://api.spotify.com/v1/me/player/play";
  STOP = "https://api.spotify.com/v1/me/player/pause";
  CURRENTLYPLAYING = "https://api.spotify.com/v1/me/player/currently-playing"
  PLAYBACKSTATE = "https://api.spotify.com/v1/me/player";
  constructor(private httpClient: HttpClient, private spotifyAuth: SpotifyAuthService) { }

  playPlaylist(id: string) {
    const data = {
      context_uri: "spotify:playlist:" + id
    }
    const access_token = localStorage.getItem('access_token')?.toString();
    if (access_token != null) {
      let headers = new HttpHeaders().set('Authorization', 'Bearer ' + access_token);
      this.httpClient.put(this.PLAY, data, { headers }).subscribe(cp => { },
        error => {
          if (error.status == '401') {
            this.spotifyAuth.refreshAccessToken();
          } else if (error.status == '404') {
            return "No active device found: Please start Spotify on a device";
          }
        }
      );
    }
  }

  getCurrentlyPlaying() {
    const access_token = localStorage.getItem('access_token')?.toString();
    if (access_token != null) {
      let headers = new HttpHeaders().set('Authorization', 'Bearer ' + access_token);
      return this.httpClient.get<CurrentlyPlaying>(this.CURRENTLYPLAYING, { headers });
    }
  }

  skipTrack() {
    return this.spotifyPOSTAPICall(this.NEXT);
  }

  previousTrack() {
    return this.spotifyPOSTAPICall(this.PREVIOUS);
  }

  stop() {
    return this.spotifyPUTAPICall(this.STOP);
  }

  play() {
    return this.spotifyPUTAPICall(this.PLAY);
  }

  spotifyPOSTAPICall(url: string) {
    const access_token = localStorage.getItem('access_token')?.toString();
    if (access_token != null) {
      let headers = new HttpHeaders().set('Authorization', 'Bearer ' + access_token);
      this.httpClient.post<CurrentlyPlaying>(url, null, { headers }).subscribe(
        cp => { },
        error => {
          if (error.status == '401') {
            this.spotifyAuth.refreshAccessToken();
          } else if (error.status == '404') {
            return "No active device found: Please start Spotify on a device";
          }
        }
      );
    }
  }

  spotifyPUTAPICall(url: string) {
    console.log("put" + url);
    const access_token = localStorage.getItem('access_token')?.toString();
    if (access_token != null) {
      let headers = new HttpHeaders().set('Authorization', 'Bearer ' + access_token);
      return this.httpClient.put<CurrentlyPlaying>(url, {}, { headers }).subscribe(
        cp => { },
        error => {
          if (error.status == '401') {
            this.spotifyAuth.refreshAccessToken();
          } else if (error.status == '404') {
            return "No active device found: Please start Spotify on a device";
          }
        }
      );
    }
  }
}
