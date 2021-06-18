import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.scss'],
})
export class ViewImageComponent implements OnInit {
  appSettings: any = {};
  base64Image = "";
  constructor(private modalctrl : ModalController, public navParams: NavParams) {
    const ackSeettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
      if (ackSeettings) {
        this.appSettings = JSON.parse(ackSeettings);
      }
      this.base64Image = navParams.data.data;
  }

  ngOnInit() {}
  dismissModal() {
    this.modalctrl.dismiss();
  }
}
