import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'util-popup-wizard',
  templateUrl: 'util-popup-wizard.html'
})
export class UtilPopupWizardComponent {

  pop_type: string = "info";
  pop_data:any;
  pop_types = {
    "error_no_internet":{
      "title":"COMMON.MSG.NO_INTERNET",
      "subtitle":"COMMON.MSG.NO_INTERNET_DETAIL",
      "btn_ok_txt":"COMMON.OK",
      "btn_ok_event":this.dismissModal,
      "btn_cancel_txt":"COMMON.CANCEL",
      "btn_cancel_event":this.dismissModal,
    },
    "error_server_connection":{
      "title":"COMMON.MSG.ERR_SERVER_CONCTN",
      "subtitle":"COMMON.MSG.ERR_SERVER_CONCTN_DETAIL",
      "btn_ok_txt":"COMMON.OK",
      "btn_ok_event":this.dismissModal,
      "btn_cancel_txt":"COMMON.CANCEL",
      "btn_cancel_event":this.dismissModal,
    }
  }
  constructor(params: NavParams, public viewCtrl: ModalController) {
    this.pop_type = params.data.data.pop_type;
    if(this.pop_type != "common"){
      this.pop_data = this.pop_types[this.pop_type];
    }
  }
  dismissModal() {
    this.viewCtrl.dismiss();
  }
}
