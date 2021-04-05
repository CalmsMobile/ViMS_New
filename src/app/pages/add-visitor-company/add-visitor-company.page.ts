import { Content } from '@angular/compiler/src/render3/r3_ast';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, NavParams, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { ToastService } from 'src/app/services/util/Toast.service';

@Component({
  selector: 'app-add-visitor-company',
  templateUrl: './add-visitor-company.page.html',
  styleUrls: ['./add-visitor-company.page.scss'],
})
export class AddVisitorCompanyPage implements OnInit {

  @ViewChild(Content) content: Content;
  active: boolean;
  T_SVC:any;
  data: any = {
    "logo": "assets/images/logo/2.png",
    "coverImage":"assets/images/profile_bg.jpg"
  };
  company_name: string = "";
  company_address1: string = "";
  company_address2: string = "";
  company_address3: string = "";
  company_postal_code: string = "";
  company_city:string = "";
  company_state:string = "";
  company_country:string = "";
  company_contact:string = "";
  company_fax:string = "";
  company_tel_no:string = "";
  company_email_no:string = "";

  public error: string;
  visitorProfile:FormGroup;
  VISITOR_CATEGORY:any;
  translation:any = {};


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastService: ToastService,
    private toastCtrl: ToastController,
    private translate:TranslateService,
    public apiProvider: RestProvider,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController) {
      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
          this.T_SVC = t;
      });
      let EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
      this.visitorProfile = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9 ]*'), Validators.minLength(4), Validators.maxLength(100)]),
        email: new FormControl('', [Validators.required, Validators.pattern(EMAILPATTERN)]),
        address1: new FormControl('', []),
        address2: new FormControl('', []),
        address3: new FormControl('', []),
        contact: new FormControl('', []),
        postalcode: new FormControl('', []),
        city:new FormControl('', []),
        state:new FormControl('', []),
        country:new FormControl('', []),
        fax:new FormControl('', []),
        tele:new FormControl('', [])
      });
      this.translate.get(['ADD_VISITORS.SUCCESS.ADD_VISITOR_SUCCESS', 'USER_PROFILE.ERROR.SERVER_ERROR']).subscribe(t => {
        this.translation = t;
      });
  }

  ionViewDidEnter() {
  }

  addVisitors(){
    var params = {
      "visitor_comp_name": this.company_name,
      "visitor_comp_addr1": this.company_address1,
      "visitor_comp_addr2": this.company_address2,
      "visitor_comp_addr3": this.company_address3,
      "visitor_comp_postcode": this.company_postal_code,
      "visitor_comp_city": this.company_city,
      "visitor_comp_state": this.company_state,
      "visitor_comp_contact": this.company_country,
      "visitor_comp_country": this.company_contact,
      "visitor_comp_fax_no": this.company_fax,
      "visitor_comp_tel_no":this.company_tel_no,
      "visitor_comp_email":this.company_email_no,
    }
    this.apiProvider.addVisitorCompany(params).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result && result[0].Code == 10){
            let toast = await this.toastCtrl.create({
              message: this.translation['ADD_VISITORS.SUCCESS.ADD_VISITOR_COMPANY_SUCCESS'],
              duration: 3000,
              position: 'bottom'
            });
            toast.present();
            this.navCtrl.pop();
            return;
        }
        let toast = await this.toastCtrl.create({
          message: this.translation['USER_PROFILE.ERROR.SERVER_ERROR'],
          duration: 3000,
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
            if(result && result["Table1"] && result["Table1"][0]){
              message = result["Table1"][0].description ? result["Table1"][0].description : result["Table1"][0].Status;
            } else if(result.message){
              message = result.message;
            } else{
              message = " Unknown";
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

  subscribeToIonScroll() {
    if (this.content && this.content['ionScroll']) {
        this.content['ionScroll'].subscribe((d) => {
            if (d.scrollTop < 80 ) {
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
