import {bootstrapApplication} from '@angular/platform-browser';

import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';

setTimeout(() => {
    if (window['SW']) {
        window['SW'].stop();
        window['SW'] = null;
    }
}, 5000)
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
