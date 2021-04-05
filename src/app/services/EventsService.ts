import { Injectable } from "@angular/core";
import { Subject } from "rxjs";


@Injectable()

export class EventsService {

  private dataCompanySubject = new Subject();

  publishDataCompany(data: any) {
    this.dataCompanySubject.next(data);
  }

  observeDataCompany() {
    return this.dataCompanySubject;
  }
}
