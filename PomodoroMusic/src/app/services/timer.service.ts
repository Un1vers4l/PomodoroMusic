import { Injectable } from '@angular/core';
import { Playlist } from '../interfaces/playlist';
import { Timer } from '../interfaces/timer';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root'
})
export class TimerServiceService {

  timer: Timer;

  constructor(private spotifyPlayer: PlayerService) {
    this.refreshTimer();
  }

  public playWorkPlaylist() {
    if (this.timer != null) {
      if (this.timer.studyPlaylist != null) {
        this.spotifyPlayer.playPlaylist(this.timer.studyPlaylist.id);
      }
    }
  }

  public playPausePlaylist() {
    if (this.timer != null) {
      if (this.timer.pausePlaylist != null) {
        this.spotifyPlayer.playPlaylist(this.timer.pausePlaylist.id);
      }
    }
  }

  public save(newTimer: Timer) {
    localStorage.setItem("Timer", JSON.stringify(newTimer));
    this.refreshTimer();
  }

  public getWorkDuration() {
    if (this.timer != null) {
      if (this.timer.studyTime > 0) {
        return this.timer.studyTime;
      }
    }
    return 1;
  }

  public getPauseDuration() {
    if (this.timer != null) {
      if (this.timer.pauseTime > 0) {
        return this.timer.pauseTime;
      }
    }
    return 1;
  }

  public getPausePlaylist() {
    if (this.timer != null) {
      return this.timer.pausePlaylist;
    }
  }

  public getWorkPlaylist() {
    if (this.timer != null) {
      return this.timer.studyPlaylist;
    }
  }

  private refreshTimer() {
    this.timer = JSON.parse(localStorage.getItem("Timer"));
  }
}
