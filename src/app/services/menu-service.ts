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
            { "title": "Home", "icon": "home-outline", "component": "home-view" },
            {
                "title": "Appointment", "icon": "calendar-outline", "component": "", "subMenu": [
                    { "title": "Create Appointment", "icon": "create-outline", "component": "add-appointment" },
                    { "title": "Appointment History", "icon": "list-circle-outline", "component": "appointment-history" },
                    { "title": "My Visitors", "icon": "people-outline", "component": "my-visitors" }
                ]
            },
            { "title": "Calendar View", "icon": "calendar-number-outline", "component": "manage-appointment" },
            { "title": "Notification", "icon": "notifications-outline", "component": "notifications" },
            { "title": "Settings", "icon": "settings-outline", "component": "settings-view-page" }
        ];
        if (!qrInfo) {
            return menus;
        }
        var QRObj = JSON.parse(qrInfo);
        if (QRObj && QRObj.MAppId) {
            switch (QRObj.MAppId) {
                case AppSettings.LOGINTYPES.HOSTAPPT:
                    var showQP = false;
                    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
                    if (settings && JSON.parse(settings)) {
                        try {
                            var hostSettings = JSON.parse(settings).Table1[0];
                            showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled;
                        } catch (e) {

                        }
                    }
                    if (showQP) {
                        menus = [
                            { "title": "Home", "icon": "home-outline", "component": "home-view" },
                            {
                                "title": "Appointment", "icon": "calendar-outline", "component": "", "subMenu": [
                                    { "title": "Create Appointment", "icon": "create-outline", "component": "add-appointment" },
                                    { "title": "Appointment History", "icon": "list-circle-outline", "component": "appointment-history" },
                                    { "title": "My Visitors", "icon": "people-outline", "component": "my-visitors" }
                                ]
                            },
                            { "title": "Calendar View", "icon": "calendar-number-outline", "component": "manage-appointment" },
                            {
                                "title": "Quick Pass", "icon": "qr-code-outline", "component": "", "subMenu": [
                                    { "title": "Create Quick Pass", "icon": "create-outline", "component": "create-quick-pass" },
                                    { "title": "Quick Pass Dashboard", "icon": "analytics-outline", "component": "quick-pass-dash-board-page" }
                                ]
                            },
                            { "title": "Notification", "icon": "notifications-outline", "component": "notifications" },
                            { "title": "Settings", "icon": "settings-outline", "component": "settings-view-page" }
                        ];
                    } else {
                        menus = [
                            { "title": "Home", "icon": "home-outline", "component": "home-view" },
                            {
                                "title": "Appointment", "icon": "calendar-outline", "component": "", "subMenu": [
                                    { "title": "Create Appointment", "icon": "create-outline", "component": "add-appointment" },
                                    { "title": "Appointment History", "icon": "list-circle-outline", "component": "appointment-history" },
                                    { "title": "My Visitors", "icon": "people-outline", "component": "my-visitors" }
                                ]
                            },
                            { "title": "Calendar View", "icon": "calendar-number-outline", "component": "manage-appointment" },
                            { "title": "Notification", "icon": "notifications-outline", "component": "notifications" },
                            { "title": "Settings", "icon": "settings-outline", "component": "settings-view-page" }
                        ];
                    }

                    break;
                    case AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS:
                      var showQP = false;
                      var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
                      if (settings && JSON.parse(settings)) {
                          try {
                              var hostSettings = JSON.parse(settings).Table1[0];
                              showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled;
                          } catch (e) {

                          }
                      }
                      if (showQP) {
                          menus = [
                              { "title": "Home", "icon": "home-outline", "component": "home-view" },
                              {
                                  "title": "Appointment", "icon": "calendar-outline", "component": "", "subMenu": [
                                      { "title": "Create Appointment", "icon": "create-outline", "component": "add-appointment" },
                                      { "title": "Appointment List View", "icon": "list-circle-outline", "component": "appointment-history" },
                                      { "title": "Appointment Calendar View", "icon": "calendar-number-outline", "component": "manage-appointment" },
                                      { "title": "My Visitors", "icon": "people-outline", "component": "my-visitors" }
                                  ]
                              },
                              {
                                "title": "Attendance", "icon": "calendar-outline", "component": "", "subMenu": [
                                    { "title": "My Schedule", "icon": "create-outline", "component": "add-appointment" },
                                    { "title": "My Attendance", "icon": "list-circle-outline", "component": "appointment-history" },
                                    { "title": "Register Attendance", "icon": "calendar-number-outline", "component": "manage-appointment" },
                                ]
                              },
                              {
                                  "title": "Quick Pass", "icon": "qr-code-outline", "component": "", "subMenu": [
                                      { "title": "Create Quick Pass", "icon": "create-outline", "component": "create-quick-pass" },
                                      { "title": "Quick Pass Dashboard", "icon": "analytics-outline", "component": "quick-pass-dash-board-page" }
                                  ]
                              },
                              { "title": "Notification", "icon": "notifications-outline", "component": "notifications" },
                              { "title": "Settings", "icon": "settings-outline", "component": "settings-view-page" }
                          ];
                      } else {
                          menus = [
                              { "title": "Home", "icon": "home-outline", "component": "home-view" },
                              {
                                  "title": "Appointment", "icon": "calendar-clear-outline", "component": "", "subMenu": [
                                      { "title": "Create Appointment", "icon": "create-outline", "component": "add-appointment" },
                                      { "title": "Appointment List View", "icon": "list-circle-outline", "component": "appointment-history" },
                                      { "title": "Appointment Calendar View", "icon": "calendar-outline", "component": "manage-appointment" },
                                      { "title": "My Visitors", "icon": "people-outline", "component": "my-visitors" }
                                  ]
                              },
                              {
                                "title": "Attendance", "icon": "calendar-number-outline", "component": "", "subMenu": [
                                    { "title": "My Schedule", "icon": "create-outline", "component": "add-appointment" },
                                    { "title": "My Attendance", "icon": "list-circle-outline", "component": "appointment-history" },
                                    { "title": "Register Attendance", "icon": "calendar-number-outline", "component": "manage-appointment" },
                                ]
                              },
                              { "title": "Notification", "icon": "notifications-outline", "component": "notifications" },
                              { "title": "Settings", "icon": "settings-outline", "component": "settings-view-page" }
                          ];
                      }

                      break;
                case AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP:
                    showQP = false;
                    settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
                    if (settings && JSON.parse(settings)) {
                        try {
                          hostSettings = JSON.parse(settings).Table1[0];
                          showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled;
                        } catch (e) {

                        }
                    }
                    if (showQP) {
                        menus = [
                            { "title": "Home", "icon": "home-outline", "component": "home-view" },
                            {
                                "title": "Appointment", "icon": "calendar-outline", "component": "", "subMenu": [
                                    { "title": "Create Appointment", "icon": "create-outline", "component": "add-appointment" },
                                    { "title": "Appointment History", "icon": "list-circle-outline", "component": "appointment-history" },
                                    { "title": "My Visitors", "icon": "people-outline", "component": "my-visitors" }
                                ]
                            },
                            {
                                "title": "Facility Booking", "icon": "bookmark-outline", "component": "", "subMenu": [
                                    { "title": "Create Facility Booking", "icon": "create-outline", "component": "facility-booking" },
                                    { "title": "Facility History", "icon": "list-outline", "component": "facility-booking-history" }
                                ]
                            },
                            { "title": "Calendar View", "icon": "calendar-number-outline", "component": "manage-appointment" },
                            {
                                "title": "Quick Pass", "icon": "qr-code-outline", "component": "", "subMenu": [
                                    { "title": "Create Quick Pass", "icon": "create-outline", "component": "create-quick-pass" },
                                    { "title": "Quick Pass Dashboard", "icon": "analytics-outline", "component": "quick-pass-dash-board-page" }
                                ]
                            },
                            { "title": "Notification", "icon": "notifications-outline", "component": "notifications" },
                            // {"title":"Profile","icon":"siva-icon-user-outline", "component":"UserProfilePage"},
                            { "title": "Settings", "icon": "settings-outline", "component": "settings-view-page" }
                        ];
                    } else {
                        menus = [
                            { "title": "Home", "icon": "home-outline", "component": "home-view" },
                            {
                                "title": "Appointment", "icon": "calendar-outline", "component": "", "subMenu": [
                                    { "title": "Create Appointment", "icon": "create-outline", "component": "add-appointment" },
                                    { "title": "Appointment History", "icon": "list-circle-outline", "component": "appointment-history" },
                                    { "title": "My Visitors", "icon": "people-outline", "component": "my-visitors" }
                                ]
                            },
                            {
                                "title": "Facility Booking", "icon": "bookmark-outline", "component": "", "subMenu": [
                                    { "title": "Create Facility Booking", "icon": "create-outline", "component": "facility-booking" },
                                    { "title": "Facility History", "icon": "list-outline", "component": "facility-booking-history" }
                                ]
                            },
                            { "title": "Calendar View", "icon": "calendar-number-outline", "component": "manage-appointment" },
                            { "title": "Notification", "icon": "notifications-outline", "component": "notifications" },
                            // {"title":"Profile","icon":"siva-icon-user-outline", "component":"UserProfilePage"},
                            { "title": "Settings", "icon": "settings-outline", "component": "settings-view-page" }
                        ];
                    }
                    break;
                case AppSettings.LOGINTYPES.FACILITY:
                    menus = [
                        { "title": "Home", "icon": "home-outline", "component": "facility-upcoming" },
                        {
                            "title": "Facility Booking", "icon": "bookmark-outline", "component": "", "subMenu": [
                                { "title": "Create Facility Booking", "icon": "create-outline", "component": "facility-booking" },
                                { "title": "Facility History", "icon": "list-outline", "component": "facility-booking-history" }
                            ]
                        },
                        { "title": "Calendar View", "icon": "calendar-number-outline", "component": "manage-appointment" },
                        { "title": "Notification", "icon": "notifications-outline", "component": "notifications" },
                        { "title": "Settings", "icon": "settings-outline", "component": "settings-view-page" }
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
        if (qrData) {
            companyImage = JSON.parse(qrData).ApiUrl;
            image = companyImage;
        }
        if (hostData) {
            title = JSON.parse(hostData).HOSTNAME;
            dept = JSON.parse(hostData).DEPARTMENT_REFID;
            email = JSON.parse(hostData).HOST_EMAIL;
            companyImage = companyImage + '/Handler/ImageHandler.ashx?RefSlno=' + Math.round(JSON.parse(hostData).COMPANY_REFID) + "&RefType=CP&Refresh=" + new Date().getTime();
            image = image + '/Handler/ImageHandler.ashx?RefSlno=' + Math.round(JSON.parse(hostData).SEQID) + "&RefType=HP&Refresh=" + new Date().getTime();
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
