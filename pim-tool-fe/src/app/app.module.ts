import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ListProjectComponent } from './component/list-project/list-project.component';
import { ProjectDetailComponent } from './component/project-detail/project-detail.component';
import { AppRoutingModule } from './app-routing.module';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxTranslateModule } from './translate/translate.module';
@NgModule({
  declarations: [AppComponent, ListProjectComponent, ProjectDetailComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([]),
    AppRoutingModule,
    NgbPaginationModule,
    MatDialogModule,
    NgxTranslateModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
