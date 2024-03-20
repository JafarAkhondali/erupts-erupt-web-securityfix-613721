import {Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {SiteComponent} from "./site/site.component";
import {LayoutEruptComponent} from "../layout/erupt/erupt.component";
import {LayoutPassportComponent} from "../layout/passport/passport.component";
import {UserLoginComponent} from "../layout/passport/login/login.component";
import {FillComponent} from "./fill/fill.component";
import {Exception403Component} from "./exception/403.component";
import {Exception404Component} from "./exception/404.component";
import {Exception500Component} from "./exception/500.component";

let coreRouter: Routes = [
    {path: "", component: HomeComponent, data: {title: "首页"}},
    {path: "exception", loadChildren: () => import( "./exception/exception.module").then(m => m.ExceptionModule)},
    {path: "site/:url", component: SiteComponent},
    {
        path: "build",
        loadChildren: () => import('../build/erupt/erupt.module').then(m => m.EruptModule),
    },
    {
        path: "bi/:name",
        loadChildren: () => import( "../build/bi/bi.module").then(m => m.BiModule),
        pathMatch: "full"
    },
    {
        path: "tpl/:name",
        pathMatch: "full",
        loadChildren: () => import( "../build/tpl/tpl.module").then(m => m.TplModule)
    },
    {
        path: 'tpl/:name/:name1',
        pathMatch: "full",
        loadChildren: () => import( "../build/tpl/tpl.module").then(m => m.TplModule)
    },
    {
        path: 'tpl/:name/:name2/:name3',
        pathMatch: "full",
        loadChildren: () => import( "../build/tpl/tpl.module").then(m => m.TplModule)
    },
    {
        path: 'tpl/:name/:name2/:name3/:name4',
        pathMatch: "full",
        loadChildren: () => import( "../build/tpl/tpl.module").then(m => m.TplModule)
    }
];

export const routes: Routes = [
    // erupt
    {
        path: "",
        component: LayoutEruptComponent,
        children: coreRouter
    },
    // passport
    {
        path: "passport",
        component: LayoutPassportComponent,
        children: [
            {path: "login", component: UserLoginComponent, data: {title: "Login"}},
        ]
    },
    // 全屏布局
    {
        path: "fill",
        component: FillComponent,
        children: coreRouter
    },
    // 单页不包裹Layout
    // {path: "lock", component: UserLockComponent, data: {title: "锁屏", titleI18n: "lock"}},
    {path: "403", component: Exception403Component, data: {title: "403"}},
    {path: "404", component: Exception404Component, data: {title: "404"}},
    {path: "500", component: Exception500Component, data: {title: "500"}},
    {path: "**", redirectTo: ""}
];
