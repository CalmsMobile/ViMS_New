import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { LoadingController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-question-doc-popup',
  templateUrl: './question-doc-popup.component.html',
  styleUrls: ['./question-doc-popup.component.scss'],
})
export class QuestionDocPopupComponent implements OnInit {
  result: any = [];
  type = '';
  constructor(
    public navParams: NavParams,
    private androidPermissions: AndroidPermissions,
    private fileOpener: FileOpener,
    private transfer: FileTransfer, private file: File,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCntrl: ModalController) {
      this.result = navParams.data.data.result;
      this.type = navParams.data.data.type;
      console.log("Passdata: " + JSON.stringify(this.result));
     }

     dismiss() {
       this.modalCntrl.dismiss();
     }

     downloadFile(doc){
      const fileTransfer: FileTransferObject = this.transfer.create();
      let url = doc.DocPath;
      if (url) {
        url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/FS/' + url;
      }

    var path = this.file.externalRootDirectory;
    if(!path){
      path = (this.file.externalDataDirectory || this.file.dataDirectory);
    }
    var targetPath = path + 'Pictures/' + doc.DocPath;

    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
      result =>{
        console.log('Has permission?',result.hasPermission)
        if(result.hasPermission){
          this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
            async result =>{
              let loading = await this.loadingCtrl.create({
                message: 'downloading...Please wait...'
              });
              loading.present();
              console.log('Has permission?',result.hasPermission);
              fileTransfer.download(url, targetPath).then((entry) => {
                loading.dismiss();
                this.fileOpener.showOpenWithDialog('path/to/file.pdf', 'application/pdf')
              .then(() => console.log('File is opened'))
              .catch(async e => {
                console.log('Error opening file', e);
                let toast = await this.toastCtrl.create({
                  message: 'Error',
                  duration: 3000,
                  color: 'primary',
                  position: 'bottom',
                });
                toast.present();
              });
              }, async (error) => {
                // handle error
                loading.dismiss();
                console.log(""+error);
                let toast = await this.toastCtrl.create({
                  message: 'Download Error',
                  duration: 3000,
                  position: 'bottom',
                  color: 'primary'
                });
                toast.present();
                console.log("Download Error: "+ error);
              });
            } ,
            err => {
              this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE);
            }
          );
        }else{
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
        }
      } ,
      err => {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
      }
    );

     }
  ngOnInit() {}

}
