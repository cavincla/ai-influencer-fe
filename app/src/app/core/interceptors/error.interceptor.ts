import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

const SILENT_URL_PATTERNS = ['/api/pipeline/status/'];

function isSilent(url: string): boolean {
  return SILENT_URL_PATTERNS.some((pattern) => url.includes(pattern));
}

function toItalianMessage(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Impossibile raggiungere il server. Controlla la connessione.';
  }
  if (err.status === 400) return 'Richiesta non valida. Verifica i dati inseriti.';
  if (err.status === 401) return "Sessione scaduta. Effettua di nuovo l'accesso.";
  if (err.status === 403) return 'Accesso negato. Non hai i permessi necessari.';
  if (err.status === 404) return 'Risorsa non trovata.';
  if (err.status === 409) return 'Conflitto: la risorsa è già presente o è stata modificata.';
  if (err.status === 422) return "Dati non elaborabili. Verifica l'input.";
  if (err.status === 429) return 'Troppe richieste. Riprova tra qualche istante.';
  if (err.status >= 500) return 'Errore del server. Riprova più tardi.';
  return `Errore imprevisto (${err.status}). Riprova.`;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && !isSilent(req.url)) {
        toastService.error(toItalianMessage(err));
      }
      return throwError(() => err);
    })
  );
};
