import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { environment } from "@env/environment";
// layout
import { LayoutDefaultComponent } from "../layout/default/default.component";
import { LayoutPassportComponent } from "../layout/passport/passport.component";
// dashboard pages
import { DashboardComponent } from "./dashboard/dashboard.component";
// passport pages
import { UserLoginComponent } from "./passport/login/login.component";
import { UserRegisterComponent } from "./passport/register/register.component";
import { UserRegisterResultComponent } from "./passport/register-result/register-result.component";
// single pages
import { CallbackComponent } from "./callback/callback.component";
import { UserLockComponent } from "./passport/lock/lock.component";
import { Exception403Component } from "./exception/403.component";
import { Exception404Component } from "./exception/404.component";
import { Exception500Component } from "./exception/500.component";
import { PageComponent } from "./page/page.component";

const routes: Routes = [
  {
    path: "",
    component: LayoutDefaultComponent,
    children: [
      { path: "", redirectTo: "page/home.html", pathMatch: "full" },
      { path: "dashboard", component: DashboardComponent, data: { title: "仪表盘", titleI18n: "dashboard" } },
      { path: "build/table/:name", loadChildren: "../build/table/table.module#TableModule", pathMatch: "full" },
      { path: "build/tree/:name", loadChildren: "../build/tree/tree.module#TreeModule", pathMatch: "full" },
      { path: "page/:name", component: PageComponent, pathMatch: "full" },
      { path: "layout/403", component: Exception403Component, data: { title: "403" } },
      { path: "layout/404", component: Exception404Component, data: { title: "404" } },
      { path: "layout/500", component: Exception500Component, data: { title: "500" } }
    ]
  },
  // 全屏布局
  // passport
  {
    path: "passport",
    component: LayoutPassportComponent,
    children: [
      { path: "login", component: UserLoginComponent, data: { title: "登录", titleI18n: "login" } },
      { path: "register", component: UserRegisterComponent, data: { title: "注册", titleI18n: "register" } },
      {
        path: "register-result",
        component: UserRegisterResultComponent,
        data: { title: "注册结果", titleI18n: "register-result" }
      }
    ]
  },
  // 单页不包裹Layout
  { path: "callback/:type", component: CallbackComponent },
  { path: "lock", component: UserLockComponent, data: { title: "锁屏", titleI18n: "lock" } },
  { path: "403", component: Exception403Component },
  { path: "404", component: Exception404Component },
  { path: "500", component: Exception500Component },
  { path: "**", redirectTo: "dashboard" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: environment.useHash })],
  exports: [RouterModule]
})
export class RouteRoutingModule {
}
