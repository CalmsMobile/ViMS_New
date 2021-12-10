import { Injectable } from "@angular/core";
import { Subject } from "rxjs";


@Injectable()

export class EventsServiceNotification {

  private dataCompanySubjectNew = new Subject();

  publishDataCompany(data: any) {
    this.dataCompanySubjectNew.next(data);
  }

  observeDataCompany() {
    return this.dataCompanySubjectNew;
  }

  clearObserve() {
    this.dataCompanySubjectNew = new Subject();
  }
}
