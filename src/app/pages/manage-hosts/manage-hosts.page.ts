import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, AlertController, IonList } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-manage-hosts',
  templateUrl: './manage-hosts.page.html',
  styleUrls: ['./manage-hosts.page.scss'],
})
export class ManageHostsPage implements OnInit {

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
  imageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'Handler/PortalImageHandler.ashx?RefSlno=';
  imageURLType = '&ScreenType=30&Refresh='+ new Date().getTime();




  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    public apiProvider: RestProvider,
    private events: EventsService,
    private route: ActivatedRoute,
    private router: Router,
    private translate:TranslateService) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
        this.T_SVC = t;
    });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
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
        // ('', (user, data) => {
        // user and time are the same arguments passed in `events.publish(user, time)`
        console.log('Welcome', user, 'at', data);
        // this.params.hostImage = "assets/images/logo/2.png";
        // alert(this.params.hostImage);
        if(user == "editVisitor"){
          var visitor = JSON.parse(data);
          var tempImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno='+visitor.SEQID+ "&RefType=VP&Refresh="+ new Date().getTime();
          console.log('Welcome', user, 'at', tempImage);
          for(let contacts in this.VM.visitors){
            for(let visitors in this.VM.visitors[contacts].contacts){
              if(this.VM.visitors[contacts].contacts[visitors].SEQID == visitor.SEQID){
                //alert("Changed");
                this.VM.visitors[contacts].contacts[visitors].SEQID = visitor.SEQID;
                this.newImage = this.newImage +"_"+ new Date().getTime();
                break;
              }
            }
          }
        }
      }


    });

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
          if(this.visitors1[visitors].SEQID == visitorTemp[contacts].SEQID){
            exist = true;
          }
        }
        if(!exist){
          visitorTemp1.push(visitorTemp[contacts]);
        }
      }
    }

    var data = {
      data:visitorTemp1,
      aData: this.VM.aData
    }
    this.events.publishDataCompany({
      action: 'user:created',
      title: "ManageVisitor",
      message: data
    });
    this.navCtrl.pop();
  }

  onCancel(){
    this.VM.visitors = [];
  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  getVisitorsBySearch(event, typing, refresher){
    const queryText = event? event.target.value: '';
    if(typing){
      this.OffSet = 0;
      this.VM.queryText = queryText;
    }
    // this.VM.host_search_id = "adam";
    if(this.VM.queryText.length >= 3){
      var params = {
        "SearchString":this.VM.queryText,
        "OffSet":this.OffSet+"",
        "Rows":"20000"
     }
     this.apiProvider.SearchHost(params).then(
       (val) => {
        this.VM.searchContactsArray= JSON.parse(val.toString());

        //  for(let contacts in this.contactsArray){
        //   for(let visitors in this.contactsArray[contacts].contacts){
        //     if(this.contactsArray[contacts].contacts[visitors]["isChecked"]){
        //       this.tempContactArray.push(this.contactsArray[contacts].contacts[visitors]);
        //     }
        //   }
        // }


         for(let items in this.VM.searchContactsArray){
          this.VM.searchContactsArray[items].isChecked = false;
          for(let olditems in this.visitors1){
            if(this.visitors1[olditems].SEQID == this.VM.searchContactsArray[items].SEQID){
              this.VM.searchContactsArray[items].isChecked = true;
              break;
            }
          }
         }
         const sorted = this.VM.searchContactsArray.sort((a, b) => a.HOSTNAME > b.HOSTNAME ? 1 : -1);
         const grouped = sorted.reduce((groups, contact) => {
           const letter = contact.HOSTNAME.charAt(0);
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
        if(err && err.message == "Http failure response for"){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else if(err && JSON.parse(err) && JSON.parse(err).message){
          message =JSON.parse(err).message;
        }
        if(message){
          // message = " Unknown"
          let alert = this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass:'',
            buttons: ['Okay']
            });
            (await alert).present();
        }


       }
     );
    }else{
      if(refresher){
        refresher.target.complete();
       }
    }

  }

  visitorSelected(item){
    console.log("Clicked:"+item);
    this.isAnyoneSelected = false;
    for(let contacts in this.VM.visitors){
      for(let visitors in this.VM.visitors[contacts].contacts){
        if(this.VM.visitors[contacts].contacts[visitors]["isChecked"]){
          this.isAnyoneSelected = true;
          return;
        }
      }
    }

  }

  doRefresh(refresher) {

    this.OffSet = this.VM.searchContactsArray.length;
    this.getVisitorsBySearch('', false, refresher);
    //setTimeout(()=>{refresher.target.complete();},2000)
  }

  ngOnInit() {
  }

}
