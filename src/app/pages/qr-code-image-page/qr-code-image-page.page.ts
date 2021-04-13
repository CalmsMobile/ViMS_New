import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-qr-code-image-page',
  templateUrl: './qr-code-image-page.page.html',
  styleUrls: ['./qr-code-image-page.page.scss'],
})
export class QrCodeImagePagePage implements OnInit {

  qrCodeString = "";
  VisitorName = "";
  appSettings : any = {};
  constructor(public navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private events : EventsService) {

      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          var data = passData.data;
          this.VisitorName = JSON.parse(data).VisitorName;
          var RefSlno = "4445fF";
          if(data && JSON.parse(data)){
            var column = this.appSettings.ACSQrCodeField;
            RefSlno = JSON.parse(data)[column];
          }
          this.qrCodeString = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=' + RefSlno + '&RefType=QR&Refresh='+ new Date().getTime();

        }
      });


    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS);
    if(settings && JSON.parse(settings)){
      this.appSettings = JSON.parse(settings);
    }else{
      this.appSettings = {
        "ACSQrCodeField": "att_card_id"
      }
    }
    setTimeout(() => {
      this.finishProcess();
    }, AppSettings.IdleListenBufferTime);
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter QrCodeImagePage');
  }

  ionViewWillLeave(){
    this.events.publishDataCompany({
      action: 'user:created',
      title: "CheckIn Acknowledgment",
      message: "CheckIn Acknowledgment"
    });
  }

  finishProcess(){
    this.navCtrl.pop();
  }

  ngOnInit() {
  }

}
