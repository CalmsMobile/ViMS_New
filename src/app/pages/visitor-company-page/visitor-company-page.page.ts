import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { VisitorInfoModal } from 'src/app/model/visitorInfoModal';
import { RestProvider } from 'src/app/providers/rest/rest';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-visitor-company-page',
  templateUrl: './visitor-company-page.page.html',
  styleUrls: ['./visitor-company-page.page.scss'],
})
export class VisitorCompanyPagePage implements OnInit {


  VM = {
    "queryText":"",
    "companyList": []
  };
  OffSet = 0;
  done = false;
  visitorInfoModal = new VisitorInfoModal();
  T_SVC:any;
  relationship: any = '';
  loadingFinished = true;
  constructor(public navCtrl: NavController,
    public apiProvider: RestProvider,
    private toastCtrl: ToastController,
    private translate:TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    public events: EventsService,
    private alertCtrl : AlertController) {
      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'ADD_VISITORS.SUCCESS.ADD_VISITOR_COMPANY_SUCCESS', 'USER_PROFILE.ERROR.SERVER_ERROR']).subscribe(t => {
          this.T_SVC = t;
      });
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          this.visitorInfoModal =  passData.data;
        }
      });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter VisitorCompanyPage');

  }

  getCompanyList(typing, refresher){

    if(this.VM.queryText.length >= 2){
      this.loadingFinished = false;
      if(typing){
        this.OffSet = 0;
      }
      var params = {"SearchString":this.VM.queryText,
      "OffSet":this.OffSet+"",
      "Rows":"20000"};
      // this.VM.host_search_id = "adam";
      this.apiProvider.GetVisitorCompany(params).then(
        (val) => {
          this.loadingFinished = true;
          if(refresher){
            this.VM.companyList = JSON.parse(val.toString()).concat(this.VM.companyList);
            refresher.target.complete();
           }else{
            this.VM.companyList = JSON.parse(val.toString());
           }
        },
        async (err) => {
          this.loadingFinished = true;
          if(refresher){
            refresher.target.complete();
           }else{
            this.VM.companyList = [];

            var message = "";
            if(err && err.message && err.message.indexOf("Http failure response for") > -1){
              message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
            } else if(err && JSON.parse(err) && JSON.parse(err).message){
              message =JSON.parse(err).message;
            }
            if(message){
              // message = " Unknown"
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: message,
                cssClass: '',
                buttons: ['Okay']
              });
                alert.present();
            }
           }
        }
      );

    }else{
      if(refresher){
        refresher.target.complete();
       }
    }


  }

  goToAddVisitorCompany(){
    this.router.navigateByUrl("add-visitor-company");
  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  addVisitors(){
    var params = {
      "visitor_comp_name": this.VM.queryText,
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
            this.visitorInfoModal.visitor_comp = result.Table1[0].visitor_company_code;
            this.visitorInfoModal.visitor_comp_name = this.VM.queryText;
            this.addVisitorsCompany();
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
        if(err && err.message && err.message.indexOf("Http failure response for") > -1){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else {
          var result = JSON.parse(err.toString());
          if(result && result["Table1"] != undefined){
            message = result["Table1"][0].Status? result["Table1"][0].Status : result["Table1"][0].Description;
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

  onCancel(){

  }

  getVisitorsCompanyBySearch(typing, refresher){
    this.getCompanyList(typing, refresher);
  }
  selectCompany(event){
    console.log("relationship:" + JSON.stringify(event.detail));
    if (event.detail.value) {
      this.VM.companyList.forEach(element => {
        if ((+event.detail.value) === element.visitor_comp_code) {
          this.visitorInfoModal['visitor_comp_name'] = element["visitor_comp_name"];
          this.visitorInfoModal['visitor_comp_id'] = element["visitor_comp_code"];
          console.log('VisitorCompanyPage'+ JSON.stringify(element));
          this.done = true;
          return;
        }
      });

    }
    // this.visitorInfoModal.visitor_comp_id = ;

  }

  doRefresh(refresher) {
    var newOffset = this.OffSet + 10;
    if(this.VM.companyList.length >= newOffset){
      this.OffSet = newOffset;
    }

    this.getVisitorsCompanyBySearch(false, refresher);
    //setTimeout(()=>{refresher.target.complete();},2000)
  }

  addVisitorsCompany(){
    var data =  {
      "visitor_comp_code":this.visitorInfoModal.visitor_comp_id,
      "visitor_comp_name":this.visitorInfoModal.visitor_comp_name
    }
    this.events.publishDataCompany({
      action: 'user:created',
      title: "visitorCompany",
      message: JSON.stringify(data)
    });
    this.navCtrl.pop();
  }


  ngOnInit() {
  }

}
