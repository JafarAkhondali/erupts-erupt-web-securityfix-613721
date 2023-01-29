// 请参考：https://ng-alain.com/docs/i18n
import {Platform} from '@angular/cdk/platform';
import {registerLocaleData} from '@angular/common';
import ngEn from '@angular/common/locales/en';
import ngZh from '@angular/common/locales/zh';
import ngZhTw from '@angular/common/locales/zh-Hant';
import ngKO from '@angular/common/locales/ko';
import ngJA from '@angular/common/locales/ja';
import {Injectable} from '@angular/core';
import {
    DelonLocaleService,
    en_US as delonEnUS,
    ja_JP as delonJp,
    ko_KR as delonKo,
    SettingsService,
    zh_CN as delonZhCn,
    zh_TW as delonZhTw
} from '@delon/theme';
import {enUS as dfEn, ja as dfJp, ko as dfKo, zhCN as dfZhCn, zhTW as dfZhTw} from 'date-fns/locale';
import {NzSafeAny} from 'ng-zorro-antd/core/types';
import {
    en_US as zorroEnUS,
    ja_JP,
    ko_KR,
    NzI18nService,
    zh_CN as zorroZhCN,
    zh_TW as zorroZhTW
} from 'ng-zorro-antd/i18n';
import {WindowModel} from "@shared/model/window.model";
import {HttpClient} from "@angular/common/http";

interface LangConfigData {
    abbr: string;
    text: string;
    date: NzSafeAny;
    ng: NzSafeAny;
    zorro: NzSafeAny;
    delon: NzSafeAny;
}

const LANGS: { [key: string]: LangConfigData } = {
    'zh-CN': {
        abbr: '🇨🇳',
        text: '简体中文',
        ng: ngZh,
        date: dfZhCn,
        zorro: zorroZhCN,
        delon: delonZhCn,
    },
    'zh-TW': {
        abbr: '🇭🇰',
        text: '繁体中文',
        date: dfZhTw,
        ng: ngZhTw,
        zorro: zorroZhTW,
        delon: delonZhTw,

    },
    'en-US': {
        abbr: '🇬🇧',
        text: 'English',
        date: dfEn,
        ng: ngEn,
        zorro: zorroEnUS,
        delon: delonEnUS,
    },
    'ja-JP': {
        abbr: '🇯🇵',
        text: '日本語',
        date: dfJp,
        ng: ngJA,
        zorro: ja_JP,
        delon: delonJp,
    },
    'ko-KR': {
        abbr: '🇰🇷',
        text: '한국어',
        date: dfKo,
        ng: ngKO,
        zorro: ko_KR,
        delon: delonKo,
    }
};


@Injectable()
export class I18NService {

    currentLang: string;

    langMapping: { [key: string]: string };

    constructor(
        private http: HttpClient,
        private settings: SettingsService,
        private nzI18nService: NzI18nService,
        private delonLocaleService: DelonLocaleService,
        private platform: Platform
    ) {
        const defaultLang = this.getDefaultLang();
        this.currentLang = LANGS[defaultLang] ? defaultLang : 'en-US'
    }

    private getDefaultLang(): string {
        if (this.settings.layout.lang) {
            return this.settings.layout.lang;
        }
        if (!this.platform.isBrowser) {
            return 'zh-CN';
        }
        let res = (navigator.languages ? navigator.languages[0] : null) || navigator.language;
        const arr = res.split('-');
        return arr.length <= 1 ? res : `${arr[0]}-${arr[1].toUpperCase()}`;
    }

    loadLangData(success) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "assets/erupt.i18n.csv?v=123");
        xhr.send();
        xhr.onreadystatechange = () => {
            let langMapping = {};
            if (xhr.readyState == 4 && xhr.status == 200) {
                let allRows = xhr.responseText.split(/\r?\n|\r/);
                let header = allRows[0].split(',');
                let index;
                for (let i = 0; i < header.length; i++) {
                    if (header[i] == this.currentLang) {
                        index = i;
                    }
                }
                allRows.forEach(it => {
                    let row = it.split(',');
                    langMapping[row[0]] = row[index];
                })

                let extra = WindowModel.i18n[this.currentLang];
                if (extra) {
                    for (let key in extra) {
                        langMapping[key] = extra[key];
                    }
                }
                this.langMapping = langMapping;
                success();
            }
        };

    }

    use(lang: string): void {
        if (this.currentLang === lang) return;
        const item = LANGS[lang];
        registerLocaleData(item.ng, item.abbr);
        this.nzI18nService.setLocale(item.zorro);
        this.nzI18nService.setDateLocale(item.date);
        this.delonLocaleService.setLocale(item.delon);
        this.currentLang = lang;
    }

    getLangs(): Array<{ code: string; text: string; abbr: string }> {
        return Object.keys(LANGS).map(it => {
            return {
                code: it,
                text: LANGS[it].text,
                abbr: LANGS[it].abbr
            }
        })
    }

    fanyi(key: string) {
        return this.langMapping[key] || key;
    }

}
