export const AppSettings = Object.freeze({
    STATUS_BAR_COLOR : '#f0878c',
    AVAILABLE_APP_RUN_AT:[
        {"id":"ViMS_WINDOWS_001","title":"ViMS Windows Base"},
        {"id":"ViMS_WEB_001","title":"ViMS WEB Base 1"},
        {"id":"ViMS_WEB_002","title":"ViMS WEB Base 2"}
    ],
    //DEFAULT_APP_RUN_AT:this.AVAILABLE_APP_RUN_AT[0],
    SCREEN_SIZE:{
        NORMAL_PORTRAIT : "NORMAL_Portrait",
        NORMAL_LANDSCAP : "NORMAL_LandScap",
        TABLET_PORTRAIT : "TABLET_Portrait",
        TABLET_LANDSCAP : "TABLET_LandScap",

    },
    APP_API_SETUP:{
        debug:{
            api_url:"",
            api_img_url:""
        },
        demo:{
            api_url:"",
            api_img_url:""
        },
        live:{
            server: '',
            api_url:'',
            api_img_url:'',
        }

    },

    DEFAULT_SETTINGS: {
      "showQuickPass": true,
      "showPreAppointment": true,
      "QuickPass": {
        "ImageCaptureEnabled": true,
        "ImageCaptureRequired": false,
        "ShowVisitorExpiryTime": true,
        "ShowVehicleNo": false,
        "ShowRemarks": false
      },
      "addVisitor": {
        "NameEnabled": true,
        "NameRequired": true,
        "NameLable": "Name",
        "IdProofEnabled": true,
        "IdProofRequired": true,
        "IdProofLable": "NRIC",
        "EmailEnabled": false,
        "EmailRequired": false,
        "EmailLable": "Email",
        "CompanyEnabled": false,
        "CompanyRequired": false,
        "CompanyLable": "Company",
        "CategoryEnabled": false,
        "CategoryRequired": false,
        "CategoryLable": "Category",
        "ContactNumberEnabled": true,
        "ContactNumberRequired": false,
        "ContactNumberLable": "ContactNumber",
        "VehicleNumberEnabled": true,
        "VehicleNumberRequired": false,
        "VehicleNumberLable": "VehicleNumber",
        "GenderEnabled": false,
        "GenderRequired": false,
        "GenderLable": "Gender",
        "AddressEnabled": false,
        "AddressRequired": false,
        "AddressLable": "Address",
        "CountryEnabled": false,
        "CountryRequired": false,
        "CountryLable": "Country",
        "ImageUploadEnabled": false,
        "ImageUploadRequired": false,
        "VerificationDocEnabled": true,
        "VerificationDocRequired": false,
        "VerificationDocLabel": "Verification document upload",
        "additionalDocLimit": 3
      },
      "Header": {
        "HeaderTitle": "Calms technology",
        "HeaderSize": 18,
        "HeaderColor": "#fbf7f8",
        "HeaderFontWeight": "Regular",
        "FontWeight": "Bold"
      },
      "SubHeader": {
        "SubHeaderSize": 10,
        "SubHeaderColor": "#f8f6f6",
        "SubHeaderFontWeight": "Regular"
      },
      "FooterTab": {
        "FooterSize": 10,
        "FooterColor": "#f9f7f7",
        "FooterFontWeight": "Bold",
        "IconSize": 22
      },
      "LogoImg": "",
      "OCR_Enabled": false,
      "MyKad_Enabled": false,
      "Sync_Interval": 10,
      "LogoImgUrl": "",
      "customStyle": {
        "AppTheme": "#dc1c79",
        "buttonStyle": {
          "btnColor1": "#FF512F",
          "btnColor2": "#DD2476",
          "btnTextColor": "#ffffff",
          "btnTextSize": 16,
          "btnBorderRadius": 10
        },
        "Cards": {
          "Card1": {
            "title": "Today Appointment",
            "fontSize": 10,
            "fontColor": "#2f7933",
            "countFontSize": 32,
            "countColor": "#2d733f"
          },
          "Card2": {
            "title": "OverAll Check-In",
            "fontSize": 10,
            "fontColor": "#1dd7ce",
            "countFontSize": 32,
            "countColor": "#31cfc7"
          },
          "Card3": {
            "title": "Today Check-In",
            "fontSize": 10,
            "fontColor": "#374ab7",
            "countFontSize": 32,
            "countColor": "#3a4e9f"
          },
          "Card4": {
            "title": "Today Check-Out",
            "fontSize": 10,
            "fontColor": "#31b545",
            "countFontSize": 32,
            "countColor": "#43b941"
          },
          "Card5": {
            "title": "Overstayed",
            "fontSize": 10,
            "fontColor": "#eb445a",
            "countFontSize": 14,
            "countColor": "#eb445a",
            "HeaderColor": "#e7646d",
            "FontSize": 32
          },
          "Card6": {
            "title": "Currently Check-In",
            "fontSize": 10,
            "fontColor": "#18b097",
            "countFontSize": 32,
            "countColor": "#1cb093"
          }
        }
      }
    },

    // -------- SQlite DB Setup ------------
    LOCAL_SQLITE_DB_NAME:"ViMS-HOST-01.db",
    LOCAL_USER_SETUP:{
        "enb_version_choose": true,
        "enb_language_choose": true,
    },

    LOGINTYPES : {
        "HOSTAPPT": "HOSTAPPT",
        "HOSTAPPT_FACILITYAPP": "HOSTWITHFB",
        "ACKAPPT": "ACKMT",
        "FACILITY": "FB",
        "DISPLAYAPP": "FBDISPLAY",
        "SECURITYAPP": "SECAPP"
    },

    ACK_APP : {
        TYPE1 : 10,
        TYPE2 : 20
    },

    Individual:"Individual",
    Group:"Group",

    Tablet : "Tablet",
    OtherSource : "Other source",

    SHOW_START_WIZARD: false, // Intro wizard Show / Hide Option

    // -------- Language Setup ------------
    AVAILABLE_LANGUAGE:[
        {"id" : "en", "TCODE": "LANGUAGE.ENGLISH"},
        {"id" : "my", "TCODE": "LANGUAGE.MALAY"},
        {"id" : "tm", "TCODE": "LANGUAGE.TAMIL"}
      ],
    DEFAULT_LANGUAGE_ID: {"id" : "en", "TCODE": "LANGUAGE.ENGLISH"},
    TEST_DATA : {
        //Samsung
        // SAMPLE_DEVICE_ID : "9f2b72d35e1b64a6",
        // Redmi
        SAMPLE_DEVICE_ID : "b3e4f63b8f6b7042"

    },
    APPOINTMENT_BufferTime : 120,
    IdleListenBufferTime : 60000,
    // API_DATABASE_NAME : "SEpurse",
    // LOCAL_DB : "VimsHost_Demo.db",
    API_DATABASE_NAME : "SEpurseLocal",
    LOCAL_DB : "VimsHost_Dev.db",
    DATABASE : {
        TABLE: {
            Notification : "Notification"
        },
        NOTIFICATION : {
            PNHistory: "PNHistory",
            RefPushSeqId: "RefPushSeqId",
            RefUserSeqId:"RefUserSeqId",
            IsRead : "IsRead",
            PushSeqId:"PushSeqId",
            HtmlContent: "HtmlContent",
            NotificationType : "NotificationType",
            CreatedOn : "CreatedOn"
        }

    },
    API_ViDEO_PATH : "http://124.217.235.107:1021/FS/",
    LOCAL_STORAGE: {
        "MASTER_DETAILS": "MasterDetails",
        "HOST_DETAILS": "HostDetails",
        "COMPANY_DETAILS": "CompanyDetails",
        "ACK_DETAILS": "AckDetails",
        "FASILITY_DISPLAY_KIOSK_SETUP": "FASILITY_DISPLAY_KIOSK_SETUP",
        "SEL_FASILITY_DISPLAY_KIOSK_FACILITY":"SEL_FASILITY_DISPLAY_KIOSK_FACILITY",
        "DISPLAY_DETAILS": "DisplayDetails",
        "SECURITY_DETAILS": "SecurityDetails",
        "SECURITY_USER_DETAILS": "SecurityUserDetails",
        "QRCODE_INFO":"QRCodeInfo",
        "FCM_ID":"FCMID",
        "LOGIN_TYPE": "LoginType",
        "NOTIFICATION_COUNT":"NotificationCount",
        "PREAPPOINTMENTAUTOAPPROVE":"PreAppointmentAutoApprove",
        "NOTIFY_TIME": "NotifyTime",
        "SIGN_PAD": "SignPad",
        "APPLICATION_HOST_SETTINGS": "ApplicationHostSettings",
        "HOST_ACCESS_SETTINGS": "VIMS_HOST_ACCESS_SETTINGS",
        "HOST_ACCESS_TIMEOUT": "VIMS_HOST_ACCESS_TIMEOUT",
        "APPLICATION_ACK_SETTINGS": "ApplicationAcknowledgemntSettings",
        "APPLICATION_SECURITY_SETTINGS": "ApplicationSecuritySettings",
        "APPOINTMENT_VISITOR_DATA": "appointmentVisitorData",
        "FACILITY_VISITOR_DATA": "facilityVisitorData",
    },

    QUICKPASS_TYPES : {
        TotalGuestInside : "TotalGuestInside",
        TotalUnusedExpiredPass : "TotalUnusedExpiredPass",
        TotalUsedPass : "TotalUsedPass",
        TotalUnusedPass : "TotalUnusedPass",
        TotalFinishedOverstayPass : "TotalFinishedOverstayPass",
        TotalCurrentOverStayPass : "TotalCurrentOverStayPass"
    }
})
