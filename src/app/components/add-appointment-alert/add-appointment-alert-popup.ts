import { Component } from '@angular/core';
import {AppSettings} from '../../services/app-settings'
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

/**
 * Generated class for the AddAppointmentAlertPopupComponent, component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'add-appointment-alert-popup',
  templateUrl: 'add-appointment-alert-popup.html'
})
export class AddAppointmentAlertPopupComponent {

  text: string;
  reaponseArray: any = [];
  imageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  hoursMinutes = new Date().toString().split(':');
  imageURLType = '&RefType=VPB&Refresh='+ new Date().getTime();
  newImage = "&tes='test'";

  constructor(public viewCtrl: ModalController,
    public toastCtrl: ToastController,
    // private platform: Platform,
    public socialSharing: SocialSharing,
    public navParams: NavParams) {
      this.reaponseArray = navParams.data.data;


  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  share(){

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    var hostName = "";
    if(hostData){
      hostName = JSON.parse(hostData).HOSTNAME;
    }

  }

}
