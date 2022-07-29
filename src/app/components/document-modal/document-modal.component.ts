import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Camera } from '@ionic-native/camera/ngx';
import { AppSettings } from 'src/app/services/app-settings';
import { RestProvider } from 'src/app/providers/rest/rest';

@Component({
  selector: 'app-document-modal',
  templateUrl: './document-modal.component.html',
  styleUrls: ['./document-modal.component.scss'],
})
export class DocumentModalComponent  {
  appSettings: any = {};
  base64Image = "";
  attachmentList = [];
  isViewOnly = false;
  constructor(private modalctrl : ModalController,
    private camera: Camera,
    private apiProvider: RestProvider,
    public navParams: NavParams) {
      const ackSeettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
      if (ackSeettings) {
        this.appSettings = JSON.parse(ackSeettings);
      }
      this.attachmentList = navParams.data.data  ? navParams.data.data : [];
      this.isViewOnly = navParams.data.type === 'VIEW_ONLY';
      if (this.isViewOnly) {
        this.appSettings.addVisitor.additionalDocLimit = this.attachmentList.length;
      }
    }

  dismissModal() {
    this.modalctrl.dismiss();
  }
  public capture(position){
    if (this.isViewOnly) {
      this.apiProvider.viewImage('data:image/jpeg;base64,'+ this.attachmentList[position]);
    }else {
      this.takePicture(position);
    }

  }

  proceed() {
    this.modalctrl.dismiss(this.attachmentList);
  }

  removeDoc(position) {
    if (!this.isViewOnly) {
      this.attachmentList.splice(position, 1);
    }
  }

  public takePicture(position) {
    const cClass = this;
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      // destinationType: this.camera.DestinationType.FILE_URI,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      allowEdit: false,
      targetWidth: 400,
      targetHeight: 400
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imageData) => {
      cClass.attachmentList[position] = imageData;
    }, (err) => {

      if (err === 'cordova_not_available'){
        cClass.attachmentList[position] = AppSettings.SAMPLE_PHOTO;
      }

    });
  }

}
