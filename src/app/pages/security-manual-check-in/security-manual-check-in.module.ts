import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityManualCheckInPageRoutingModule } from './security-manual-check-in-routing.module';
import { SecurityManualCheckInPage } from './security-manual-check-in.page';
import { TranslateModule } from '@ngx-translate/core';
import { ItemChecklistModalComponent } from 'src/app/components/item-checklist-modal/item-checklist-modal.component';
import { DocumentModalComponent } from 'src/app/components/document-modal/document-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    SecurityManualCheckInPageRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [SecurityManualCheckInPage, DocumentModalComponent,ItemChecklistModalComponent],
  entryComponents:[DocumentModalComponent,ItemChecklistModalComponent]
})
export class SecurityManualCheckInPageModule {}
