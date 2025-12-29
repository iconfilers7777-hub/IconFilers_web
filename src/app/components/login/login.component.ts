import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from './auth.service';
import { finalize } from 'rxjs/operators';

// 🔥 INTERNAL DASHBOARD BASE URL
const INTERNAL_BASE_URL = 'http://app.iconfilers.com/';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  loginForm!: FormGroup;
  forgotForm!: FormGroup;

  loading = false;
  forgotLoading = false;

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  showPassword = false;
  showForgotModal = false;
  showForgotPassword = false;
  showForgotConfirm = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
      remember: [false]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.syncNativeInputs(), 200);
  }

  private syncNativeInputs(): void {
    const emailEl = this.elRef.nativeElement.querySelector('#loginEmail') as HTMLInputElement;
    const pwdEl = this.elRef.nativeElement.querySelector('#loginPassword') as HTMLInputElement;

    if (emailEl?.value) this.loginForm.get('email')?.setValue(emailEl.value.trim());
    if (pwdEl?.value) this.loginForm.get('password')?.setValue(pwdEl.value.trim());
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /* ================= LOGIN ================= */

  submit(): void {
    if (this.loginForm.invalid) {
      this.showToast('Please fill required fields correctly', 'error');
      return;
    }

    this.loading = true;

    const payload: LoginRequest = {
      email: this.f['email'].value.trim(),
      password: this.f['password'].value
    };

    this.auth.login(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          if (!res?.token) {
            this.showToast('Login failed', 'error');
            return;
          }

          const role = (res.user?.role || '').toLowerCase();
          const rolePath =
            role === 'admin' ? 'admin/dashboard' :
            role === 'user' ? 'teams/dashboard' :
            'client/dashboard';

          const userEncoded = encodeURIComponent(JSON.stringify(res.user));

          this.showToast('Login successful', 'success');

          window.location.href =
            `${INTERNAL_BASE_URL}/${rolePath}?token=${res.token}&user=${userEncoded}`;
        },
        error: () => {
          this.showToast('Login failed', 'error');
        }
      });
  }

  /* ================= FORGOT PASSWORD ================= */

  get passwordMismatch(): boolean {
    const { password, confirmPassword } = this.forgotForm.value;
    return password && confirmPassword && password !== confirmPassword;
  }

  openForgotPassword(): void {
    this.showForgotModal = true;
  }

  closeForgotPassword(): void {
    this.showForgotModal = false;
    this.forgotForm.reset();
    this.showForgotPassword = false;
    this.showForgotConfirm = false;
  }

  submitForgotPassword(): void {
    if (this.forgotForm.invalid || this.passwordMismatch) return;

    this.forgotLoading = true;

    this.auth.resetPassword({
      email: this.forgotForm.value.email,
      newPassword: this.forgotForm.value.password
    }).subscribe({
      next: () => {
        this.showToast('Password reset successful', 'success');
        this.closeForgotPassword();
        this.forgotLoading = false;
      },
      error: () => {
        this.showToast('Failed to reset password', 'error');
        this.forgotLoading = false;
      }
    });
  }

  /* ================= TOAST ================= */

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }
}
