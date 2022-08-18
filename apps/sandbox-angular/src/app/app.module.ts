import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { QueryDirective } from '@tomtomb/query-angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, QueryDirective],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
