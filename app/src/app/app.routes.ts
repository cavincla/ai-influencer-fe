import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.DashboardPage),
      },
      {
        path: 'content',
        loadComponent: () =>
          import('./features/dashboard/pages/content/content').then((m) => m.ContentPage),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/pages/calendar/calendar').then((m) => m.CalendarPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
