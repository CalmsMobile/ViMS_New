import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { Contacts } from '@ionic-native/contacts/ngx';
import { File } from '@ionic-native/file/ngx';
import { NavController, AlertController, ActionSheetController, ToastController, Platform, IonContent, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CountryComponentComponent } from 'src/app/components/country-component/country-component.component';
import { VisitorInfoModal } from 'src/app/model/visitorInfoModal';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { CommonUtil } from 'src/app/services/util/CommonUtil';
declare var cordova: any;
@Component({
  selector: 'app-add-visitors',
  templateUrl: './add-visitors.page.html',
  styleUrls: ['./add-visitors.page.scss'],
})
export class AddVisitorsPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent;
  active: boolean = true;
  loaded = false;
  lastImage: string = null;
  loading:any;
  visitor_RemoveImg = false;
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage":"assets/images/profile_bg.jpg",
    "profile":"",
    "contact":""
  };
  VM = {
    "aData":{},
    "visitors":[]
  };
  imageType = "&RefType=VP&Refresh="+ new Date().getTime();
  changeMaster = false;
  fromAppointmentPage  = false;
  disableIc = false;
  visitorInfoModal = new VisitorInfoModal();
  public error: string;
  visitorProfile:FormGroup;
  base64Image:any = "";
  hostSettings : any = {};
  visitor:any = {};
  visitorSEQID = "0";
  GenderList = [
    {"name": "Female", "value": "0"},
  {"name": "Male", "value": "1"},
  {"name": "Other", "value": "2"}
  ]
  T_SVC:any;

  ngOnDestroy(): void {
    this.events.clearObserve();
  }

  constructor(public navCtrl: NavController,
    private route: ActivatedRoute,
    private translate:TranslateService,
    public apiProvider: RestProvider,
    private alertCtrl: AlertController,
    private popoverController: ModalController,
    private camera: Camera,
    private _zone : NgZone,
    private commonUtil: CommonUtil,
    private file: File,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public platform: Platform,
    public events: EventsService,
    private contacts: Contacts,
    private router: Router) {
      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
        'ALERT_TEXT.IMAGE_SELECT_ERROR', 'ALERT_TEXT.SELECT_VISITOR_COUNTRY',
        'ALERT_TEXT.VISITOR_UPDATED', 'ALERT_TEXT.SELECT_VISITOR_IMAGE',
        'ALERT_TEXT.SELECT_VISITOR_COMPANY', 'ADD_VISITORS.SUCCESS.ADD_VISITOR_COMPANY_SUCCESS',
        'ADD_VISITORS.SUCCESS.ADD_VISITOR_SUCCESS', 'USER_PROFILE.ERROR.SERVER_ERROR'
      ]).subscribe(t => {
          this.T_SVC = t;
      });
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          this.visitor = passData.visitor;
          this.changeMaster = passData.changeMaster;
          this.fromAppointmentPage = passData.fromAppointmentPage;

          if(this.visitor){
            console.log("visitor: "+ JSON.stringify(this.visitor));
            this.visitorInfoModal.visitor_id = this.visitor.visitor_id;
            if(this.visitor.visitor_id && !this.visitor.VISITOR_IC){
              this.visitor.visitor_ic = this.visitor.visitor_id;
            }
            if(!this.visitor.visitor_id && this.visitor.visitor_ic){
              this.visitor.visitor_id = this.visitor.VISITOR_IC;
            }
            this.visitorInfoModal.visitor_ic = this.visitor.VISITOR_IC;
            if(this.visitor.VISITOR_IC){
              this.disableIc = true;
            }
            this.visitorInfoModal.visitor_ctg_name = this.visitor.VisitorCategory;
            this.visitorInfoModal.visitor_ctg_id = this.visitor.VisitorCategory_ID;
            this.visitorInfoModal.visitor_comp_id = this.visitor.VISITOR_COMPANY_ID;
            this.visitorInfoModal.visitor_comp = this.visitor.VISITOR_COMPANY;
            this.visitorInfoModal.visitor_comp_name = this.visitor.VISITOR_COMPANY_NAME;
            this.visitorInfoModal.visitor_name = this.visitor.VISITOR_NAME;
            this.visitorInfoModal.visitor_gender = this.visitor.VISITOR_GENDER;
            this.visitorInfoModal.vehicle_no = this.visitor.PLATE_NUM;
            this.visitorInfoModal.visitor_mobile_no = this.visitor.TELEPHONE_NO;
            this.visitorInfoModal.visitor_email = this.visitor.EMAIL;
            this.visitorInfoModal.visitor_id = this.visitor.VISITOR_IC;
            this.visitorSEQID = this.visitor.SEQ_ID;
            this.visitorInfoModal.VisitorBookingSeqId = this.visitor.VisitorBookingSeqId;
            this.visitorInfoModal.visitor_address = this.visitor.Address;
            this.visitorInfoModal.visitor_country = this.visitor.Country;
            if (this.visitorInfoModal.visitor_country) {
              CommonUtil.countryList.forEach(element => {
                if (element.code === this.visitorInfoModal.visitor_country) {
                  this.visitorInfoModal.visitor_country_name = element.name;
                  return;
                }
              });
            }

            if(this.visitor.VisitorBookingSeqId){
              this.imageType = "&RefType=VP&Refresh="+ new Date().getTime();
            }
            this.data.profile = this.visitor.VISITOR_IMG ? this.visitor.VISITOR_IMG : "";
            if(this.visitor.VISITOR_IMG){
              this.base64Image = 'data:image/jpeg;base64,' + this.data.profile;
            }
          }

          var visitor_company = passData.data;
          if(visitor_company){
            this.VM.visitors = visitor_company;
            this.VM.aData = passData.aData;
          }
          if(passData.addVisitorSettings){
            try {
              this.hostSettings = JSON.parse(JSON.parse(passData.addVisitorSettings).addVisitorSettings);
            } catch (error) {
              this.hostSettings = JSON.parse(passData.addVisitorSettings);
            }
          }
          let EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
          this.visitorProfile = new FormGroup({
            username: new FormControl('', (this.hostSettings && this.hostSettings.NameEnabled && this.hostSettings.NameRequired) ? ([Validators.required, Validators.minLength(2), Validators.maxLength(100)]): []),
            email: new FormControl('', (this.hostSettings && this.hostSettings.EmailEnabled && this.hostSettings.EmailRequired) ? ([Validators.required, Validators.pattern(EMAILPATTERN)]) : []),
            icPassport: new FormControl('', (this.hostSettings && this.hostSettings.IdProofEnabled && this.hostSettings.IdProofRequired) ? ([Validators.required]) : []),
            contact: new FormControl('', (this.hostSettings && this.hostSettings.ContactNumberEnabled && this.hostSettings.ContactNumberRequired) ? ([Validators.required]) : []),
            vechile: new FormControl('', (this.hostSettings && this.hostSettings.VehicleNumberEnabled && this.hostSettings.VehicleNumberRequired) ? ([Validators.required]) : []),
            address: new FormControl('', (this.hostSettings && this.hostSettings.AddressEnabled && this.hostSettings.AddressRequired) ? ([Validators.required]) : []),
            gender: new FormControl('', (this.hostSettings && this.hostSettings.GenderEnabled && this.hostSettings.GenderRequired) ? ([Validators.required]) : [])
            //country: new FormControl('', [Validators.pattern('[a-zA-Z0-9 ]*')]),
            //city: new FormControl('', [Validators.pattern('[a-zA-Z0-9 ]*')]),
          });

          events.observeDataCompany().subscribe(async (data: any) => {
            const user = data.title;
            const time = data.message;
          // events.observeDataCompany('user:created', (user, data) => {
            // user and time are the same arguments passed in `events.publish(user, time)`
            console.log('Welcome', user, 'at', time);
            // this.params.hostImage = "assets/images/logo/2.png";
            // alert(this.params.hostImage);
            if(data.action === 'user:created' && user == "visitorCompany"){
              var cData= JSON.parse(time);
              this.visitorInfoModal.visitor_comp_name = cData.visitor_comp_name;
              this.visitorInfoModal.visitor_comp_id = cData.visitor_comp_code;
              this.visitorInfoModal.visitor_comp = cData.visitor_comp_code;
            } else if (data.action === 'countrySelected') {
              if (data.message) {
                const countryData = JSON.parse(data.message);
                this.visitorInfoModal.visitor_country = countryData.code;
                this.visitorInfoModal.visitor_country_name = countryData.name;
              }
            }

          });
        }
      });
  }

  searchVisitorCompanyById(){
    var params = {"SearchString":"",
    "OffSet":"0",
    "Rows":"20000"};
    // this.VM.host_search_id = "adam";
    this.apiProvider.GetVisitorCompany(params).then(
      (val) => {
        var companyList = JSON.parse(val.toString());
      },
      (err) => {
      }
    );
  }

  getFileContentAsBase64(path, callback){
    this.file.resolveLocalFilesystemUrl(path).then(gotFile).catch(fail);

    function fail(e){
      alert('Cannot found contact image.');
    }

    function gotFile(fileEntry){
      fileEntry.file(function (file){
        var reader = new FileReader();
        reader.onloadend = function(e){
          var content = this.result;
          callback(content);
        }
        reader.readAsDataURL(file);
      });
    }
   }

   async onChangeCountry() {
      const popover = await this.popoverController.create({
        component: CountryComponentComponent,
        cssClass: 'my-custom-class',
        componentProps: {
          data: {
            countryTyped: this.visitorInfoModal.visitor_country
          }
        },
        showBackdrop: true,
        mode: 'ios'
      });
      await popover.present();
   }

   goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }
  getPhoneBookContact(){
    var currentClass = this;
    currentClass.contacts.pickContact().then((contacts) => {
      try{
        console.log(JSON.stringify(contacts));
        var resultOB = JSON.parse(JSON.stringify(contacts));
        this.visitorInfoModal.visitor_name = resultOB._objectInstance.displayName;
        if(resultOB._objectInstance.emails && resultOB._objectInstance.emails[0]){
          this.visitorInfoModal.visitor_email = resultOB._objectInstance.emails[0].value;
        }
        const phone = resultOB._objectInstance.phoneNumbers[0].value;
        if (phone) {
          this.visitorInfoModal.visitor_mobile_no = phone.replace(/[^\d.-]/g, '');
        }

        if(resultOB._objectInstance.organizations && resultOB._objectInstance.organizations[0]){
          this.visitorInfoModal.visitor_comp_name = resultOB._objectInstance.organizations[0].name;
          this.visitorInfoModal.visitor_comp_id = this.commonUtil.getCompany(this.visitorInfoModal.visitor_comp_name, true);;
          this.visitorInfoModal.visitor_comp = this.visitorInfoModal.visitor_comp_id;
          if (!this.visitorInfoModal.visitor_comp_id) {
            this.addVisitorsNewCompany(this.visitorInfoModal.visitor_comp_name);
          }

        }

        if(resultOB._objectInstance.addresses && resultOB._objectInstance.addresses[0]){
          this.visitorInfoModal.visitor_address = resultOB._objectInstance.addresses[0].formatted;
          CommonUtil.countryList.forEach(country => {
            // if (country.name === 'Malaysia'){
            //   console.log(country.name);
            // }
            if (this.visitorInfoModal.visitor_address.toLowerCase().indexOf(country.name.toLowerCase()) > -1) {
              this.visitorInfoModal.visitor_country = country.code;
              this.visitorInfoModal.visitor_country_name = country.name;
              const lengthofAddress = this.visitorInfoModal.visitor_address.toLowerCase().split(country.name.toLowerCase())[0].length
              this.visitorInfoModal.visitor_address = this.visitorInfoModal.visitor_address.substr(0,lengthofAddress)
            }
          });
        }

        if(resultOB._objectInstance.photos && resultOB._objectInstance.photos[0]){
          var uripath = resultOB._objectInstance.photos[0].value;
          this.getFileContentAsBase64(uripath,function (base64File) {
            console.log(base64File);
            currentClass._zone.run(function() {
              currentClass.data.profile = base64File.split(",")[1];
              currentClass.base64Image = base64File;
            });
           });
          // this.file.resolveLocalFilesystemUrl(uripath).then(filepath => {
          //   console.log(filepath.fullPath);

          //     this.data.profile = this.base64.encodeFile(filepath.nativeURL).then((base64File: string) => {
          //     console.log(base64File);
          //     this.data.profile = base64File;
          //     this.base64Image = 'data:image/jpeg;base64,' + this.data.profile;
          //   }, (err) => {
          //     console.log(err);
          //   });
          // }).catch((error) => {
          //   console.log(error);
          // })
          // var deferred = $q.defer();
          // this.filePath.resolveNativePath(uripath)
          // .then(filePath => {
          //   filePath = 'file://'+ filePath;
          //   this.visitor_RemoveImg = false;
          //   console.log(filePath);
          //     this.data.profile = this.base64.encodeFile(filePath).then((base64File: string) => {
          //     console.log(base64File);
          //     this.data.profile = base64File;
          //     this.base64Image = 'data:image/jpeg;base64,' + this.data.profile;
          //   }, (err) => {
          //     console.log(err);
          //   });
          // }).catch(err => {
          //   console.log(err);
          // });
        }


      }catch(e){

      }

    });
  }

  public async presentActionSheet() {
    if(this.hostSettings && this.hostSettings.ImageUploadEnabled){
      var option = [{
        text: 'Gallery',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
    if(this.base64Image || this.data.profile) {
      option = [{
        text: 'Gallery',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Remove Photo',
        handler: () => {
          this.visitor_RemoveImg = true;
          this.base64Image = '';
          this.data.profile = '';
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
    }
      let actionSheet = await this.actionSheetCtrl.create({
        header: 'Select Image Source',
        cssClass: '',
        buttons: option
      });
      actionSheet.present();
    }
  }

  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: sourceType,
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
      this.presentToast(this.T_SVC['ALERT_TEXT.IMAGE_SELECT_ERROR']);
    });
  }

// Create a new name for the image
private createFileName() {
  var d = new Date(),
  n = d.getTime(),
  newFileName =  n + ".jpg";
  return newFileName;
}

// Copy the image to a local folder
private copyFileToLocalDir(namePath, currentName, newFileName) {
  alert("namePath:"+namePath);
  alert("currentName:"+currentName);
  alert("newFileName:"+newFileName);
  this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
    this.lastImage = newFileName;
  }, error => {
    this.presentToast('Error while storing file.');
  });
}

private async presentToast(text) {
  let toast = await this.toastCtrl.create({
    message: text,
    color: 'primary',
    duration: 3000,
    position: 'top'
  });
  toast.present();
}

UpdateVisitor(){

  if(!this.visitor.SEQ_ID){
    this.visitor.SEQ_ID = "";
  }
  if(!this.visitor.visitor_oldicno){
    this.visitor.visitor_oldicno = "";
  }
  if(!this.visitor.visitor_tel_no){
    this.visitor.visitor_tel_no = "";
  }

  if(this.visitor_RemoveImg){
    this.data.profile = "";
  }

  var params = {
    "visitor_id": this.visitorInfoModal.visitor_id,
    "SEQ_ID": this.visitor.SEQ_ID,
    "visitor_ic": this.visitorInfoModal.visitor_ic,
    "visitor_ctg_id": this.visitorInfoModal.visitor_ctg_id,
    "visitor_ctg_name": this.visitorInfoModal.visitor_ctg_name,
    "visitor_comp_id": this.visitorInfoModal.visitor_comp_id,
    "visitor_comp": this.visitorInfoModal.visitor_comp_id,
    "visitor_comp_name": this.visitorInfoModal.visitor_comp_name,
    "visitor_oldicno": this.visitor.visitor_oldicno,
    "visitor_name": this.visitorInfoModal.visitor_name,
    "visitor_gender": this.visitorInfoModal.visitor_gender,
    "visitor_vehicle_no":this.visitorInfoModal.vehicle_no,
    "visitor_mobile_no": this.visitorInfoModal.visitor_mobile_no,
    "visitor_tel_no": this.visitor.visitor_tel_no,
    "visitor_email": this.visitorInfoModal.visitor_email,
    "visitor_image":this.data.profile,
    "Address": this.visitorInfoModal.visitor_address,
    "Country": this.visitorInfoModal.visitor_country,
    "visitor_RemoveImg": this.visitor_RemoveImg
  }
  var ImageChanged = (this.visitor.ImageChanged ? this.visitor.ImageChanged : 0);
  if(ImageChanged || this.visitor_RemoveImg || this.data.profile){
    ImageChanged = 1;
  }
  var visitorObj = {
    VISITOR_IC :params.visitor_ic,
    VISITOR_NAME:params.visitor_name,
    VISITOR_COMPANY:params.visitor_comp_id,
    VISITOR_COMPANY_NAME:params.visitor_comp_name,
    VISITOR_COMPANY_ID:params.visitor_comp_id,
    EMAIL:params.visitor_email,
    TELEPHONE_NO:params.visitor_mobile_no,
    VISITOR_GENDER:params.visitor_gender,
    VisitorDesignation: "",
    VisitorCategory:params.visitor_ctg_name,
    VisitorCategory_ID:params.visitor_ctg_id,
    VISITOR_IMG:this.data.profile,
    PLATE_NUM:params.visitor_vehicle_no,
    checked : true,
    visitor_RemoveImg : this.visitor_RemoveImg,
    SEQ_ID: this.visitor.SEQ_ID ? this.visitor.SEQ_ID : "",
    VisitorBookingSeqId : this.visitor.VisitorBookingSeqId,
    ImageChanged : ImageChanged,
    Address: params.Address,
    Country: params.Country
  }
  var action = this.fromAppointmentPage ? "editVisitorNotChangeMaster" : "editVisitor";
  if(!this.changeMaster){
    this.navCtrl.pop();
    this.events.publishDataCompany({
      action: 'user:created',
      title: action,
      message:  visitorObj
    });
    return;
  }

  this.apiProvider.UpdateVisitor(params).then(
    async (val) => {
      var result = JSON.parse(val.toString());
      if(result && result.Table && result.Table[0] && result.Table[0].Code == 10){
          let toast = await this.toastCtrl.create({
            message: this.T_SVC['ALERT_TEXT.VISITOR_UPDATED'],
            duration: 3000,
            color: 'primary',
            position: 'bottom'
          });
          toast.present();
          this.navCtrl.pop();
          visitorObj.VISITOR_IMG = "";
          visitorObj.VISITOR_COMPANY_ID = this.visitorInfoModal.visitor_comp_id;
          visitorObj.VISITOR_COMPANY = this.visitorInfoModal.visitor_comp_id;
          visitorObj.VISITOR_COMPANY_NAME = this.visitorInfoModal.visitor_comp;
          this.events.publishDataCompany({
            action: 'user:created',
            title:  action,
            message: visitorObj
          });
          return;
      }
      let toast = await this.toastCtrl.create({
        message: 'Server Error',
        duration: 3000,
        color: 'primary',
        position: 'bottom'
      });
      toast.present();

    },
    async (err) => {
      if(err && err.message == "No Internet"){
        return;
      }

        if(err && err.message){
          var error = err.message;
          let toast = await this.toastCtrl.create({
            message: "Error :" + error,
            duration: 3000,
            color: 'primary',
            position: 'bottom'
          });
          toast.present();
          return;
        }

      var result = JSON.parse(err.toString());
      if(result && result["Table1"] != undefined){
        let toast = await this.toastCtrl.create({
          message: 'Error! ' + result["Table1"][0].Status,
          duration: 3000,
          color: 'primary',
          position: 'bottom'
        });
        toast.present();
      }else if(result.message){
        let alert = await this.alertCtrl.create({
          header: 'Error !',
          message: result.message,
          cssClass: '',
          buttons: ['Okay']
        });
        alert.present();
      }else{
        let toast = await this.toastCtrl.create({
          message: 'Error!',
          duration: 3000,
          color: 'primary',
          position: 'bottom'
        });
        toast.present();
      }

    }
  );

}

// Always get the accurate path to your apps folder
public pathForImage(img) {
  if (img === null) {
    return '';
  } else {
    return cordova.file.dataDirectory + img;
  }
}

ionViewDidEnter() {
  }


  addVisitors(){

    if (this.hostSettings &&  this.hostSettings.ImageUploadEnabled && this.hostSettings.ImageUploadRequired && !this.base64Image) {
      this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.SELECT_VISITOR_IMAGE']);
      return;
    }

    if(this.hostSettings && this.hostSettings.CompanyEnabled && this.hostSettings.CompanyRequired && !this.visitorInfoModal["visitor_comp_id"]){
      this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.SELECT_VISITOR_COMPANY']);
      return;
    }


    if(this.hostSettings && this.hostSettings.CountryEnabled && this.hostSettings.CountryRequired && !this.visitorInfoModal.visitor_country){
      this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.SELECT_VISITOR_COUNTRY']);
      return;
    }



    if(this.visitorInfoModal.visitor_ic){
      this.visitorInfoModal.visitor_id = this.visitorInfoModal.visitor_ic;
    }
    if(this.visitorInfoModal.visitor_id && !this.visitorInfoModal.visitor_ic){
      this.visitorInfoModal.visitor_ic = this.visitorInfoModal.visitor_id;
    }

    if (!this.visitorInfoModal.visitor_id) {
      this.proceddAddorUpdate();
      return;
    }

    const params1 = {"VISITOR_IC": this.visitorInfoModal.visitor_id};
    params1["Authorize"] = {
      "AuMAppDevSeqId":'',
      "AuDeviceUID":'WEB'
    }
    this.apiProvider.requestApi(params1, '/api/vims/CheckBlackList', true, 'WEB', '').then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result["Table"] != undefined && result["Table"].length > 0){
          let visitorInfo = result["Table"][0];
          const visitor_blacklist = visitorInfo.Column1 || "";
          if (visitor_blacklist) {
            this.apiProvider.showAlert('You are not authorize to enter.Please contact host or receiptionist.');
          } else {
            this.proceddAddorUpdate();
          }
        } else {
          this.proceddAddorUpdate();
        }

      },
      async (err) => {
        if(err && err.message == "No Internet"){
          return;
        }

          if(err && err.message){
            var error = err.message;
            this.apiProvider.showAlert('Error! ' + error);
            return;
          }

        var result = JSON.parse(err.toString());
        if(result && result["Table1"] != undefined){
          this.apiProvider.showAlert('Error! ' + result["Table1"][0].Status);
        }else if(result.message){
          this.apiProvider.showAlert(result.message);
        }else{
          this.apiProvider.showAlert('Error!');
        }

      }
    );



  }

  proceddAddorUpdate() {
    if(!this.visitorInfoModal.visitor_gender){
      this.visitorInfoModal.visitor_gender = "";
    }

    if(!this.visitorInfoModal.visitor_country){
      this.visitorInfoModal.visitor_country = "";
    }

    if(!this.visitorInfoModal.visitor_address){
      this.visitorInfoModal.visitor_address = "";
    }

    if(!this.visitorInfoModal.visitor_ctg_id){
      this.visitorInfoModal.visitor_ctg_id = "";
    }

    if(!this.visitorInfoModal.visitor_ctg_name){
      this.visitorInfoModal.visitor_ctg_name = "";
    }

    if(!this.visitorInfoModal.visitor_comp_id){
      this.visitorInfoModal.visitor_comp_id = "";
    }
    if(!this.visitorInfoModal.visitor_comp_name){
      this.visitorInfoModal.visitor_comp_name = "";
    }

    if(!this.visitorInfoModal.visitor_mobile_no){
      this.visitorInfoModal.visitor_mobile_no = "";
    }
    if(!this.visitorInfoModal.vehicle_no){
      this.visitorInfoModal.vehicle_no = "";
    }

    let dublicate = false;

    if(this.VM.visitors) {
      this.VM.visitors.forEach(element => {

        if (!this.hostSettings.EmailEnabled && !this.hostSettings.IdProofEnabled){
          if(element.VISITOR_NAME && element.VISITOR_NAME.toLowerCase() === this.visitorInfoModal.visitor_name.toLowerCase()){
            dublicate = true;
            return;
          }
        } else if (this.hostSettings.EmailEnabled && this.hostSettings.IdProofEnabled){
          if (element.VISITOR_NAME && element.VISITOR_NAME.toLowerCase() === this.visitorInfoModal.visitor_name.toLowerCase() &&
            ((element.VISITOR_IC && element.VISITOR_IC.toLowerCase() === this.visitorInfoModal.visitor_ic.toLowerCase()) ||
            (element.visitor_id && element.visitor_id.toLowerCase() === this.visitorInfoModal.visitor_id.toLowerCase())) &&
            (element.EMAIL && element.EMAIL.toLowerCase() === this.visitorInfoModal.visitor_email.toLowerCase())) {
              dublicate = true;
              return;
            }
        } else if (this.hostSettings.EmailEnabled){
          if (element.VISITOR_NAME && element.VISITOR_NAME.toLowerCase() === this.visitorInfoModal.visitor_name.toLowerCase() &&
          (element.EMAIL && element.EMAIL.toLowerCase() === this.visitorInfoModal.visitor_email.toLowerCase())) {
            dublicate = true;
            return;
          }
        } else if (this.hostSettings.IdProofEnabled){
          if (element.VISITOR_NAME && element.VISITOR_NAME.toLowerCase() === this.visitorInfoModal.visitor_name.toLowerCase() &&
          (((element.VISITOR_IC && element.VISITOR_IC.toLowerCase() === this.visitorInfoModal.visitor_ic.toLowerCase()) ||
          (element.visitor_id && element.visitor_id.toLowerCase() === this.visitorInfoModal.visitor_id.toLowerCase())))) {
            dublicate = true;
            return;
          }
        }
      });
    }

    if (dublicate) {
      this.apiProvider.showAlert("Visitor already added.");
      return;
    }

    if(this.visitor){
      this.UpdateVisitor();
      return;
    }


    try {
      this.visitorInfoModal.visitor_ctg_id = this.VM.aData['visitor_ctg'].visitor_ctg_id;
      this.visitorInfoModal.visitor_ctg_name = this.VM.aData['visitor_ctg'].visitor_ctg_desc;
    } catch (error) {
      const item = JSON.parse(this.VM.aData + '');
      this.visitorInfoModal.visitor_ctg_id = item.visitor_ctg.visitor_ctg_id;
      this.visitorInfoModal.visitor_ctg_name = item.visitor_ctg.visitor_ctg_desc
    }
    var params = {
      "visitor_id": this.visitorInfoModal["visitor_ic"],
      "SEQ_ID": "",
      "visitor_ic": this.visitorInfoModal["visitor_ic"],
      "visitor_ctg_id": this.visitorInfoModal["visitor_ctg_id"],
      "visitor_ctg_name": this.visitorInfoModal["visitor_ctg_name"],
      "visitor_comp_id": this.visitorInfoModal["visitor_comp_id"],
      "visitor_comp": this.visitorInfoModal["visitor_comp_id"],
      "visitor_comp_name": this.visitorInfoModal["visitor_comp_name"],
      "visitor_oldicno": "",
      "visitor_name": this.visitorInfoModal["visitor_name"],
      "visitor_gender": this.visitorInfoModal["visitor_gender"],
      "visitor_vehicle_no": this.visitorInfoModal["vehicle_no"],
      "visitor_mobile_no": this.visitorInfoModal["visitor_mobile_no"],
      "visitor_tel_no": "",
      "visitor_address": this.visitorInfoModal["visitor_address"],
      "visitor_email": this.visitorInfoModal["visitor_email"],
      "visitor_image":this.data.profile,
      "Country":  this.visitorInfoModal.visitor_country,
      "Address": this.visitorInfoModal.visitor_address
    }
    if(!params.visitor_id){
      params.visitor_id = ""+new Date().getTime();
    }

    if(!this.changeMaster){
      var visitorObj = {
        VISITOR_IC :params.visitor_ic,
        visitor_id: params.visitor_ic,
        VISITOR_NAME:params.visitor_name,
        VISITOR_COMPANY:params.visitor_comp_id,
        VISITOR_COMPANY_ID:params.visitor_comp_id,
        VISITOR_COMPANY_NAME:params.visitor_comp_name,
        EMAIL:params.visitor_email,
        TELEPHONE_NO:params.visitor_mobile_no,
        VISITOR_GENDER:params.visitor_gender,
        VisitorDesignation: "",
        VisitorCategory:params.visitor_ctg_name,
        VisitorCategory_ID:params.visitor_ctg_id,
        VISITOR_IMG:this.data.profile,
        Address: params.visitor_address,
        Country: params.Country,
        PLATE_NUM:params.visitor_vehicle_no,
        checked : true,
        SEQ_ID: "",
        VisitorBookingSeqId : ""
      }

      this.VM.visitors.push(visitorObj);

      this.navCtrl.pop().then((data)=> {
        this.navCtrl.pop();
      });

      this.events.publishDataCompany({
        action: "AddVisitorNew",
        title: this.VM.visitors,
        message: this.VM.aData
      })
      return;
    }
    this.apiProvider.AddVisitor(params).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result && result.Table && result.Table[0] && result.Table[0].Code == 10){
            let toast = await this.toastCtrl.create({
              message: 'Add Visitor Done Successfully',
              duration: 3000,
              color: 'primary',
              position: 'bottom'
            });
            params["checked"] = true;
            params["SEQ_ID"] =result.Table1[0].SEQ_ID;
            this.VM.visitors.push(params);
            toast.present();
            this.navCtrl.pop();

            const navigationExtras: NavigationExtras = {
              state: {
                passData: {
                  data:this.VM.visitors,
                  aData: this.VM.aData
                }
              }
            };
            this.router.navigate(['add-appointment'], navigationExtras);
            return;
        }
        let toast = await this.toastCtrl.create({
          message: 'Server Error',
          duration: 3000,
          color: 'primary',
          position: 'bottom'
        });
        toast.present();

      },
      async (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message.indexOf("Http failure response for") > -1){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else{
          var result = JSON.parse(err.toString());
          if(result && result["Table1"] != undefined){
            message = result["Table1"][0].description;
          } else if(result.message){
            message = result.message;
          } else if(err && !err.message){
            message = " Unknown"
          }
        }
        let alert = await this.alertCtrl.create({
          header: 'Error !',
          message: message,
          cssClass: '',
          buttons: ['Okay']
        });
          alert.present();
       }
    );
  }

  ngOnChanges(changes: { [propKey: string]: any }) {
      // if (changes.data && changes.data.currentValue) {
      //     this.headerImage = changes.data.currentValue.headerImage;
      // }
      this.subscribeToIonScroll();
  }

  ngAfterViewInit() {
      this.subscribeToIonScroll();
  }
  isClassActive() {
      return this.active;
  }

  openVisitorCompany(){
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          data: this.visitorInfoModal
        }
      }
    };
    this.router.navigate(['visitor-company-page'], navigationExtras);
  }

  addVisitorsNewCompany(company){
    var params = {
      "visitor_comp_name": company,
      "visitor_comp_addr1": "",
      "visitor_comp_addr2": "",
      "visitor_comp_addr3": "",
      "visitor_comp_postcode": "",
      "visitor_comp_city": "",
      "visitor_comp_state": "",
      "visitor_comp_contact": "",
      "visitor_comp_country": "",
      "visitor_comp_fax_no": "",
      "visitor_comp_tel_no":"",
      "visitor_comp_email":"",
    }
    this.apiProvider.addVisitorCompany(params).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result && result.Table && result.Table1 && result.Table[0].Code == 10){
            let toast = await this.toastCtrl.create({
              message: this.T_SVC['ADD_VISITORS.SUCCESS.ADD_VISITOR_COMPANY_SUCCESS'],
              duration: 3000,
              color: 'primary',
              position: 'bottom'
            });
            toast.present();
            this.visitorInfoModal.visitor_comp_id = result.Table1[0].visitor_company_code;
            this.visitorInfoModal.visitor_comp_name = params.visitor_comp_name;

            return;
        }
        let toast = await this.toastCtrl.create({
          message: this.T_SVC['USER_PROFILE.ERROR.SERVER_ERROR'],
          duration: 3000,
          color: 'primary',
          position: 'bottom'
        });
        toast.present();

      },
      async (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message.indexOf("Http failure response for") > -1){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else {
          var result = JSON.parse(err.toString());
          if(result && result["Table1"] != undefined){
            message = result["Table1"][0].Status? result["Table1"][0].Status : result["Table1"][0].Description;
          } else if(result.message){
            message = result.message;
          }
        }
        let alert = await this.alertCtrl.create({
          header: 'Error !',
          message: message,
          cssClass: '',
          buttons: ['Okay']
        });
          alert.present();

        }
    );

  }

  subscribeToIonScroll() {
    if (this.content && this.content['ionScroll']) {
        this.content['ionScroll'].subscribe((d) => {
            if (d && d['scrollTop'] < 80 ) {
                this.active = false;
                return;
            }
            this.active = true;
        });
    }
}

  ngOnInit() {
  }

}
