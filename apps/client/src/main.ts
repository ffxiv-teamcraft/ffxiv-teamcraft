import { ApplicationRef, enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'hammerjs';
import { enableDebugTools } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic().bootstrapModule(AppModule, { ngZoneEventCoalescing: true, ngZoneRunCoalescing: true }).then((module) => {
    if (!environment.production) {
      const applicationRef = module.injector.get(ApplicationRef);
      const appComponent = applicationRef.components[0];
      enableDebugTools(appComponent);
    }
  });
});

// Patching console to prevent too many ads-related shit
const originalWarning = console.warn;
console.warn = (message?: any, ...optionalParams: any[]) => {
  if (!message.includes('[GPT]')) {
    originalWarning(message, ...optionalParams);
  }
};
const originalError = console.error;
console.error = (message?: any, ...optionalParams: any[]) => {
  if (message.includes('[Teamcraft]')) {
    originalError(message, ...optionalParams);
  }
};
const originalLog = console.log;
console.log = (message?: any, ...optionalParams: any[]) => {
  if (!message.includes(':::') && !message.includes('Powered by AMP')) {
    originalLog(message, ...optionalParams);
  }
};
