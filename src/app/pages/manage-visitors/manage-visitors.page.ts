import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, IonItemSliding, IonList, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-manage-visitors',
  templateUrl: './manage-visitors.page.html',
  styleUrls: ['./manage-visitors.page.scss'],
})
export class ManageVisitorsPage implements OnInit, OnDestroy {

  @ViewChild('visitorsList') visitorsList: IonList;

  T_SVC:any;
  VM = {
    "aData":{},
    "visitors":[],
    "queryText":"",
    "searchContactsArray" : []
  };
  visitors1 = [];
  tempContactArray = [];
  contactsArray = [];
  OffSet = 0;
  newImage = "&tes='test'"
  isAnyoneSelected = false;
  imageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  imageURLType = '&RefType=VP&Refresh='+ new Date().getTime();
  appSettings : any = {};

  ngOnDestroy(): void {
    this.events.clearObserve();
  }

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private router: Router,
    private route: ActivatedRoute,
    public apiProvider: RestProvider,
    private events: EventsService,
    private translate:TranslateService) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
    'ALERT_TEXT.UPDATE_VISITOR_EMAIL']).subscribe(t => {
        this.T_SVC = t;
    });
    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    if(settings && JSON.parse(settings)){
      this.appSettings = JSON.parse(settings).Table1[0];
    }
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + JSON.stringify(passData));
        this.visitors1 =  passData.data;
        // if(this.contactsArray != undefined && this.contactsArray && this.contactsArray.length != 0){
        //   this.VM.visitors = this.contactsArray;
        // }
        if(passData.aData != undefined && passData.aData){
          this.VM.aData = passData.aData;
        }
      }
    });


    events.observeDataCompany().subscribe((data1: any) => {

      if (data1.action === 'user:created') {
        const user = data1.title;
        const data = data1.message;
        // ('user:created', (user, data) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      console.log('Welcome', user, 'at', data);
      // this.params.hostImage = "assets/images/logo/2.png";
      // alert(this.params.hostImage);
      if(user == "editVisitor"){
        var visitor = data;
        for(let contacts in this.VM.visitors){
          var visitorCats = this.VM.visitors[contacts].contacts
          for(let visitors in visitorCats){
            var visitor1 = visitorCats[visitors];
            if(visitor1.SEQ_ID == visitor.SEQ_ID){
              //alert("Changed");
              visitor1.VISITOR_IC = visitor.VISITOR_IC;
              visitor1.VISITOR_NAME=visitor.VISITOR_NAME;
              visitor1.VISITOR_COMPANY_NAME = visitor.VISITOR_COMPANY_NAME;
              visitor1.VISITOR_COMPANY_ID = visitor.VISITOR_COMPANY_ID;
              visitor1.VISITOR_COMPANY = visitor.VISITOR_COMPANY_ID;
              visitor1.EMAIL=visitor.EMAIL;
              visitor1.TELEPHONE_NO=visitor.TELEPHONE_NO;
              visitor1.VISITOR_GENDER=visitor.VISITOR_GENDER;
              visitor1.Address=visitor.Address;
              visitor1.Country=visitor.Country;
              visitor1.VisitorDesignation= "";
              visitor1.VisitorCategory=visitor.VisitorCategory;
              visitor1.VisitorCategory_ID=visitor.VisitorCategory_ID;
              visitor1.VISITOR_IMG=visitor.VISITOR_IMG;
              visitor1.PLATE_NUM=visitor.PLATE_NUM;
              visitor1.isChecked = true;
              visitor1.visitor_RemoveImg =visitor.visitor_RemoveImg;
              visitor1.visitor_id = visitor.VISITOR_IC;
              visitor1.ImageChanged = visitor.ImageChanged;
              this.newImage = this.newImage +"_"+ new Date().getTime();
              this.isAnyoneSelected = true;
              break;
            }
          }
        }
      }
      }
    });

  }

  ionViewDidEnter() {

  }
  ionViewWillEnter() {
  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  goToAddVisitorProfile(){

    var visitorTemp = [];
    for(let contacts in this.VM.visitors){
      for(let visitors in this.VM.visitors[contacts].contacts){
        if(this.VM.visitors[contacts].contacts[visitors]["isChecked"]){
          visitorTemp.push(this.VM.visitors[contacts].contacts[visitors]);
        }
      }
    }
    var visitorTemp1 =this.visitors1;
    if(visitorTemp.length > 0){
      for(let contacts in visitorTemp){
        var exist = false;
        for(let visitors in this.visitors1){
          if(this.visitors1[visitors].SEQ_ID == visitorTemp[contacts].SEQ_ID){
            exist = true;
          }
        }
        if(!exist){
          visitorTemp1.push(visitorTemp[contacts]);
        }
      }
    }
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          data:visitorTemp1,
          changeMaster: false,
          fromAppointmentPage : false,
          aData: this.VM.aData,
          addVisitorSettings: this.VM.aData
        }
      }
    };
    this.router.navigate(['add-visitors'], navigationExtras);
  }

  addVisitors(){
    var visitorTemp = [];
    for(let contacts in this.VM.visitors){
      for(let visitors in this.VM.visitors[contacts].contacts){
        if(this.VM.visitors[contacts].contacts[visitors]["isChecked"]){
          visitorTemp.push(this.VM.visitors[contacts].contacts[visitors]);
        }
      }
    }
    var visitorTemp1 =this.visitors1;
    if(visitorTemp.length > 0){
      for(let contacts in visitorTemp){
        var exist = false;
        for(let visitors in this.visitors1){
          if(this.visitors1[visitors].SEQ_ID == visitorTemp[contacts].SEQ_ID){
            this.visitors1[visitors].VisitorDesignation = "";
            this.visitors1[visitors].VISITOR_COMPANY =  this.visitors1[visitors].VISITOR_COMPANY? this.visitors1[visitors].VISITOR_COMPANY : this.visitors1[visitors].VISITOR_COMPANY_ID;
            this.visitors1[visitors].VisitorBookingSeqId = this.visitors1[visitors].VisitorBookingSeqId ? this.visitors1[visitors].VisitorBookingSeqId :"";
            this.visitors1[visitors].ImageChanged = this.visitors1[visitors].ImageChanged ? this.visitors1[visitors].ImageChanged : 0;
            this.visitors1[visitors] = visitorTemp[contacts];
            exist = true;
          }
        }
        if(!exist){
          visitorTemp[contacts].VisitorDesignation = "";
          visitorTemp[contacts].VISITOR_COMPANY = visitorTemp[contacts].VISITOR_COMPANY ? visitorTemp[contacts].VISITOR_COMPANY : visitorTemp[contacts].VISITOR_COMPANY_ID;
          visitorTemp[contacts].VisitorBookingSeqId = visitorTemp[contacts].VisitorBookingSeqId ? visitorTemp[contacts].VisitorBookingSeqId :"";
          visitorTemp[contacts].ImageChanged = visitorTemp[contacts].ImageChanged ? visitorTemp[contacts].ImageChanged : 0;
          visitorTemp1.push(visitorTemp[contacts]);
        }
      }
    }

    var data = {
      data:visitorTemp1,
      aData: this.VM.aData
    }
    this.events.publishDataCompany({
      action : 'user:created',
      title: "ManageVisitor",
      message: data
    });
    this.navCtrl.pop();


  }

  onCancel(){
    this.VM.visitors = [];
  }

  getVisitorsBySearch(queryText, typing, refresher){
    if(typing){
      this.OffSet = 0;
      this.VM.queryText = queryText;
    }

    // this.VM.host_search_id = "adam";
    if(this.VM.queryText.length >= 2){
      var params = {
        "SearchString":this.VM.queryText,
        "OffSet":this.OffSet+"",
        "Rows":"20000"
     }
     this.apiProvider.SearchExistVisitor(params).then(
       (val) => {
        const searchContactsArray= JSON.parse(val.toString());
        let selectedCat = '';
        try {
          selectedCat = this.VM.aData['visitor_ctg'].visitor_ctg_id;
        } catch (error) {
          const item = JSON.parse(this.VM.aData + '');
          selectedCat = item.visitor_ctg.visitor_ctg_id;
        }
        this.VM.searchContactsArray = [];
        searchContactsArray.forEach(element => {
          element.VisitorCategory = selectedCat;
          this.VM.searchContactsArray.push(element);
        });

        //  for(let contacts in this.contactsArray){
        //   for(let visitors in this.contactsArray[contacts].contacts){
        //     if(this.contactsArray[contacts].contacts[visitors]["isChecked"]){
        //       this.tempContactArray.push(this.contactsArray[contacts].contacts[visitors]);
        //     }
        //   }
        // }


         for(let items in this.VM.searchContactsArray){
          this.VM.searchContactsArray[0].isChecked = false
          for(let olditems in this.visitors1){
            if(this.visitors1[olditems].SEQ_ID == this.VM.searchContactsArray[items].SEQ_ID){
              this.VM.searchContactsArray[items].isChecked = true;
              break;
            }
          }
         }
         const sorted = this.VM.searchContactsArray.sort((a, b) => a.VISITOR_NAME > b.VISITOR_NAME ? 1 : -1);
         const grouped = sorted.reduce((groups, contact) => {
           const letter = contact.VISITOR_NAME.charAt(0);
           groups[letter] = groups[letter] || [];
           groups[letter].push(contact);
           return groups;
         }, {});
         const result = Object.keys(grouped).map(key => ({key, contacts: grouped[key]}));

         if(refresher){
          this.VM.visitors = result.concat(this.VM.visitors);
          refresher.target.complete();
         }else{
          this.VM.visitors = result;
         }

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
    }else{
      if(refresher){
        refresher.target.complete();
       }
    }

  }

  async visitorSelected(item){
    console.log("Clicked:"+ JSON.stringify(item));
    if(this.appSettings && this.appSettings.EmailEnabled && this.appSettings.EmailRequired && !item.EMAIL){
      let alert = await this.alertCtrl.create({
        header: 'Error !',
        message: this.T_SVC['ALERT_TEXT.UPDATE_VISITOR_EMAIL'],
        cssClass: 'alert-danger',
        buttons: [{
          text: 'Okay',
          handler: () => {
            console.log('Cancel clicked');
            item.isChecked = false;
          }
        }]
      });
        alert.present();
        alert.onDidDismiss().then(() => {
          item.isChecked = false;
        });
      return;
    }
    this.isAnyoneSelected = false;
    for(let contacts in this.VM.visitors){
      for(let visitors in this.VM.visitors[contacts].contacts){
        const selectedItem = this.VM.visitors[contacts].contacts[visitors];
        if(selectedItem.isChecked){
          this.isAnyoneSelected = true;
          return;
        }
      }
    }

  }

  doRefresh(refresher) {

    this.OffSet = this.VM.searchContactsArray.length;
    this.getVisitorsBySearch(null, false, refresher);
    //setTimeout(()=>{refresher.target.complete();},2000)
  }
  editVisitors(slideDOM:IonItemSliding, type, visitor: any){
    slideDOM.close();
    if(type == 'edit'){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            changeMaster: true,
            fromAppointmentPage : false,
            visitor:visitor,
            addVisitorSettings: this.VM.aData
          }
        }
      };
      this.router.navigate(['add-visitors'], navigationExtras);
    }
  }

  editVisitor(visitor: any){
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          changeMaster: true,
          fromAppointmentPage : false,
          visitor:visitor,
          addVisitorSettings: this.VM.aData
        }
      }
    };
    this.router.navigate(['add-visitors'], navigationExtras);
  }

  ngOnInit() {
  }

}
