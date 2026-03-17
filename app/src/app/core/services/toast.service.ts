import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

const DEFAULT_DURATION: Record<ToastType, number> = {
  error: 5000,
  success: 3000,
  warning: 3000,
  info: 3000,
};

const MAX_TOASTS = 3;

let nextId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);

  readonly toasts = computed(() => this._toasts());

  show(type: ToastType, message: string, duration?: number): void {
    const toast: Toast = {
      id: nextId++,
      type,
      message,
      duration: duration ?? DEFAULT_DURATION[type],
    };

    this._toasts.update((current) => {
      const trimmed =
        current.length >= MAX_TOASTS
          ? current.slice(current.length - (MAX_TOASTS - 1))
          : current;
      return [...trimmed, toast];
    });

    setTimeout(() => this.dismiss(toast.id), toast.duration);
  }

  dismiss(id: number): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }
}
