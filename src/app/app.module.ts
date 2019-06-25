import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { LoginComponent } from './user/login/login.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ChatModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    UserModule,
    RouterModule.forRoot([
      {path: 'login', component:LoginComponent, pathMatch:'full'},
      {path:'', redirectTo:'login', pathMatch:'full' },
      {path:'*', component:LoginComponent},
      {path:'**', component:LoginComponent}
    ])

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
