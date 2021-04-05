import { Injectable} from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable()
export class ToastService{

    constructor(public toastCtrl: ToastController){}
    create(message, ok = false, duration = 2000, position = 'bottom' ){
        if(this.toastCtrl){
            this.toastCtrl.dismiss();
        }
        this.toastCtrl.create({
            message,
            duration: ok ? null: duration,
            position : 'bottom',
            keyboardClose: ok
        });
    }
}
