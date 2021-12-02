import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  styleUrls: ['./admin-login.page.scss'],
})
export class AdminLoginPage implements OnInit {


  username : "";
  password : "";
  T_SVC:any;
  notificationCount = 0 ;
  constructor(public navCtrl: NavController,
    private apiProvider: RestProvider,
    private alertCtrl : AlertController,
    private translate: TranslateService,
    private router: Router,
    private events: EventsService) {

      this.translate.get(['ADMIN_LOGIN.TITLE', 'ADMIN_LOGIN.USERNAME',
      'ADMIN_LOGIN.PASSWORD',
      'ADMIN_LOGIN.LOGIN',
      'ADMIN_LOGIN.INVALID_ADMIN_LOGIN',
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'COMMON.OK','COMMON.CANCEL']).subscribe(t => {
        this.T_SVC = t;
      });

      events.observeDataCompany().subscribe(async (data1: any) => {
				console.log("Notification Received: " + data1);
        if (data1.action === 'NotificationReceived') {
          this.showNotificationCount();
        }

			});
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter AdminLoginPage');
    this.events.publishDataCompany({
      action: "page",
      title: "Admin",
      message: ''
    });
    this.showNotificationCount();
  }

  showNotificationCount(){
    var count = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
    if(count){
      this.notificationCount = parseInt(count);
    }
  }


  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  proceedToNextStep(){
    var params1 = {
      "UserName": this.username,
      "Password": this.password
    };
    this.apiProvider.VimsAdminLogin(params1).then(
      (val) => {
        var adminData = {
          "LOGIN_TYPE": "Admin",
          "users_Name": JSON.parse(val.toString()).users_Name
        }
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.LOGIN_TYPE,JSON.stringify(adminData));
        this.events.publishDataCompany({
          action: 'user:created',
          title: "AdminEnabled",
          message: "AdminEnabled"
        });
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }

        var message = "";
        if(err && err.message.indexOf("Http failure response for") > -1){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            cssClass: '',
            message: message,
            buttons: ['Okay']
          });
            alert.present();
            return;
        }


        let invalidORGConfirm = await this.alertCtrl.create({
          header: this.T_SVC['ADMIN_LOGIN.TITLE'],
          cssClass: '',
          message: "<span class='failed'>" + this.T_SVC['ADMIN_LOGIN.INVALID_ADMIN_LOGIN'] + '</span>',
          buttons: [
            {
              text: this.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        invalidORGConfirm.present();
      }
    );
  }

  ngOnInit() {
  }

}
