import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { Contacts } from '@ionic-native/contacts/ngx';
import { File } from '@ionic-native/file/ngx';
import { NavController, AlertController, ActionSheetController, ToastController, Platform, LoadingController, IonContent, PopoverController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CountryComponentComponent } from 'src/app/components/country-component/country-component.component';
import { VisitorInfoModal } from 'src/app/model/visitorInfoModal';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
declare var cordova: any;
@Component({
  selector: 'app-add-visitors',
  templateUrl: './add-visitors.page.html',
  styleUrls: ['./add-visitors.page.scss'],
})
export class AddVisitorsPage implements OnInit, OnDestroy {
  countryList = [{name:"Afghanistan",code:"AF"},{name:"Åland Islands",code:"AX"},{name:"Albania",code:"AL"},{name:"Algeria",code:"DZ"},{name:"American Samoa",code:"AS"},{name:"AndorrA",code:"AD"},{name:"Angola",code:"AO"},{name:"Anguilla",code:"AI"},{name:"Antarctica",code:"AQ"},{name:"Antigua and Barbuda",code:"AG"},{name:"Argentina",code:"AR"},{name:"Armenia",code:"AM"},{name:"Aruba",code:"AW"},{name:"Australia",code:"AU"},{name:"Austria",code:"AT"},{name:"Azerbaijan",code:"AZ"},{name:"Bahamas",code:"BS"},{name:"Bahrain",code:"BH"},{name:"Bangladesh",code:"BD"},{name:"Barbados",code:"BB"},{name:"Belarus",code:"BY"},{name:"Belgium",code:"BE"},{name:"Belize",code:"BZ"},{name:"Benin",code:"BJ"},{name:"Bermuda",code:"BM"},{name:"Bhutan",code:"BT"},{name:"Bolivia",code:"BO"},{name:"Bosnia and Herzegovina",code:"BA"},{name:"Botswana",code:"BW"},{name:"Bouvet Island",code:"BV"},{name:"Brazil",code:"BR"},{name:"British Indian Ocean Territory",code:"IO"},{name:"Brunei Darussalam",code:"BN"},{name:"Bulgaria",code:"BG"},{name:"Burkina Faso",code:"BF"},{name:"Burundi",code:"BI"},{name:"Cambodia",code:"KH"},{name:"Cameroon",code:"CM"},{name:"Canada",code:"CA"},{name:"Cape Verde",code:"CV"},{name:"Cayman Islands",code:"KY"},{name:"Central African Republic",code:"CF"},{name:"Chad",code:"TD"},{name:"Chile",code:"CL"},{name:"China",code:"CN"},{name:"Christmas Island",code:"CX"},{name:"Cocos (Keeling) Islands",code:"CC"},{name:"Colombia",code:"CO"},{name:"Comoros",code:"KM"},{name:"Congo",code:"CG"},{name:"Congo, The Democratic Republic of the",code:"CD"},{name:"Cook Islands",code:"CK"},{name:"Costa Rica",code:"CR"},{name:"Cote D'Ivoire",code:"CI"},{name:"Croatia",code:"HR"},{name:"Cuba",code:"CU"},{name:"Cyprus",code:"CY"},{name:"Czech Republic",code:"CZ"},{name:"Denmark",code:"DK"},{name:"Djibouti",code:"DJ"},{name:"Dominica",code:"DM"},{name:"Dominican Republic",code:"DO"},{name:"Ecuador",code:"EC"},{name:"Egypt",code:"EG"},{name:"El Salvador",code:"SV"},{name:"Equatorial Guinea",code:"GQ"},{name:"Eritrea",code:"ER"},{name:"Estonia",code:"EE"},{name:"Ethiopia",code:"ET"},{name:"Falkland Islands (Malvinas)",code:"FK"},{name:"Faroe Islands",code:"FO"},{name:"Fiji",code:"FJ"},{name:"Finland",code:"FI"},{name:"France",code:"FR"},{name:"French Guiana",code:"GF"},{name:"French Polynesia",code:"PF"},{name:"French Southern Territories",code:"TF"},{name:"Gabon",code:"GA"},{name:"Gambia",code:"GM"},{name:"Georgia",code:"GE"},{name:"Germany",code:"DE"},{name:"Ghana",code:"GH"},{name:"Gibraltar",code:"GI"},{name:"Greece",code:"GR"},{name:"Greenland",code:"GL"},{name:"Grenada",code:"GD"},{name:"Guadeloupe",code:"GP"},{name:"Guam",code:"GU"},{name:"Guatemala",code:"GT"},{name:"Guernsey",code:"GG"},{name:"Guinea",code:"GN"},{name:"Guinea-Bissau",code:"GW"},{name:"Guyana",code:"GY"},{name:"Haiti",code:"HT"},{name:"Heard Island and Mcdonald Islands",code:"HM"},{name:"Holy See (Vatican City State)",code:"VA"},{name:"Honduras",code:"HN"},{name:"Hong Kong",code:"HK"},{name:"Hungary",code:"HU"},{name:"Iceland",code:"IS"},{name:"India",code:"IN"},{name:"Indonesia",code:"ID"},{name:"Iran, Islamic Republic Of",code:"IR"},{name:"Iraq",code:"IQ"},{name:"Ireland",code:"IE"},{name:"Isle of Man",code:"IM"},{name:"Israel",code:"IL"},{name:"Italy",code:"IT"},{name:"Jamaica",code:"JM"},{name:"Japan",code:"JP"},{name:"Jersey",code:"JE"},{name:"Jordan",code:"JO"},{name:"Kazakhstan",code:"KZ"},{name:"Kenya",code:"KE"},{name:"Kiribati",code:"KI"},{name:"Korea, Democratic People'S Republic of",code:"KP"},{name:"Korea, Republic of",code:"KR"},{name:"Kuwait",code:"KW"},{name:"Kyrgyzstan",code:"KG"},{name:"Lao People'S Democratic Republic",code:"LA"},{name:"Latvia",code:"LV"},{name:"Lebanon",code:"LB"},{name:"Lesotho",code:"LS"},{name:"Liberia",code:"LR"},{name:"Libyan Arab Jamahiriya",code:"LY"},{name:"Liechtenstein",code:"LI"},{name:"Lithuania",code:"LT"},{name:"Luxembourg",code:"LU"},{name:"Macao",code:"MO"},{name:"Macedonia, The Former Yugoslav Republic of",code:"MK"},{name:"Madagascar",code:"MG"},{name:"Malawi",code:"MW"},{name:"Malaysia",code:"MY"},{name:"Maldives",code:"MV"},{name:"Mali",code:"ML"},{name:"Malta",code:"MT"},{name:"Marshall Islands",code:"MH"},{name:"Martinique",code:"MQ"},{name:"Mauritania",code:"MR"},{name:"Mauritius",code:"MU"},{name:"Mayotte",code:"YT"},{name:"Mexico",code:"MX"},{name:"Micronesia, Federated States of",code:"FM"},{name:"Moldova, Republic of",code:"MD"},{name:"Monaco",code:"MC"},{name:"Mongolia",code:"MN"},{name:"Montserrat",code:"MS"},{name:"Morocco",code:"MA"},{name:"Mozambique",code:"MZ"},{name:"Myanmar",code:"MM"},{name:"Namibia",code:"NA"},{name:"Nauru",code:"NR"},{name:"Nepal",code:"NP"},{name:"Netherlands",code:"NL"},{name:"Netherlands Antilles",code:"AN"},{name:"New Caledonia",code:"NC"},{name:"New Zealand",code:"NZ"},{name:"Nicaragua",code:"NI"},{name:"Niger",code:"NE"},{name:"Nigeria",code:"NG"},{name:"Niue",code:"NU"},{name:"Norfolk Island",code:"NF"},{name:"Northern Mariana Islands",code:"MP"},{name:"Norway",code:"NO"},{name:"Oman",code:"OM"},{name:"Pakistan",code:"PK"},{name:"Palau",code:"PW"},{name:"Palestinian Territory, Occupied",code:"PS"},{name:"Panama",code:"PA"},{name:"Papua New Guinea",code:"PG"},{name:"Paraguay",code:"PY"},{name:"Peru",code:"PE"},{name:"Philippines",code:"PH"},{name:"Pitcairn",code:"PN"},{name:"Poland",code:"PL"},{name:"Portugal",code:"PT"},{name:"Puerto Rico",code:"PR"},{name:"Qatar",code:"QA"},{name:"Reunion",code:"RE"},{name:"Romania",code:"RO"},{name:"Russian Federation",code:"RU"},{name:"RWANDA",code:"RW"},{name:"Saint Helena",code:"SH"},{name:"Saint Kitts and Nevis",code:"KN"},{name:"Saint Lucia",code:"LC"},{name:"Saint Pierre and Miquelon",code:"PM"},{name:"Saint Vincent and the Grenadines",code:"VC"},{name:"Samoa",code:"WS"},{name:"San Marino",code:"SM"},{name:"Sao Tome and Principe",code:"ST"},{name:"Saudi Arabia",code:"SA"},{name:"Senegal",code:"SN"},{name:"Serbia and Montenegro",code:"CS"},{name:"Seychelles",code:"SC"},{name:"Sierra Leone",code:"SL"},{name:"Singapore",code:"SG"},{name:"Slovakia",code:"SK"},{name:"Slovenia",code:"SI"},{name:"Solomon Islands",code:"SB"},{name:"Somalia",code:"SO"},{name:"South Africa",code:"ZA"},{name:"South Georgia and the South Sandwich Islands",code:"GS"},{name:"Spain",code:"ES"},{name:"Sri Lanka",code:"LK"},{name:"Sudan",code:"SD"},{name:"Suriname",code:"SR"},{name:"Svalbard and Jan Mayen",code:"SJ"},{name:"Swaziland",code:"SZ"},{name:"Sweden",code:"SE"},{name:"Switzerland",code:"CH"},{name:"Syrian Arab Republic",code:"SY"},{name:"Taiwan, Province of China",code:"TW"},{name:"Tajikistan",code:"TJ"},{name:"Tanzania, United Republic of",code:"TZ"},{name:"Thailand",code:"TH"},{name:"Timor-Leste",code:"TL"},{name:"Togo",code:"TG"},{name:"Tokelau",code:"TK"},{name:"Tonga",code:"TO"},{name:"Trinidad and Tobago",code:"TT"},{name:"Tunisia",code:"TN"},{name:"Turkey",code:"TR"},{name:"Turkmenistan",code:"TM"},{name:"Turks and Caicos Islands",code:"TC"},{name:"Tuvalu",code:"TV"},{name:"Uganda",code:"UG"},{name:"Ukraine",code:"UA"},{name:"United Arab Emirates",code:"AE"},{name:"United Kingdom",code:"GB"},{name:"United States",code:"US"},{name:"United States Minor Outlying Islands",code:"UM"},{name:"Uruguay",code:"UY"},{name:"Uzbekistan",code:"UZ"},{name:"Vanuatu",code:"VU"},{name:"Venezuela",code:"VE"},{name:"Viet Nam",code:"VN"},{name:"Virgin Islands, British",code:"VG"},{name:"Virgin Islands, U.S.",code:"VI"},{name:"Wallis and Futuna",code:"WF"},{name:"Western Sahara",code:"EH"},{name:"Yemen",code:"YE"},{name:"Zambia",code:"ZM"},{name:"Zimbabwe",code:"ZW"}];
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
    private file: File,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public platform: Platform,
    public events: EventsService,
    private contacts: Contacts,
    private router: Router,
    public loadingCtrl: LoadingController) {
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
              this.countryList.forEach(element => {
                if (element.code === this.visitorInfoModal.visitor_country) {
                  this.visitorInfoModal.visitor_country_name = element.name;
                  return;
                }
              });
            }

            if(this.visitor.VisitorBookingSeqId){
              this.imageType = "&RefType=VPB&Refresh="+ new Date().getTime();
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
            country: new FormControl('', (this.hostSettings && this.hostSettings.CountryEnabled && this.hostSettings.CountryRequired) ? ([Validators.required]) : []),
            gender: new FormControl('', (this.hostSettings && this.hostSettings.GenderEnabled && this.hostSettings.GenderRequired) ? ([Validators.required]) : []),
            vistorCompany:new FormControl('', [])
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
        this.visitorInfoModal.visitor_mobile_no = resultOB._objectInstance.phoneNumbers[0].value;
        if(resultOB._objectInstance.organizations && resultOB._objectInstance.organizations[0]){
          this.visitorInfoModal.visitor_comp_name = resultOB._objectInstance.organizations[0].name;
          this.getCompanyList(this.visitorInfoModal.visitor_comp_name);
        }

        if(resultOB._objectInstance.addresses && resultOB._objectInstance.addresses[0]){
          this.visitorInfoModal.visitor_address = resultOB._objectInstance.addresses[0].formatted;
          this.countryList.forEach(country => {
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
        cssClass: 'alert-warning',
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
          cssClass: 'alert-danger',
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

    const params1 = {"VISITOR_IC": this.visitorInfoModal.visitor_id};
    params1["Authorize"] = {
      "AuMAppDevSeqId":'',
      "AuDeviceUID":'WEB'
    }
    this.apiProvider.requestApi(params1, '/api/vims/CheckBlackList', true, 'WEB').then(
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

    if(this.visitor){
      this.UpdateVisitor();
      return;
    }
    let dublicate = false;
    if(this.VM.visitors) {
      this.VM.visitors.forEach(element => {
        if ((element.VISITOR_IC && element.VISITOR_IC.toLowerCase() === this.visitorInfoModal.visitor_ic.toLowerCase()) ||
        (element.visitor_id && element.visitor_id.toLowerCase() === this.visitorInfoModal.visitor_id.toLowerCase())) {
          dublicate = true;
          return;
        }
      });
    }

    if (dublicate) {
      this.apiProvider.showAlert("Visitor already added.");
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
        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
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
          cssClass: 'alert-danger',
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

  getCompanyList(company){

      var params = {"SearchString":company,
      "OffSet":"0",
      "Rows":"20000"};
      // this.VM.host_search_id = "adam";
      this.apiProvider.GetVisitorCompany(params).then(
        (val) => {
          var allowAdd = true;
            var companyList = JSON.parse(val.toString());
            for(var i = 0 ; i < companyList.length ; i++){
              if(company == companyList[i].visitor_comp_name){
                this.visitorInfoModal.visitor_comp_name = company;
                this.visitorInfoModal.visitor_comp_id = companyList[i].visitor_comp_code;
                this.visitorInfoModal.visitor_comp = companyList[i].visitor_comp_code;
                allowAdd = false;
                break;
              }
            }

            if(allowAdd){
              this.addVisitorsNewCompany(company);
            }
        },
        async (err) => {

            this.addVisitorsNewCompany(company);
            var companyList = [];

            var message = "";
            if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
              message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
            } else if(err && JSON.parse(err) && JSON.parse(err).message){
              message =JSON.parse(err).message;
            }
            if(message){
              // message = " Unknown"
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: message,
                cssClass: 'alert-danger',
                buttons: ['Okay']
              });
                alert.present();
            }
          }
      );
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
        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
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
          cssClass: 'alert-danger',
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
