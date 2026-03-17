import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast, ToastType } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  trackById(_index: number, toast: Toast): number {
    return toast.id;
  }

  typeLabel(type: ToastType): string {
    const labels: Record<ToastType, string> = {
      error: 'Errore',
      success: 'Successo',
      warning: 'Attenzione',
      info: 'Info',
    };
    return labels[type];
  }
}
