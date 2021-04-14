import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, ToastController, AlertController, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage implements OnInit {

  selectedTap = "pending";
  pendingList : any = [];
  approvedList : any = [];
  cancelledList : any = [];
  OffSet = 0;
  appointments = [];
  checkAll = false;
  enableApproval = false;
  adminName = "VIMS Admin";
  T_SVC:any;
  showFab = true;
  loadingFinished = true;
  constructor(public navCtrl: NavController,
    private toastCtrl:ToastController,
    private router: Router,
    private translate:TranslateService,
    private alertCtrl: AlertController, public apiProvider: RestProvider, private menuCtrl: MenuController) {

    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.APPROVE_APPOINTMENT',
      'ALERT_TEXT.APPROVE_APPOINTMENT_ALL',
      'ALERT_TEXT.ENABLE_AUTO_APPROVE',
      'ALERT_TEXT.DISABLE_AUTO_APPROVE',
      'SETTINGS.ARE_U_SURE_ADMIN_LOGOUT']).subscribe(t => {
        this.T_SVC = t;
    });
    // this.menuCtrl.enable(false, 'myLeftMenu');

  }

  ionViewDidEnter() {

    console.log('ionViewDidEnter AdminHomePage');
  }

  onSegmentChange(){
    console.log(this.selectedTap);
    this.OffSet = 0;
    this.appointments = [];
    this.getAppointmentHistory(null);
  }


  ionViewWillEnter() {
		console.log('ionViewWillEnter AdminHomePage');
    this.OffSet = 0;
    // this.getPreAppointmentenableApprovalSettings();
		this.getAppointmentHistory(null);
  }

  getDayofDate(dateString){
		let dateObject = new Date(dateString);
		let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
		return weekdays[dateObject.getDay()];
  }

  checkIsToday(fromDate, toDate, dateCondition){
    if(fromDate && toDate){
      let fromdateObject = new Date(fromDate.split("T")[0]).getTime();
      // let todateObject = new Date(toDate.split("T")[0]).getTime();
      let cDatee = new Date();

      if(dateCondition == "Today"){
        var month = ""+ (cDatee.getMonth()+1);
        if(cDatee.getMonth()+1 < 10){
          month = "0"+ (cDatee.getMonth()+1);
        }
        var date = ""+ cDatee.getDate();
        if(cDatee.getDate()+1 < 10){
          date = "0"+ cDatee.getDate();
        }
        let todayObject = new Date(cDatee.getFullYear()+"-"+month+"-"+ date).getTime();
        if(todayObject == fromdateObject){
          return true;
        }else{
          return false;
        }
      }else if(dateCondition == "Tomorrow"){
        cDatee.setDate(cDatee.getDate() + 1);
        month = ""+ (cDatee.getMonth()+1);
        if(cDatee.getMonth()+1 < 10){
          month = "0"+ (cDatee.getMonth()+1);
        }
        date = ""+ cDatee.getDate();
        if(cDatee.getDate()+1 < 10){
          date = "0"+ cDatee.getDate();
        }
        let todayObject = new Date(cDatee.getFullYear()+"-"+month+"-"+ date).getTime();
        if(todayObject == fromdateObject){
          return true;
        }else{
          return false;
        }
      }else if(dateCondition == "Future"){
        cDatee.setDate(cDatee.getDate() + 2);
        month = ""+ (cDatee.getMonth()+1);
        if(cDatee.getMonth()+1 < 10){
          month = "0"+ (cDatee.getMonth()+1);
        }
        date = ""+ cDatee.getDate();
        if(cDatee.getDate()+1 < 10){
          date = "0"+ cDatee.getDate();
        }
        let todayObject = new Date(cDatee.getFullYear()+"-"+month+"-"+ date).getTime();
        if(todayObject <= fromdateObject){
          return true;
        }else{
          return false;
        }
      }

    }else{
      return false;
    }

  }


	doRefresh(refresher) {
    // this.OffSet = this.OffSet + 20;
    this.getAppointmentHistory(refresher);
    //setTimeout(()=>{refresher.target.complete();},2000)
	}

	getAppointmentHistory(refresher){
    this.loadingFinished = false;
		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var hostId = JSON.parse(hostData).HOST_ID;
			var params = {
      "hostID":hostId,
			"OffSet": ""+ this.OffSet,
      "Rows":"500",
      "StatusType":"0"
    };

    if(this.selectedTap == 'approved'){
      params.StatusType ="10";
    }else if(this.selectedTap == 'canceled'){
      params.StatusType ="20";
    }
			// this.VM.host_search_id = "adam";
			this.apiProvider.AppointmentApprovalList(params, refresher? true : false).then(
				(val) => {
          this.loadingFinished = true;
					var aList = JSON.parse(val.toString());
					if(refresher){
            this.appointments = aList;
            refresher.target.complete();
					}else{
            this.appointments = aList.concat(this.appointments);
					}
          this.OffSet = this.OffSet + aList.length;
          if(this.selectedTap == 'approved'){
            this.approvedList = this.appointments;
          }else if(this.selectedTap == 'canceled'){
            this.cancelledList = this.appointments;
          }else{
            this.pendingList = this.appointments;
          }
          // for(let items in this.appointments){
          //   var cObj = this.appointments[items];
          //   if(cObj.Approval_Status ==  "Pending"){
          //     this.pendingList.push(cObj);
          //   }else if(cObj.Approval_Status ==  "Approved"){
          //     this.approvedList.push(cObj);
          //   }else if(cObj.Approval_Status ==  "Canceled"){
          //     this.cancelledList.push(cObj);
          //   }
          // }
				},
				async (err) => {
          this.loadingFinished = true;
          if(refresher){
            refresher.target.complete();
          }
          if(err && err.message == "No Internet"){
            return;
          }
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
  }

  selectAll(){
    if(this.checkAll){
      for(var i = 0; i < this.pendingList.length; i++){
        this.pendingList[i].isChecked = true;
      }
    }else{
      for(i = 0; i < this.pendingList.length; i++){
        this.pendingList[i].isChecked = false;
      }
    }

  }


  checkSelectAll(){
    this.checkAll = true;
    for(var i = 0; i < this.pendingList.length; i++){
      if(!this.pendingList[i].isChecked){
        this.checkAll = false;
        break;
      }
    }
  }

  changeAllAppointmentStatus(){
    var appointment_group_id = "";
    for(var i = 0; i < this.pendingList.length; i++){
      if(appointment_group_id){
        appointment_group_id = appointment_group_id + "," + this.pendingList[i].appointment_group_id;
      }else{
        appointment_group_id = this.pendingList[i].appointment_group_id;
      }
    }
    this.ChangeAppointmentStatus("Approved", appointment_group_id);
  }

  async showChangeAppointmentStatusAlert(type, appointment_group_id){
    var status = "Cancel this appointment?";
    // var buttonText = "Ok"
    if(type == "Approved"){
      status = this.T_SVC['ALERT_TEXT.APPROVE_APPOINTMENT'];
    }else if(type == "All"){
      status = this.T_SVC['ALERT_TEXT.APPROVE_APPOINTMENT_ALL'];
    }
    let alert = this.alertCtrl.create({
      header: 'Change Appointment Status',
      cssClass:'alert-warning',
      message: status,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            if(type == "All"){
              this.changeAllAppointmentStatus();
            }else{
              this.ChangeAppointmentStatus(type, appointment_group_id)
            }

          }
        }
      ]
    });
    (await alert).present();
  }

  ChangeAppointmentStatus(type, appointment_group_id){
    var hostDetails = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS));
    var params = {
      "appointment_group_id":appointment_group_id,
      "Status": type,
      "HOSTIC" : hostDetails.HOSTIC
    }
    this.apiProvider.ChangeAppointmentStatus(params).then(
      (val) => {
        this.checkAll = false;
        this.appointments = [];
        this.pendingList = [];
        this.approvedList = [];
        this.cancelledList = [];
        this.OffSet = 0;
        this.getAppointmentHistory(null);
      },
      async (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
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
            cssClass: 'alert-danger',
            message: message,
            buttons: ['Okay']
          });
            alert.present();
        }
      }
    );
  }


  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  getPreAppointmentenableApprovalSettings(){
    this.apiProvider.GetPreAppointmentSettings({}).then(
			(val) => {
				var aList = JSON.parse(val.toString());
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.PREAPPOINTMENTAUTOAPPROVE, aList[0].maint_prefix);
        this.enableApproval = (aList[0].maint_prefix == "1");
			},
			async (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
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

  viewBooking(list){
    if(list[0].isFacilityAlone){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            appointment: list
          }
        }
      };
      this.router.navigate(['admin-appointment-details'], navigationExtras);
      return;
    }
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var HOSTIC = JSON.parse(hostData).HOSTIC;
			var params = {
			"STAFF_IC":HOSTIC,
			"appointment_group_id": list[0].appointment_group_id
		};
		// this.VM.host_search_id = "adam";
		this.apiProvider.GetAppointmentByGroupId(params).then(
			(val) => {
				var aList = JSON.parse(val.toString());
        const navigationExtras: NavigationExtras = {
          state: {
            passData: {
              appointment: aList,
              enableApproval: this.enableApproval,
              showOption : (this.selectedTap == 'pending')
            }
          }
        };
        this.router.navigate(['admin-appointment-details'], navigationExtras);
			},
			async (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
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
  }

  async changeAppointmentGlobalSettings(){

    const btns = [{
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'secondary',
      handler: (blah) => {
        console.log('Confirm Cancel: blah');
      }
    },
    {
      text: 'Proceed',
      handler: data => {
        console.log('Checkbox data:', data);
        var enableApproval = "0"
        var message = this.T_SVC['ALERT_TEXT.DISABLE_AUTO_APPROVE'];
        if(data.length > 0) {
          enableApproval = "1";
          message = this.T_SVC['ALERT_TEXT.ENABLE_AUTO_APPROVE'];
        }
        var params = {
          "AutoApproval": enableApproval
        }

        this.apiProvider.ChangeApppointmentApprovalSettings(params).then(
          async (val) => {
            let toast = await this.toastCtrl.create({
              message: message,
              duration: 3000
            });
            toast.present();
            if(enableApproval == "0"){
              this.enableApproval = false;
            }else{
              this.enableApproval = true;
            }
          },
          async (err) => {
            if(err && err.message == "No Internet"){
              return;
            }
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
                cssClass: 'alert-danger',
                message: message,
                buttons: ['Okay']
              });
                alert.present();
            }
          }
        );

      }
    }];
    // fab.close();
    let alert = await this.alertCtrl.create({ cssClass: 'alert-danger',
    header: 'Preappointment Approval',
    message: "(Note: If checked, preAppointment will be approved automatically)",
    inputs: [{
      name: 'autoApprove',
      type: 'checkbox',
      value: 'autoApprove',
      placeholder: 'Auto Approval',
      checked: this.enableApproval
      }],
    buttons: btns
    });

    alert.present();
  }


  logoutMe(){
    // fab.close();
    this.translate.get(['SETTINGS.ARE_U_SURE_LOGOUT_TITLE','SETTINGS.ARE_U_SURE_LOGOUT',
     'SETTINGS.EXIT_ACCOUNT_SCUSS','SETTINGS.EXIT_ACCOUNT_FAILED', 'SETTINGS.ARE_U_SURE_ADMIN_LOGOUT'
    ,'COMMON.OK','COMMON.CANCEL','COMMON.EXIT1']).subscribe(async t => {
      let loginConfirm = await this.alertCtrl.create({
        header: t['SETTINGS.ARE_U_SURE_LOGOUT_TITLE'],
        message: t['SETTINGS.ARE_U_SURE_ADMIN_LOGOUT'],
        cssClass: 'alert-warning',
        buttons: [
          {
            text: t['COMMON.EXIT1'],
            handler: () => {
              //this._app.getRootNav().setRoot(LoginPage);
              // this.toastCtrl.create(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.LOGIN_TYPE, "");
              this.menuCtrl.enable(true, 'myLeftMenu');
              this.navCtrl.navigateRoot("home-view");

            }
          }, {
            text: t['COMMON.CANCEL'],
            role: 'cancel',
            handler: () => {
            }
          }
        ]
      });
      loginConfirm.present();
    });
  }

  ngOnInit() {
  }

}
