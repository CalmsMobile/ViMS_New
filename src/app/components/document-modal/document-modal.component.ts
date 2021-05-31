import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Camera } from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-document-modal',
  templateUrl: './document-modal.component.html',
  styleUrls: ['./document-modal.component.scss'],
})
export class DocumentModalComponent  {

  base64Image = "";
  data: any = {
    "coverImage": "assets/images/profile_bg.jpg",
    "profile": ""
  };

  constructor(private modalctrl : ModalController,
    private camera: Camera,
    ) { }
  
  dismissModal() {
    this.modalctrl.dismiss();
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
    }, (err) => {
    });
  }

}
