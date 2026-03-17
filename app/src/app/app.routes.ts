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
      {
        path: 'channels',
        loadComponent: () =>
          import('./features/channels/pages/channels/channels').then((m) => m.ChannelsPage),
      },
      {
        path: 'channels/:id',
        loadComponent: () =>
          import('./features/channels/pages/channel-detail/channel-detail').then((m) => m.ChannelDetailPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
