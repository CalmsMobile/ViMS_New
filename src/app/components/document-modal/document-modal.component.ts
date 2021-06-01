import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Camera } from '@ionic-native/camera/ngx';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-document-modal',
  templateUrl: './document-modal.component.html',
  styleUrls: ['./document-modal.component.scss'],
})
export class DocumentModalComponent  {
  appSettings: any = {};
  base64Image = "";
  data: any = {
    "coverImage": "assets/images/profile_bg.jpg",
    "profile": ""
  };
  attachmentList = [];
  constructor(private modalctrl : ModalController,
    private camera: Camera,
    public navParams: NavParams) {
      const ackSeettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
      if (ackSeettings) {
        this.appSettings = JSON.parse(ackSeettings);
      }
      this.attachmentList = navParams.data.data  ? navParams.data.data : [];
    }

  dismissModal() {
    this.modalctrl.dismiss();
  }
  public capture(position){
    this.takePicture(position);
  }

  proceed() {
    this.modalctrl.dismiss(this.attachmentList);
  }

  removeDoc(position) {
    this.attachmentList.splice(position, 1);
  }

  public takePicture(position) {
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

      this.data.profile = imageData;
      this.attachmentList[position] = imageData;
    }, (err) => {
    });
  }

}
