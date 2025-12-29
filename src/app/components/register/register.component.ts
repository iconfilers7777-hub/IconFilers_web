import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  // 🔐 API base (Auth only)
  private apiBaseUrl = 'https://iconfilers.club/IconFilers/api/Auth';

  isSubmitting = false;
  serverError: string | null = null;
  serverSuccess: string | null = null;

  showPassword = false;
  showConfirmPassword = false;

  // UI-only model (NOT sent fully to backend)
  model = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    acceptTerms: false
  };

  constructor(private http: HttpClient) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get passwordMismatch(): boolean {
    return (
      !!this.model.password &&
      !!this.model.confirmPassword &&
      this.model.password !== this.model.confirmPassword
    );
  }

  private resetForm(form: NgForm): void {
    form.resetForm({ acceptTerms: false });
    this.model = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      acceptTerms: false
    };
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.model.acceptTerms || this.passwordMismatch) {
      form.form.markAllAsTouched();
      return;
    }

    // ✅ Payload exactly matching Swagger
    const payload: RegisterRequest = {
      firstName: this.model.firstName.trim(),
      lastName: this.model.lastName.trim(),
      email: this.model.email.trim(),
      password: this.model.password,
      phone: this.model.phoneNumber.trim(),
      role: 'User'
    };

    this.isSubmitting = true;
    this.serverError = null;
    this.serverSuccess = null;

    this.http.post(`${this.apiBaseUrl}/register`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.serverSuccess = 'Account created successfully. Please log in.';
        this.resetForm(form);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => (this.serverSuccess = null), 4000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.serverError =
          err?.error?.message || 'Registration failed. Please try again.';
        setTimeout(() => (this.serverError = null), 5000);
      }
    });
  }
}
