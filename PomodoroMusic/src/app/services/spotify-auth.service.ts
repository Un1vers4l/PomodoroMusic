import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tokens } from '../interfaces/tokens';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthService {
  //   SCOPE = "user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private "
  AUTHORIZE = "https://accounts.spotify.com/authorize"
  TOKEN = "https://accounts.spotify.com/api/token";
  SCOPE = "user-read-playback-state+user-modify-playback-state+user-read-currently-playing+user-read-private+user-read-playback-position+user-read-recently-played+playlist-read-collaborative+playlist-read-private"
  client_id = "22f25d8576b24ffeac7da5b3550f8c62";
  client_secret = "1ddb3a20a270409e877c3b3492829d46";
  redirect_uri = "com.example.app://callback"
  access_token: string | null = null;
  refresh_token: string | null = null;

  constructor(private httpClient: HttpClient) {
    if (Capacitor.getPlatform() == 'web') {
      this.redirect_uri = window.location.href;
    }
  }

  public isAuthenticated(): boolean {
    if (localStorage.getItem('access_token')?.toString() != null) {
      return true;
    } else {
      return false;
    }
  }

  public requestAuthorization() {

    let url = "https://accounts.spotify.com/authorize";
    url += "?client_id=" + this.client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(this.redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=" + this.SCOPE;
    console.log("URL" + url);
    window.location.href = url;
  }

  public getCode(url: string): string | null {
    let urls = url.split("code=");
    return urls[1];
  }

  public fetchAccessToken(code: string) {
    let param = new HttpParams().set('grant_type', 'authorization_code').set('code', code).set('redirect_uri', this.redirect_uri);
    let headers = new HttpHeaders().set('Authorization', 'Basic ' + btoa(this.client_id + ":" + this.client_secret));
    return this.httpClient.post<Tokens>(this.TOKEN, param, { headers })
      .subscribe(
        token => {
          localStorage.setItem("access_token", token.access_token);
          localStorage.setItem("refresh_token", token.refresh_token);
          const date = new Date();
          date.setTime(date.getTime() + token.expires_in);
          document.cookie = "access_token="+token.access_token+"; expires="+date.toUTCString()+"; path=https://pomodoromusic-5d313.web.app/";
          window.location.href = this.redirect_uri;
          console.log(this.redirect_uri);
        },
        error => {
          console.log(error);
        }
      );
  }

  public refreshAccessToken() {
    const refresh_token = localStorage.getItem('refresh_token')?.toString();
    if (refresh_token != null) {
      let headers = new HttpHeaders().set('Authorization', 'Basic ' + btoa(this.client_id + ":" + this.client_secret)).set('Content-Type', 'application/x-www-form-urlencoded');
      let param = new HttpParams().set('grant_type', 'refresh_token').set('refresh_token', refresh_token);
      return this.httpClient.post<Tokens>(this.TOKEN, param, { headers }).subscribe(token => {
        localStorage.setItem("access_token", token.access_token);
      });
    }
    return null;
  }
}
