import { IService } from './IService';
import { Injectable } from '@angular/core';
import { AppSettings } from '../services/app-settings'
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Observable } from 'rxjs';
@Injectable()
export class MenuService implements IService {
    constructor(private spinnerDialog: SpinnerDialog) { }
    getId = (): string => "Menu";
    getTitle = (): string => "ViMS Host";
    getAllPages = (): Array<any> => {
        var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
        var menus = [
        ];
        if (!qrInfo) {
            return menus;
        }
        var QRObj = JSON.parse(qrInfo);
        if (QRObj && QRObj.MAppId) {

          var showQP = false;
          var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
          if (settings && JSON.parse(settings)) {
              try {
                  var hostSettings = JSON.parse(settings).Table1[0];
                  showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled;
              } catch (e) {

              }
          }
          menus = [];
          if (QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
            const tamsSettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_SETTINGS);
            const subMenu = [];
            if (tamsSettings){
              const TAMS_MODULE = JSON.parse(tamsSettings).modules;
              if (TAMS_MODULE.MySchedule === 1){
                subMenu.push({ "title": "My Schedule", "icon": "create-outline", "component": "tamsmyschedule" });
              }
              if (TAMS_MODULE.MyAttendance === 1){
                subMenu.push({ "title": "My Attendance", "icon": "calendar-number-outline", "component": "tamsmyattendance" });
              }
              if (TAMS_MODULE.RegisterAttendance === 1){
                subMenu.push({ "title": "Register Attendance", "icon": "add-circle-outline", "component": "tamsregisterattendance" });
              }
              if (TAMS_MODULE.GeoLocation === 1){
                subMenu.push({ "title": "Geo Location", "icon": "location-outline", "component": "tamsmyattendancelocation" });
              }
              if (TAMS_MODULE.AttendanceLog === 1){
                subMenu.push({ "title": "Attendance Logs", "icon": "document-text-outline", "component": "tamsmyattendancelogs" });
              }
            }
            menus = [
              {
                "title": "Attendance", "icon": "calendar-number-outline", "component": "", "subMenu": subMenu
              }
            ];
          } else {
            menus.push({ "title": "Home", "icon": "home-outline", "component": "home-view" });
            if (QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTAPPT) > -1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1) {
              menus.push({
                "title": "Appointment", "icon": "calendar-outline", "component": "", "subMenu": [
                    { "title": "Create Appointment", "icon": "create-outline", "component": "add-appointment" },
                    { "title": "Appointment History", "icon": "list-circle-outline", "component": "appointment-history" },
                    { "title": "My Visitors", "icon": "people-outline", "component": "my-visitors" }
                ]
              });
            }
            if (QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1) {
              menus.push({
                "title": "Facility Booking", "icon": "bookmark-outline", "component": "", "subMenu": [
                    { "title": "Create Facility Booking", "icon": "create-outline", "component": "facility-booking" },
                    { "title": "Facility History", "icon": "list-outline", "component": "facility-booking-history" }
                ]
              });
            }
            if (QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTAPPT) > -1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1){
              menus.push({ "title": "Calendar View", "icon": "calendar-number-outline", "component": "manage-appointment" });
            }

            if (QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.TAMS) > -1) {
              const tamsSettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_SETTINGS);
              const subMenu = [];
              if (tamsSettings){
                const TAMS_MODULE = JSON.parse(tamsSettings).modules;
                if (TAMS_MODULE.MySchedule === 1){
                  subMenu.push({ "title": "My Schedule", "icon": "create-outline", "component": "tamsmyschedule" });
                }
                if (TAMS_MODULE.MyAttendance === 1){
                  subMenu.push({ "title": "My Attendance", "icon": "calendar-number-outline", "component": "tamsmyattendance" });
                }
                if (TAMS_MODULE.RegisterAttendance === 1){
                  subMenu.push({ "title": "Register Attendance", "icon": "add-circle-outline", "component": "tamsregisterattendance" });
                }
                if (TAMS_MODULE.GeoLocation === 1){
                  subMenu.push({ "title": "Geo Location", "icon": "location-outline", "component": "tamsmyattendancelocation" });
                }
                if (TAMS_MODULE.AttendanceLog === 1){
                  subMenu.push({ "title": "Attendance Logs", "icon": "document-text-outline", "component": "tamsmyattendancelogs" });
                }
              }
              menus.push({
                  "title": "Attendance", "icon": "calendar-number-outline", "component": "", "subMenu": subMenu
                });
            }
            if (showQP) {
              menus.push({
                "title": "Quick Pass", "icon": "qr-code-outline", "component": "", "subMenu": [
                    { "title": "Create Quick Pass", "icon": "create-outline", "component": "create-quick-pass" },
                    { "title": "Quick Pass Dashboard", "icon": "analytics-outline", "component": "quick-pass-dash-board-page" }
                ]
              });
            }
          }
          if (QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) > -1) {
            menus.push({ "title": "Notification", "icon": "notifications-outline", "component": "notifications" });
          }

          menus.push({ "title": "Settings", "icon": "settings-outline", "component": "settings-view-page" });
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
        if (qrData) {
            companyImage = JSON.parse(qrData).ApiUrl;
            image = companyImage;
        }
        if (hostData) {
            title = JSON.parse(hostData).HOSTNAME;
            dept = JSON.parse(hostData).DEPARTMENT_REFID;
            email = JSON.parse(hostData).HOST_EMAIL;
            companyImage = companyImage + '/Handler/PortalImageHandler.ashx?RefSlno=' + JSON.parse(qrData).CompanyId + "&ScreenType=10&Refresh=" + new Date().getTime();
            image = image + 'Handler/PortalImageHandler.ashx?RefSlno=' + Math.round(JSON.parse(hostData).SEQID) + "&ScreenType=30&Refresh=" + new Date().getTime();
        }
        var companyData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS);
        if (companyData) {
            company = JSON.parse(companyData).comp_name;
        }

        return {
            "background": "../../../assets/images/profile_bg.jpg",
            "image": companyImage,
            "title": title,
            "email": email,
            "company": company,
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
    load = (item: any): Observable<any> => {
        this.spinnerDialog.show(null, "Loading");
        return new Observable(observer => {
            this.spinnerDialog.hide();
            observer.next(this.getDataForTheme());
            observer.complete();
        });
    }
}
