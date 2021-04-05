import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { NavController, AlertController, Platform, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-notiification-view',
  templateUrl: './notiification-view.page.html',
  styleUrls: ['./notiification-view.page.scss'],
})
export class NotiificationViewPage implements OnInit {

  notification : any ;
  db : SQLiteObject = null;
  T_SVC:any;

  constructor(public navCtrl: NavController,
    private sqlite: SQLite,
    private alertCtrl: AlertController,
    private apiProvider : RestProvider,
    private platform : Platform,
    private route: ActivatedRoute,
    private router: Router,
    private translate:TranslateService,
    private events : EventsService,
    public navParams: NavParams) {
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          this.notification = passData.notification
        }
      });

    this.translate.get([
			'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
				this.T_SVC = t;
		});
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter NotiificationViewPage');
    this.UpdateReadNotificationStatus();

  }

  ionViewWillEnter(){
		this.events.publishDataCompany({
      action:"page",
      title:  "NotificationPage",
      message: ''
    });
	}

  UpdateReadNotificationStatus(){


    var params = {
    "PNHistory":this.notification.PNHistory
    };
    // this.VM.host_search_id = "adam";
    this.apiProvider.UpdateReadNotificationStatus(params).then(
      (val) => {

        if(!this.platform.is('cordova')) {
          console.log("This is browser...SQLite not available");
        }else{
          this.sqlite.create({name: AppSettings.LOCAL_DB,location: 'default'}).then((db: SQLiteObject) => {
            this.db = db;
            var sQuery1 = "UPDATE "+AppSettings.DATABASE.TABLE.Notification + " set " + AppSettings.DATABASE.NOTIFICATION.IsRead + " = 'true' where " + AppSettings.DATABASE.NOTIFICATION.PNHistory + " = '"+this.notification.PNHistory+"'";
            db.executeSql(sQuery1, []).then((data) => {
              console.log("SQLite available : Updated read status :"+ data);
            }, (e) => {
                console.log("Errot: " + JSON.stringify(e));
            });
          });
        }
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else {
          try{
            if(err && JSON.parse(err) && JSON.parse(err).message){
              message =JSON.parse(err).message;
            }
          }catch(e){
            if(err && err.message){
              message = err.message;
            }
          }

        }
        if(message){
          // message = " Unknown"
          let alert = this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass:'alert-danger',
            buttons: ['Okay']
            });
            (await alert).present();
          }
      }
    );
  }

  ngOnInit() {
  }

}
