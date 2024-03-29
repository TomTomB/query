import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  InfinityQueryDirective,
  InfinityQueryTriggerDirective,
  QueryDirective,
} from '@tomtomb/query-angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    QueryDirective,
    InfinityQueryDirective,
    InfinityQueryTriggerDirective,
    RouterModule.forRoot([]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
