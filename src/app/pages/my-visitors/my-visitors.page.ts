import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-my-visitors',
  templateUrl: './my-visitors.page.html',
  styleUrls: ['./my-visitors.page.scss'],
})
export class MyVisitorsPage implements OnInit {

  T_SVC:any;
  imageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  imageURLType = '&RefType=VP&Refresh='+ new Date().getTime();
  VM = {
    "visitors":[],
    "queryText":"",
    "searchContactsArray" : []
  };
  OffSet = 0;
  constructor(public navCtrl: NavController,
    private alertCtrl : AlertController,
    private router: Router,
    private apiProvider : RestProvider) {
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter MyVisitorsPage');

    var visitors = [{
      "visitor_name": "Nandha Kumar",
      "visitor_comp_name": "Calms Tecnologies",
      "visitor_mobile_no": "+60 162018024",
      "att_reason": "Meeting",
      "CheckInDatetime": "22-08-2019 11:11 AM",
      "CheckOutDatetime": "22-08-2019 12:11 AM",
      "SEQ_ID": "129",
      "VisitorStatus": "CINO"
    },{
      "visitor_name": "Karthi Chenniyappan",
      "visitor_comp_name": "Calms Tecnologies",
      "visitor_mobile_no": "+60 162018023",
      "att_reason": "VISIT",
      "CheckInDatetime": "22-08-2019 11:11 AM",
      "CheckOutDatetime": "22-08-2019 12:11 AM",
      "SEQ_ID": "129",
      "VisitorStatus": "CIExpired"
    },{
      "visitor_name": "Mohan Kumar",
      "visitor_comp_name": "Calms Tecnologies",
      "visitor_mobile_no": "+60 162018025",
      "att_reason": "VENDOR",
      "CheckInDatetime": "22-08-2019 11:11 AM",
      "CheckOutDatetime": "22-08-2019 12:11 AM",
      "SEQ_ID": "129",
      "VisitorStatus": "CIO"
    },
    {
      "visitor_name": "Karthi Chenniyappan",
      "visitor_comp_name": "Calms Tecnologies",
      "visitor_mobile_no": "+60 162018023",
      "att_reason": "VISIT",
      "CheckInDatetime": "22-08-2019 11:11 AM",
      "CheckOutDatetime": "22-08-2019 12:11 AM",
      "SEQ_ID": "129",
      "VisitorStatus": "CIExpired"
    }]

    // this.VM.visitors = visitors;
    this.getAllMyVisitors(true, null);
  }

  onCancel(){
    this.VM.visitors = [];
  }

  doCapitalize(text){
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  doRefresh(refresher) {

    this.OffSet = this.VM.searchContactsArray.length;
    this.getAllMyVisitors(false, refresher);
    //setTimeout(()=>{refresher.target.complete();},2000)
  }

  getAllMyVisitors(showLoading, refresher){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var STAFF_IC = JSON.parse(hostData).HOSTIC;

      var params = {
        "HOSTIC": STAFF_IC,
        "OffSet": this.OffSet+"",
        "Rows":"20000"
     }
     this.apiProvider.GetVisitorsListByHost(params, showLoading).then(
       (val) => {
        var searchContactsArray= JSON.parse(val.toString());
        if(refresher){
          this.VM.visitors = searchContactsArray.concat(this.VM.visitors);
          refresher.target.complete();
        }else{
          this.VM.visitors = searchContactsArray;
        }
        this.VM.searchContactsArray = this.VM.visitors;
       },
       async (err) => {
         if(refresher){
          refresher.target.complete();
         }else{
          this.VM.visitors = [];
         }
         if(err && err.message == "No Internet"){
          return;
        }

        var message;
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
  }

  addVisitors(slideDOM, item){
    slideDOM.close();

    var visitorData = [{
      SEQ_ID: item.SEQ_ID,
      VISITOR_NAME: item.visitor_name,
      EMAIL: item.visitor_email,
      TELEPHONE_NO: item.visitor_mobile_no,
      VISITOR_COMPANY: item.visitor_comp_name,
      VISITOR_COMPANY_ID: item.visitor_comp_id,
      VISITOR_IC :item.VISITOR_IC
    }];
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          data : visitorData
        }
      }
    };
    this.router.navigate(['add-appointment'], navigationExtras);
  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  getVisitorsBySearch(event){
    const queryText = event? event.target.value: '';
    this.VM.queryText = queryText;
    if(this.VM.queryText){
      var fList = [];
      for(var i = 0 ; i < this.VM.searchContactsArray.length; i++){
        var item = this.VM.searchContactsArray[i];

        if(item.visitor_name.toLowerCase().indexOf(this.VM.queryText.toLowerCase()) > -1){
          fList[fList.length] = item;
        }
      }
      this.VM.visitors = fList;
    }else{
      this.VM.visitors = this.VM.searchContactsArray;
    }


  }

  ngOnInit() {
  }

}
