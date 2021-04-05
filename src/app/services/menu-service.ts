import {IService} from './IService';
import {Injectable} from '@angular/core';
import {AppSettings} from '../services/app-settings'
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Observable } from 'rxjs';
@Injectable()
export class MenuService implements IService{
    constructor(private spinnerDialog:SpinnerDialog){}
    getId = ():string => "Menu";
    getTitle = ():string => "ViMS Host";
    getAllPages = (): Array<any> => {
        var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
        var menus = [
            {"title":"Home","icon":"siva-icon-home-3", "component":"HomeView"},
            {"title":"Appointment","icon":"siva-icon-calendar-check-o", "component":"", "subMenu":[
                {"title":"Create Appointment","icon":"siva-icon-calendar-plus-o", "component":"AddAppointmentPage"},
                {"title":"Appointment History","icon":"siva-icon-calendar-3", "component":"AppointmentHistoryPage"},
                {"title":"My Visitors","icon":"siva-icon-group", "component":"MyVisitorsPage"}
            ]},
            {"title":"Calendar View","icon":"siva-icon-calendar-7", "component":"ManageAppointmentPage"},
            {"title":"Notification","icon":"siva-icon-bell-2", "component":"NotificationPage"},
            {"title":"Settings","icon":"siva-icon-sliders", "component":"SettingsViewPage"}
        ];
        if(!qrInfo){
            return menus;
        }
        var QRObj = JSON.parse(qrInfo);
        if(QRObj && QRObj.MAppId){
            switch(QRObj.MAppId){
                case AppSettings.LOGINTYPES.HOSTAPPT:
                var showQP = false;
                var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
                if(settings && JSON.parse(settings)){
                    try{
                        var hostSettings = JSON.parse(settings).Table2[0];
                        showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled && hostSettings.QuickPassEnabled;
                    }catch(e){

                    }
                }
                if(showQP){
                    menus = [
                        {"title":"Home","icon":"siva-icon-home-3", "component":"HomeView"},
                        {"title":"Appointment","icon":"siva-icon-calendar-check-o", "component":"", "subMenu":[
                            {"title":"Create Appointment","icon":"siva-icon-calendar-plus-o", "component":"AddAppointmentPage"},
                            {"title":"Appointment History","icon":"siva-icon-calendar-3", "component":"AppointmentHistoryPage"},
                            {"title":"My Visitors","icon":"siva-icon-group", "component":"MyVisitorsPage"}
                        ]},
                        {"title":"Calendar View","icon":"siva-icon-calendar-7", "component":"ManageAppointmentPage"},
                        {"title":"Quick Pass","icon":"siva-icon-qrcode", "component":"", "subMenu":[
                            {"title":"Create Quick Pass","icon":"siva-icon-hand-lizard-o", "component":"CreateQuickPassPage"},
                            {"title":"Quick Pass Dashboard","icon":"siva-icon-calendar-3", "component":"QuickPassDashBoardPage"}
                        ]},
                        {"title":"Notification","icon":"siva-icon-bell-2", "component":"NotificationPage"},
                        {"title":"Settings","icon":"siva-icon-sliders", "component":"SettingsViewPage"}
                    ];
                }else{
                    menus = [
                        {"title":"Home","icon":"siva-icon-home-3", "component":"HomeView"},
                        {"title":"Appointment","icon":"siva-icon-calendar-check-o", "component":"", "subMenu":[
                            {"title":"Create Appointment","icon":"siva-icon-calendar-plus-o", "component":"AddAppointmentPage"},
                            {"title":"Appointment History","icon":"siva-icon-calendar-3", "component":"AppointmentHistoryPage"},
                            {"title":"My Visitors","icon":"siva-icon-group", "component":"MyVisitorsPage"}
                        ]},
                        {"title":"Calendar View","icon":"siva-icon-calendar-7", "component":"ManageAppointmentPage"},
                        {"title":"Notification","icon":"siva-icon-bell-2", "component":"NotificationPage"},
                        {"title":"Settings","icon":"siva-icon-sliders", "component":"SettingsViewPage"}
                    ];
                }

                  break;
                case AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP:
                    showQP = false;
                    settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
                    if(settings && JSON.parse(settings)){
                        try{
                            hostSettings = JSON.parse(settings).Table2[0];
                            showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled && hostSettings.QuickPassEnabled;
                        }catch(e){

                        }
                    }
                    if(showQP){
                        menus = [
                            {"title":"Home","icon":"siva-icon-home-3", "component":"HomeView"},
                            {"title":"Appointment","icon":"siva-icon-calendar-check-o", "component":"", "subMenu":[
                                {"title":"Create Appointment","icon":"siva-icon-calendar-plus-o", "component":"AddAppointmentPage"},
                                {"title":"Appointment History","icon":"siva-icon-calendar-3", "component":"AppointmentHistoryPage"},
                                {"title":"My Visitors","icon":"siva-icon-group", "component":"MyVisitorsPage"}
                            ]},
                            {"title":"Facility Booking","icon":"siva-icon-book-open-1", "component":"", "subMenu": [
                                {"title":"Create Facility Booking","icon":"siva-icon-bookmark-2", "component":"FacilityBookingPage"},
                                {"title":"Facility History","icon":"siva-icon-grid", "component":"FacilityBookingHistoryPage"}
                            ]},
                            {"title":"Calendar View","icon":"siva-icon-calendar-7", "component":"ManageAppointmentPage"},
                            {"title":"Quick Pass","icon":"siva-icon-qrcode", "component":"", "subMenu":[
                                {"title":"Create Quick Pass","icon":"siva-icon-hand-lizard-o", "component":"CreateQuickPassPage"},
                                {"title":"Quick Pass Dashboard","icon":"siva-icon-calendar-3", "component":"QuickPassDashBoardPage"}
                            ]},
                            {"title":"Notification","icon":"siva-icon-bell-2", "component":"NotificationPage"},
                            // {"title":"Profile","icon":"siva-icon-user-outline", "component":"UserProfilePage"},
                            {"title":"Settings","icon":"siva-icon-sliders", "component":"SettingsViewPage"}
                        ];
                    }else{
                        menus = [
                            {"title":"Home","icon":"siva-icon-home-3", "component":"HomeView"},
                            {"title":"Appointment","icon":"siva-icon-calendar-check-o", "component":"", "subMenu":[
                                {"title":"Create Appointment","icon":"siva-icon-calendar-plus-o", "component":"AddAppointmentPage"},
                                {"title":"Appointment History","icon":"siva-icon-calendar-3", "component":"AppointmentHistoryPage"},
                                {"title":"My Visitors","icon":"siva-icon-group", "component":"MyVisitorsPage"}
                            ]},
                            {"title":"Facility Booking","icon":"siva-icon-book-open-1", "component":"", "subMenu": [
                                {"title":"Create Facility Booking","icon":"siva-icon-bookmark-2", "component":"FacilityBookingPage"},
                                {"title":"Facility History","icon":"siva-icon-grid", "component":"FacilityBookingHistoryPage"}
                            ]},
                            {"title":"Calendar View","icon":"siva-icon-calendar-7", "component":"ManageAppointmentPage"},
                            {"title":"Notification","icon":"siva-icon-bell-2", "component":"NotificationPage"},
                            // {"title":"Profile","icon":"siva-icon-user-outline", "component":"UserProfilePage"},
                            {"title":"Settings","icon":"siva-icon-sliders", "component":"SettingsViewPage"}
                        ];
                    }
                  break;
                case AppSettings.LOGINTYPES.FACILITY:
                    menus = [
                        {"title":"Home","icon":"siva-icon-home-3", "component":"FacilityUpcomingPage"},
                        {"title":"Facility Booking","icon":"siva-icon-book-open-1", "component":"", "subMenu": [
                            {"title":"Create Facility Booking","icon":"siva-icon-bookmark-2", "component":"FacilityBookingPage"},
                            {"title":"Facility History","icon":"siva-icon-grid", "component":"FacilityBookingHistoryPage"}
                        ]},
                        {"title":"Calendar View","icon":"siva-icon-calendar-7", "component":"ManageAppointmentPage"},
                        {"title":"Notification","icon":"siva-icon-bell-2", "component":"NotificationPage"},
                        {"title":"Settings","icon":"siva-icon-sliders", "component":"SettingsViewPage"}
                    ];
                    break;
                case AppSettings.LOGINTYPES.DISPLAYAPP:
                    menus = [];
                    break;
                case AppSettings.LOGINTYPES.ACKAPPT:
                    menus = [];
                    break;
              }
              return menus;
        }

    }
    getDataForTheme = () => {
        var title = "";
        var dept = "";
        var email = "";
        var company = "";
        var companyImage = "";
        var image = "";
        var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
        var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
        if(qrData){
            companyImage = JSON.parse(qrData).ApiUrl;
            image = companyImage;
        }
        if(hostData){
            title = JSON.parse(hostData).HOSTNAME;
            dept = JSON.parse(hostData).DEPARTMENT_REFID;
            email = JSON.parse(hostData).HOST_EMAIL;
            companyImage = companyImage+'/Handler/ImageHandler.ashx?RefSlno=' + Math.round(JSON.parse(hostData).COMPANY_REFID) +"&RefType=CP&Refresh="+ new Date().getTime();
            image = image+'/Handler/ImageHandler.ashx?RefSlno=' + Math.round(JSON.parse(hostData).SEQID)  + "&RefType=HP&Refresh="+ new Date().getTime();
        }
        var companyData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS);
        if(companyData){
            company = JSON.parse(companyData).comp_name;
        }

        return {
            "background": "../../../assets/images/profile_bg.jpg",
            "image": companyImage,
            "title": title,
            "email":email,
            "company":company,
            "description": dept,
            "hostImage": image
        };
    }
    getEventsForTheme = (menuItem: any): any => {
        return {};
    };
    prepareParams = (item: any) => {
        return {
          title: item.title,
          data: {},
          events: this.getEventsForTheme(item)
        };
    };
    load = (item:any): Observable<any> => {
        this.spinnerDialog.show(null, "Loading");
        return new Observable(observer => {
            this.spinnerDialog.hide();
            observer.next(this.getDataForTheme());
            observer.complete();
          });
    }
}
