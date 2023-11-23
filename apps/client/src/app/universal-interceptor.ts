import { Inject, Injectable, Optional } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { REQUEST } from '../express.tokens';

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {
  constructor(@Optional() @Inject(REQUEST) protected request: any) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.includes('http')) {
      return next.handle(req);
    }
    let serverReq: HttpRequest<any> = req;
    if (this.request) {
      let newUrl = `${this.request.protocol}://${this.request.get('host')}`;
      if (!req.url.startsWith('/') && !req.url.startsWith('./')) {
        newUrl += '/';
      }
      if (req.url.startsWith('./')) {
        newUrl += req.url.slice(1);
      } else {
        newUrl += req.url;
      }
      serverReq = req.clone({ url: newUrl });
    }
    return next.handle(serverReq);
  }
}
