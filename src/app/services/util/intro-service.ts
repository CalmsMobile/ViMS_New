import { Injectable } from '@angular/core';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { Observable } from 'rxjs';

@Injectable()
export class IntroService{
    constructor(private spinnerDialog: SpinnerDialog) {}

    getData = (): any => {
        return {
          'btnPrev': 'Previous',
          'btnNext': 'Next',
          'btnFinish': 'Finish',
          'items': [
                {
                    logo: 'assets/images/x-icon/qr-code.png',
                    title: 'Appointment QR Code',
                    description: 'Every appointments has create a individual QR Code, and managed by that QR Code.'
                },
              {   logo: 'assets/images/x-icon/visitor-reuse.png',
                  title: 'Manage Visitors',
                  description: 'Create-Edit-Delete Visitors, Book Appointment using existing Visitors !'
              },
              {
                  logo: 'assets/images/x-icon/shareVisitor.png',
                  title: 'Share Visitor Contacts',
                  description: 'Share Visitor contacts with Co-Host and Admin.'
              },
              {
                  logo: 'assets/images/x-icon/chat.png',
                  title: 'Chat',
                  description: 'Host can chat with Visitors, Co-Host and Admin.'
              },
              {
                logo: 'assets/images/x-icon/report.png',
                title: 'Appointment History',
                description: 'Host can manage Booked and all Upcoming Appointments.'
            }
          ]
      };
    }

    load(): Observable<any> {
        this.spinnerDialog.show(null, "Loading");
        return new Observable(observer => {
            this.spinnerDialog.hide();
            observer.next(this.getData());
            observer.complete();
        });
    };
}
