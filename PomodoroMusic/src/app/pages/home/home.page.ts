import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerService } from 'src/app/services/player.service';
import { SpotifyAuthService } from 'src/app/services/spotify-auth.service';
import { TimerServiceService } from 'src/app/services/timer.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Title } from '@angular/platform-browser';
import { App } from '@capacitor/app';
import { SoundEffect } from 'capacitor-sound-effect';

const circleR = 60;
const circleDasharray = 2 * Math.PI * circleR; // Formel für den Kreisumfang

const hapticsVibrate = async () => {
  await Haptics.vibrate();
};

@Component({
  selector: 'app-root',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  time: BehaviorSubject<string> = new BehaviorSubject('00:00');
  percent: BehaviorSubject<number> = new BehaviorSubject(100);

  timer: number;
  interval;

  circleR = circleR;
  circleDasharray;

  currentTrackTimer;
  currentlyPlaying: boolean = false;

  workDuration: number;
  pauseDuration: number;

  trackTitle: string;
  trackArtists: string[] = [];

  mode: 'work' | 'pause' = 'work';
  state: 'start' | 'stop' = 'stop';

  constructor(private title: Title, private timerService: TimerServiceService, private spotify_player: PlayerService, private auth_service: SpotifyAuthService) { }

  ngOnInit(): void {
    this.workDuration = this.timerService.timer.studyTime;
    this.pauseDuration = this.timerService.timer.pauseTime;
    this.getCurrentlyPlaying();
    SoundEffect.loadSound({id:'ringtone', path:'../../assets/sounds/ringtone.mp3'});
  }

  getCurrentlyPlaying() {
    this.spotify_player.getCurrentlyPlaying().subscribe(
      track => {
        this.currentlyPlaying = track.is_playing;
        this.trackTitle = track.item.name;
        this.trackArtists = [];
        track.item.artists.forEach(
          artist => {
            this.trackArtists.push(artist.name);
            if (track.item.artists.indexOf(artist) != track.item.artists.length - 1) {
              this.trackArtists.push(", ");
            }
            this.currentTrackTimer = setTimeout(() => this.getCurrentlyPlaying(), parseFloat(track.item.duration_ms) - parseFloat(track.progress_ms));
          });
      },
      error => {
        if (error.status = '401') {
          this.auth_service.refreshAccessToken();
          this.getCurrentlyPlaying();
        }
      }
    );
  }

  nextTrack() {
    clearInterval(this.currentTrackTimer);
    this.spotify_player.skipTrack();
    setTimeout(() => this.getCurrentlyPlaying(), 750);
  }

  previousTrack() {
    clearInterval(this.currentTrackTimer);
    this.spotify_player.previousTrack();
    setTimeout(() => this.getCurrentlyPlaying(), 750);
  }

  startWork() {
    clearInterval(this.currentTrackTimer);
    this.mode = 'work';
    this.startTimer();
    setTimeout(() => this.getCurrentlyPlaying(), 750);
  }

  startPause() {
    clearInterval(this.currentTrackTimer);
    this.mode = 'pause';
    this.startTimer();
    setTimeout(() => this.getCurrentlyPlaying(), 750);

  }

  stopMusic() {
    clearInterval(this.currentTrackTimer);
    this.spotify_player.stop();
    setTimeout(() => this.getCurrentlyPlaying(), 750);

  }

  startMusic() {
    clearInterval(this.currentTrackTimer);
    this.spotify_player.play();
    setTimeout(() => this.getCurrentlyPlaying(), 750);
  }

  startTimer() {
    let currentDuration: number;
    let nextDuration: number;
    if (this.mode == 'work') {
      currentDuration = this.workDuration;
      nextDuration = this.pauseDuration;
      this.timerService.playWorkPlaylist();
    } else if (this.mode == 'pause') {
      currentDuration = this.pauseDuration;
      nextDuration = this.workDuration;
      this.timerService.playPausePlaylist();
    }
    clearInterval(this.currentTrackTimer);
    setTimeout(() => this.getCurrentlyPlaying(), 750);
    this.state = 'start';
    this.circleDasharray = circleDasharray;
    clearInterval(this.interval); // damit vermehrtes Klicken den Timer nicht beschleunigt
    this.timer = currentDuration * 60;
    this.updateTimeValue(currentDuration, nextDuration); // damit nicht eine Sekunde gewartet wird bevor der Timer losgeht
    this.interval = setInterval(() => {
      this.updateTimeValue(currentDuration, nextDuration);
    }, 1000);
  }


  stopTimer() {
    this.stopMusic();
    clearInterval(this.currentTrackTimer);
    setTimeout(() => this.getCurrentlyPlaying(), 1000);
    clearInterval(this.interval);
    this.circleDasharray = 0;
    this.time.next('00:00'); // BehaviourSubject (angezeigte Zeit) wird terminiert
    this.title.setTitle(this.time.getValue());
    this.state = 'stop';
  }

  percentageOffset(percent) {
    const percentFloat = percent / 100;
    return circleDasharray * (1 - percentFloat);
  }

  updateTimeValue(workDuration: number, pauseDuration: number) {
    let minutes: any = this.timer / 60; // Der Wert in Sekunden wird durch 60 geteilt, um Minuten zu erhalten
    let seconds: any = this.timer % 60; // Der Wert in Sekunden wird modulo 60 genommen, damit alle Sekunden, die keine volle Minute mehr ergeben, als Sekunden angezeigt werden

    minutes = String('0' + Math.floor(minutes)).slice(-2); // Math.floor rundet ab bzw. schneidet ab
    seconds = String('0' + Math.floor(seconds)).slice(-2); // .slice() extrahiert einen Teil des Strings

    const text = minutes + ':' + seconds;
    this.time.next(text); // BehaviourSubject (angezeigte Zeit) bekommt die Werte übergeben
    this.title.setTitle(this.time.getValue());
    const totalTime = workDuration * 60;
    const percentage = ((totalTime - this.timer) / totalTime) * 100; // Formel um zu berechnen, wie viel Prozent noch von der Gesamtzeit übrig sind
    this.percent.next(percentage); // Variable für Prozent auf den errechneten Wert setzen

    --this.timer; // Timer wird runtergezählt

    if (this.timer < -1) {
      if(this.timerService.timer.playSound==true){
      SoundEffect.play({id:'ringtone'});
      }
      //Haptics.vibrate();
      hapticsVibrate();
      this.changeMode();
      this.startTimer(); // Timer wird neu gestartet, wenn er 0 erreicht
    }
  }

  private changeMode() {
    if (this.mode == 'pause') {
      this.mode = 'work'
    } else if (this.mode == 'work') {
      this.mode = 'pause';
    }
  }

}