import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { VisitorInfoModal } from 'src/app/model/visitorInfoModal';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-select-staff',
  templateUrl: './select-staff.page.html',
  styleUrls: ['./select-staff.page.scss'],
})
export class SelectStaffPage implements OnInit {


  VM = {
    "queryText":"",
    "HostList": [],
    "HostListClone": [],

  };
  selectedStaff = '';
  done = false;
  T_SVC:any;
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
      var masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
      if(masterDetails){
        this.VM.HostList = JSON.parse(masterDetails).Table6;
        this.VM.HostListClone = JSON.parse(masterDetails).Table6;
      }
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          if (passData.data){
            this.selectedStaff =  passData.data;
          }
        }
      });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter SelectStaffPage');

  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  onCancel(){

  }

  getStaffBySearch(){
    if (this.VM.queryText){
      this.VM.HostList =  this.VM.HostListClone.filter((item) =>
				{
					return item.HOSTNAME.toLowerCase().indexOf(this.VM.queryText.toLowerCase()) > -1;
				})
    } else {
      this.VM.HostList =  this.VM.HostListClone;
    }
  }

  selectCompany(){
  }

  addStaff(){
    let host = this.VM.HostList.find(item => item.HOSTIC === this.selectedStaff);

    var data =  {
      "HOSTIC":this.selectedStaff,
      "HOSTNAME": '',
      "HostExt": ''
    }
    if (host) {
      data.HOSTNAME = host.HOSTNAME;
      data.HostExt = host.HostExt;
    }
    this.events.publishDataCompany({
      action: 'user:created',
      title: "StaffSelection",
      message: JSON.stringify(data)
    });
    this.navCtrl.pop();
  }


  ngOnInit() {
  }

}
