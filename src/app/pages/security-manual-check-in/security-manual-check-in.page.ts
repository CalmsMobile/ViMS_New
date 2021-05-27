import { Component, OnInit } from '@angular/core';
import {ModalController,AlertController,ToastController} from '@ionic/angular';
import { RestProvider } from 'src/app/providers/rest/rest';
import { QuestionDocPopupComponent } from 'src/app/components/question-doc-popup/question-doc-popup.component';
import { Camera } from '@ionic-native/camera/ngx';
import {AppSettings} from '../../services/app-settings';

@Component({
  selector: 'app-security-manual-check-in',
  templateUrl: './security-manual-check-in.page.html',
  styleUrls: ['./security-manual-check-in.page.scss'],
})
export class SecurityManualCheckInPage implements OnInit {
  
  appointment : any;

  T_SVC:any;
  autoApproval: any = false;
  showOption = false;
  isPastAppointment = false;
  base64Image = "";
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage": "assets/images/profile_bg.jpg",
    "profile": ""
  };
  visitor_RemoveImg = true;
  hostSettings : any = {};

  
  constructor(public apiProvider: RestProvider,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private camera: Camera,
    public toastCtrl: ToastController,) { }

  ngOnInit() {
  }

  async showAlert(msg) {
    let alert = this.alertCtrl.create({
      header: 'Notification',
      message: msg,
      cssClass:'alert-danger',
      buttons: ['Okay']
      });
      (await alert).present();
  }

  async openCustomDialog(action) {
    let api = '/api/Vims/GetVisitorQuestionariesByAppointmentId';
    if (action === 'doc') {
      api = '/api/Vims/GetVisitorDocsBySeqId';
    } else if (action === 'declaration'){
      api = '/api/vims/GetVisitorItemChecklistBySeqId';
    }

    var params = {
      "SEQ_ID": this.appointment[0].VisitorBookingSeqId,
      "STAFF_IC": this.appointment[0].STAFF_IC
  };
  // this.VM.host_search_id = "adam";
  this.apiProvider.requestApi(params, api, true, '').then(
    async (val) => {
      var result = JSON.parse(val.toString());
      if (result.Table && result.Table.length > 0) {
        const presentModel = await this.modalCtrl.create({
          component: QuestionDocPopupComponent,
          componentProps: {
            data: {
              seqId: this.appointment[0].VisitorBookingSeqId,
              result: result.Table,
              type: action
            }
          },
          showBackdrop: true,
          mode: 'ios',
          cssClass: 'visitorPopupModal'
        });
        presentModel.onWillDismiss().then((data) => {
        });
        return await presentModel.present();

      } else {
        let msg = 'Questionaries not added.';
        if (action === 'doc') {
          msg = 'Verification document not added.';
        } else if (action === 'declaration'){
          msg = 'Declaration not added.';
        }
        this.showAlert(msg);
      }
      },
    async (err) => {

      if(err && err.message == "No Internet"){
        return;
      }
      var message = "";
      if (err.status) {
        message = 'Api Not Found';
      } else if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
        message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
      } else if(err && JSON.parse(err) && JSON.parse(err).message){
        message =JSON.parse(err).message;
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

  private async presentToast(text) {
    let toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      color: 'primary',
      position: 'bottom'
    });
    toast.present();
  }

  public capture(){
    this.takePicture(this.camera.PictureSourceType.CAMERA);
  }

  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      // destinationType: this.camera.DestinationType.FILE_URI,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      allowEdit: true,
      targetWidth: 400,
      targetHeight: 400
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imageData) => {

      this.base64Image = 'data:image/jpeg;base64,' + imageData;
      this.data.profile = imageData;
      this.visitor_RemoveImg = false;
    }, (err) => {
    });
  }
}
