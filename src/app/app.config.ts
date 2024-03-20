import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {default as ngLang} from '@angular/common/locales/zh';
import {ApplicationConfig, EnvironmentProviders, Provider} from '@angular/core';
import {provideAnimations} from '@angular/platform-browser/animations';
import {
    provideRouter,
    RouterFeatures,
    withComponentInputBinding,
    withHashLocation,
    withInMemoryScrolling,
    withViewTransitions
} from '@angular/router';
import {defaultInterceptor, I18NService, provideStartup} from '@core';
import {authSimpleInterceptor, provideAuth} from '@delon/auth';
import {AlainProvideLang, provideAlain, zh_CN as delonLang} from '@delon/theme';
import {AlainConfig} from '@delon/util/config';
import {environment} from '@env/environment';
import {zhCN as dateLang} from 'date-fns/locale';
import {NzConfig, provideNzConfig} from 'ng-zorro-antd/core/config';
import {zh_CN as zorroLang} from 'ng-zorro-antd/i18n';

import {routes} from './routes/routes';
import {ICONS_AUTO} from '../style-icons-auto';

const defaultLang: AlainProvideLang = {
  abbr: 'zh-CN',
  ng: ngLang,
  zorro: zorroLang,
  date: dateLang,
  delon: delonLang
};

const alainConfig: AlainConfig = {
  st: { modal: { size: 'lg' } },
  pageHeader: { homeI18n: 'home' },
  lodop: {
    license: `A59B099A586B3851E0F0D7FDBF37B603`,
    licenseA: `C94CEE276DB2187AE6B65D56B3FC2848`
  },
  auth: { login_url: '/passport/login' }
};

const ngZorroConfig: NzConfig = {};

const routerFeatures: RouterFeatures[] = [
  withComponentInputBinding(),
  withViewTransitions(),
  withInMemoryScrolling({ scrollPositionRestoration: 'top' })
];
if (environment.useHash) routerFeatures.push(withHashLocation());

const providers: Array<Provider | EnvironmentProviders> = [
  provideHttpClient(withInterceptors([...(environment.interceptorFns ?? []), authSimpleInterceptor, defaultInterceptor])),
  provideAnimations(),
  provideRouter(routes, ...routerFeatures),
  provideAlain({ config: alainConfig, defaultLang, i18nClass: I18NService, icons: [...ICONS_AUTO] }),
  provideNzConfig(ngZorroConfig),
  provideAuth(),
  // provideCellWidgets(...CELL_WIDGETS),
  // provideSTWidgets([]),
  provideStartup(),
  ...(environment.providers || [])
];

export const appConfig: ApplicationConfig = {
  providers: providers
};
