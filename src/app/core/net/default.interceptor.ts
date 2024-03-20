import {inject, Injector} from "@angular/core";
import {Router} from "@angular/router";
import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpHeaders,
    HttpInterceptorFn,
    HttpRequest,
    HttpResponse,
    HttpResponseBase
} from "@angular/common/http";
import {Observable, of, throwError} from "rxjs";
import {catchError, mergeMap} from "rxjs/operators";
import {environment} from "@env/environment";
import {EruptApiModel, PromptWay, Status} from "../../build/erupt/model/erupt-api.model";
import {CacheService} from "@delon/cache";
import {GlobalKeys} from "@shared/model/erupt-const";
import {DA_SERVICE_TOKEN} from "@delon/auth";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NzMessageService} from "ng-zorro-antd/message";
import {I18NService} from "../i18n/i18n.service";
import {ALAIN_I18N_TOKEN} from "@delon/theme";

export function getAdditionalHeaders(headers?: HttpHeaders): { [name: string]: string } {
    const res: { [name: string]: string } = {};
    const lang = inject(ALAIN_I18N_TOKEN).currentLang;
    if (!headers?.has('Accept-Language') && lang) {
        res['Accept-Language'] = lang;
    }

    return res;
}

function goTo(injector: Injector, url: string) {
    setTimeout(() => injector.get(Router).navigateByUrl(url));
}

function handleData(injector: Injector, event: HttpResponseBase, req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> {
    let modal = injector.get(NzModalService);
    let notify = injector.get(NzNotificationService);
    let msg = injector.get(NzMessageService);
    let tokenService = injector.get(DA_SERVICE_TOKEN);
    let router = injector.get(Router);
    let i18n = injector.get(I18NService);
    let cacheService = injector.get(CacheService);

    switch (event.status) {
        case 200:
            if (event instanceof HttpResponse) {
                const body: any = event.body;
                //如果返回对象为EruptApi
                if ("status" in body && "message" in body && "errorIntercept" in body) {
                    let eruptApiBody = <EruptApiModel>body;
                    if (eruptApiBody.message) {
                        switch (eruptApiBody.promptWay) {
                            case PromptWay.NONE:
                                break;
                            case PromptWay.DIALOG:
                                switch (eruptApiBody.status) {
                                    case Status.INFO:
                                        modal.info({
                                            nzTitle: eruptApiBody.message
                                        });
                                        break;
                                    case Status.SUCCESS:
                                        modal.success({
                                            nzTitle: eruptApiBody.message
                                        });
                                        break;
                                    case Status.WARNING:
                                        modal.warning({
                                            nzTitle: eruptApiBody.message
                                        });
                                        break;
                                    case Status.ERROR:
                                        modal.error({
                                            nzTitle: eruptApiBody.message
                                        });
                                        break;
                                }
                                break;
                            case PromptWay.MESSAGE:
                                switch (eruptApiBody.status) {
                                    case Status.INFO:
                                        msg.info(eruptApiBody.message);
                                        break;
                                    case Status.SUCCESS:
                                        msg.success(eruptApiBody.message);
                                        break;
                                    case Status.WARNING:
                                        msg.warning(eruptApiBody.message);
                                        break;
                                    case Status.ERROR:
                                        msg.error(eruptApiBody.message);
                                        break;
                                }
                                break;
                            case PromptWay.NOTIFY:
                                switch (eruptApiBody.status) {
                                    case Status.INFO:
                                        notify.info(
                                            eruptApiBody.message,
                                            null,
                                            {nzDuration: 0}
                                        );
                                        break;
                                    case Status.SUCCESS:
                                        notify.success(
                                            eruptApiBody.message,
                                            null,
                                            {nzDuration: 0}
                                        );
                                        break;
                                    case Status.WARNING:
                                        notify.warning(
                                            eruptApiBody.message,
                                            null,
                                            {nzDuration: 0}
                                        );
                                        break;
                                    case Status.ERROR:
                                        notify.error(
                                            eruptApiBody.message,
                                            null,
                                            {nzDuration: 0}
                                        );
                                        break;
                                }
                                break;
                        }
                    }
                    if (eruptApiBody.errorIntercept && eruptApiBody.status === Status.ERROR) {
                        // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：this.http.get('/').subscribe() 并不会触发
                        return throwError({});
                    }
                }
                // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
                // return of(new HttpResponse(Object.assign(event, { body: body.response })));
            }
            break;
        case 401: // 未登录状态码
            if (router.url !== "/passport/login") {
                cacheService.set(GlobalKeys.loginBackPath, router.url);
            }
            if (event.url.indexOf("erupt-api/menu") !== -1) {
                goTo(injector, "/passport/login");
                modal.closeAll();
                tokenService.clear();
            } else {
                if (tokenService.get().token) {
                    modal.confirm({
                        nzTitle: i18n.fanyi("login_expire.tip"),
                        nzOkText: i18n.fanyi("login_expire.retry"),
                        nzOnOk: () => {
                            goTo(injector, "/passport/login");
                            modal.closeAll();
                        },
                        nzOnCancel: () => {
                            modal.closeAll();
                        }
                    });
                } else {
                    goTo(injector, "/passport/login");
                }
            }
            break;
        case 404:
            goTo(injector, "/exception/404");
            break;
        case 403: //无权限
            if (event.url.indexOf("/erupt-api/build/") != -1) {
                goTo(injector, "/exception/403");
            } else {
                modal.warning({
                    nzTitle: i18n.fanyi("none_permission")
                });
            }
            break;
        case 500:
            if (event.url.indexOf("/erupt-api/build/") != -1) {
                router.navigate(["/exception/500"], {
                    queryParams: {
                        message: event instanceof HttpResponse ? event.body.message : null
                    }
                });
            } else {
                modal.error({
                    nzTitle: 'Error',
                    nzContent: event instanceof HttpResponse ? event.body.message : null
                });
                Object.assign(event, {
                    status: 200, ok: true, body: {
                        status: Status.ERROR
                    }
                });
            }
            return of(new HttpResponse(event));
        default:
            if (event instanceof HttpErrorResponse) {
                console.warn("未可知错误，大部分是由于后端无响应或无效配置引起", event);
                msg.error(event.message);
            }
            break;
    }
    if (event instanceof HttpErrorResponse) {
        return throwError(() => event);
    } else {
        return of(event);
    }
}

export const defaultInterceptor: HttpInterceptorFn = (req, next) => {
    // 统一加上服务端前缀
    let url = req.url;
    if (!url.startsWith("https://") && !url.startsWith("http://") && !url.startsWith("//")) {
        const {baseUrl} = environment.api;
        url = baseUrl + (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
    }
    const newReq = req.clone({url, setHeaders: getAdditionalHeaders(req.headers)});
    const injector = inject(Injector);
    return next(newReq).pipe(
        mergeMap(ev => {
            // 允许统一对请求错误处理
            if (ev instanceof HttpResponseBase) {
                return handleData(injector, ev, newReq, next);
            }
            // 若一切都正常，则后续操作
            return of(ev);
        }),
        catchError((err: HttpErrorResponse) => handleData(injector, err, newReq, next))
    );
};
