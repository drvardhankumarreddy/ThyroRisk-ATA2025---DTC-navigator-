
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import 'zone.js';

bootstrapApplication(AppComponent, {
  providers: []
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
