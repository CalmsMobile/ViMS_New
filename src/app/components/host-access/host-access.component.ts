import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-host-access',
  templateUrl: './host-access.component.html',
  styleUrls: ['./host-access.component.scss'],
})
export class HostAccessComponent implements OnInit, OnDestroy {
  qrCodePath = '';
  TIMEOUT = 0;
  INTERVAL: any;
  constructor(private modal: ModalController) {
    this.resetValues();
   }
  ngOnDestroy() {
    clearInterval(this.INTERVAL);
  }

  ngOnInit() {

  }

  resetValues() {
    const hostAccessSettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_ACCESS_SETTINGS);
    if (hostAccessSettings) {
      const hA = JSON.parse(hostAccessSettings);
      let key = '';
      if (hA.IsDynamicKey) {
        key = hA.DynamicCode;
      } else {
        key = hA.HostCardSerialNo;
      }
      const timeout1 = localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_ACCESS_TIMEOUT);
      this.TIMEOUT = timeout1 ? (+timeout1): hA.QRCodeValidity;
      this.qrCodePath = hA.DataString;
      this.INTERVAL = setInterval(() => {
        this.TIMEOUT = this.TIMEOUT - 1;
        console.log("resetValues host access::" + this.TIMEOUT);
        if (this.TIMEOUT <= 0) {
          clearInterval(this.INTERVAL);
          this.resetValues();
        }
      }, 1000);
    }
  }

  closeModal() {
    clearInterval(this.TIMEOUT);
    this.modal.dismiss();
  }



}
