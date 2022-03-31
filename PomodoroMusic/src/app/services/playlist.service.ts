import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { componentOnReady } from '@ionic/core';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Playlist } from '../interfaces/playlist';
import { Playlists } from '../interfaces/playlists';
import { SpotifyAuthService } from './spotify-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
  constructor(private httpClient: HttpClient, private spotifyAuth: SpotifyAuthService) { }
  filteredPlaylist: Playlist[] = [];
  playlists: Playlist[] = [];


  getPlaylists() {
    const access_token = localStorage.getItem('access_token')?.toString();
    const limit = 50;
    let offset = 0;
    let fetching = true;
    if (access_token != null) {
      let headers = new HttpHeaders().set('Authorization', 'Bearer ' + access_token);
      return this.getPlaylistsApiCall(this.PLAYLISTS + "?limit=50", headers);
    }
  }

  getPlaylistsApiCall(URL: string, headers: HttpHeaders) {
    this.httpClient.get<Playlists>(URL, { headers }).subscribe(
      playlist => {
        playlist.items.forEach(play => {
          this.playlists.push(play);
        });
        if (playlist.next != null) {
          this.getPlaylistsApiCall(playlist.next, headers);
        }
      },
      error => {
        console.log(error.status);
        if (error.status == '401') {
          console.log(error.status);
          this.spotifyAuth.refreshAccessToken();
          //this.getPlaylists();
        }
      });
    return this.playlists;
  }


  filterPlaylists(playlists: Playlist[], text: string) {
    return playlists.filter(playlist => {
      return playlist.name.toLowerCase().indexOf(text) !== -1;
    });
  }

  searchPlaylists(event: {
    component: IonicSelectableComponent,
    text: string
  }, playlists: Playlist[]) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    event.component.items = this.filterPlaylists(playlists, text);
    event.component.endSearch();
    return event.component.items;
  };
}

