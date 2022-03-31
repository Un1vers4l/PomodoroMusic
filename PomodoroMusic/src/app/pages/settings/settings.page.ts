import { Component, NgZone, OnInit } from '@angular/core';
import { SpotifyAuthService } from '../../services/spotify-auth.service';
import { PlaylistService } from '../../services/playlist.service';
import { Playlist } from '../../interfaces/playlist';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ActivatedRoute, Router } from '@angular/router';
import { TimerServiceService } from '../../services/timer.service';
import { Timer } from '../../interfaces/timer';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
})
export class SettingsPage implements OnInit {
  constructor(private spotifyAuth: SpotifyAuthService, private ngZone: NgZone, private spotifyPlaylist: PlaylistService, private timerService: TimerServiceService, private router: Router) { }
  playlists: Playlist[] = [];
  filteredPlaylists: Playlist[];

  isAutenticated: boolean = false;

  pausePlaylist: Playlist;
  studyPlaylist: Playlist;

  studytime: number;
  pausetime: number;

  alarmSound: boolean;

  ngOnInit() {
    if (Capacitor.getPlatform() == 'web') {
      if (window.location.search.length > 0) {
        let code: string | null = this.spotifyAuth.getCode(window.location.search);
        if (code != null) {
          this.spotifyAuth.fetchAccessToken(code);
        }
      }
    } else {
      App.addListener('appUrlOpen', ({ url }) => {
        this.ngZone.run(() => {
          let code: string | null = this.spotifyAuth.getCode(url);
          if (code != null) {
            this.spotifyAuth.fetchAccessToken(code);
          }
        })
      });
    }
    this.isAutenticated = this.spotifyAuth.isAuthenticated();
    if (this.isAutenticated) {
      this.getPlaylists();
    }
    this.studytime = this.timerService.getWorkDuration();
    this.pausetime = this.timerService.getPauseDuration();
    this.pausePlaylist = this.timerService.getPausePlaylist();
    this.studyPlaylist = this.timerService.getWorkPlaylist();
  }

  goToHome() {
    console.log("ok");
    this.router.navigate(['home']);
  }

  login() {
    this.spotifyAuth.requestAuthorization();
  }

  getPlaylists() {
    this.playlists = this.spotifyPlaylist.getPlaylists();
    this.filteredPlaylists = this.playlists;
  }

  searchPlaylists(event: { component: IonicSelectableComponent, text: string }) {
    this.filteredPlaylists = this.spotifyPlaylist.searchPlaylists(event, this.playlists);
  }

  save() {
    const newTimer: Timer = {
      studyPlaylist: this.studyPlaylist,
      pausePlaylist: this.pausePlaylist,
      studyTime: this.studytime,
      pauseTime: this.pausetime,
      playSound: this.alarmSound
    };
    this.timerService.save(newTimer);
    this.goToHome();
  }

}
