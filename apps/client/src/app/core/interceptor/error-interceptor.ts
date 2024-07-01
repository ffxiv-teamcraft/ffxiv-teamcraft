import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, retry } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('//localhost:14500')) {
      return next.handle(req).pipe(catchError(() => of(null)));
    }
    if (req.url.includes('//localhost:3333')) {
      return next.handle(req);
    }
    return next.handle(req).pipe(
      delay(1100),
      retry(2)
    );
  }

}
