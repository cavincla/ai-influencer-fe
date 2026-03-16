import { Component } from '@angular/core';
import { ContentListComponent } from '../../components/content-list/content-list';

@Component({
  selector: 'app-content-page',
  standalone: true,
  imports: [ContentListComponent],
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class ContentPage {}
