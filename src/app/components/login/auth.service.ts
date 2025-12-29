import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: any;
  // adjust according to your backend response shape
  token?: string;
  message?: string;
  success?: boolean;
  // any other fields...
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // base url
  private base = 'https://iconfilers.club/IconFilers/api/Auth';

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, payload);
  }

  resetPassword(payload: { email: string; newPassword: string }) {
  return this.http.post(
    `${this.base}/reset-password`,
    payload
  );
}

}