import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private message: NzMessageService, private translate: TranslateService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry(2),
      catchError((err: HttpErrorResponse) => {
        if (req.url.toLowerCase().indexOf('xivapi.com/search') > -1) {
          this.message.error(this.translate.instant('ERRORS.Http_request_error', { tool: 'XIVAPI Search' }));
        } else if (req.url.toLowerCase().indexOf('xivapi.com') > -1) {
          this.message.error(this.translate.instant('ERRORS.Http_request_error', { tool: 'XIVAPI' }));
        } else if (req.url.toLowerCase().indexOf('garlandtools.com') > -1) {
          this.message.error(this.translate.instant('ERRORS.Http_request_error', { tool: 'Garlandtools' }));
        }
        return throwError(err);
      })
    );
  }

}
