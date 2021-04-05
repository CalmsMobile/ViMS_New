import {Injectable} from '@angular/core';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Observable } from 'rxjs';
import { AppSettings} from '../services/app-settings';

@Injectable()
export class SettingsService {
    constructor(private spinnerDialog:SpinnerDialog){}
    private dataAllBasicSetup = (): any => {
        return {
            "language": {
                "title" : "SETTINGS.APP_LANGUAGE",
                "subTitle" : "SETTINGS.SELECT_LANGUAGE",
                "selectedItem": AppSettings.DEFAULT_LANGUAGE_ID.id,
                "items" : AppSettings.AVAILABLE_LANGUAGE
            }
        }
    }
    public getAllBasicSetup = (): Observable<any> => {
        this.spinnerDialog.show(null, "Loading");
        return new Observable(observer => {
            this.spinnerDialog.hide();
            observer.next(this.dataAllBasicSetup());
            observer.complete();
          });
    }
}
