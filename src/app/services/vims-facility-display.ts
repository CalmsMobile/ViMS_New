import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': '',
    'Access-Control-Allow-Credentials':"true",
    'Access-Control-Allow-Methods':'POST, GET, OPTIONS, DELETE, PUT',
    'Access-Control-Allow-Origin':'*',
    'Accept':"'application/json"
  })
};
@Injectable()
export class VimsFacilityDisplay {
    APP_SERVICES:any = {
      "getCommon":"getCommon?psRegKey=",
      "getBookingSlats":"getBookingSlats?psRegKey="
    }
    public URL:string = "http://124.217.235.107:3047/SetupBAL/FMS_BAL/fmsAdminBAL.svc/";
    constructor(public http: HttpClient, public myhttp:HTTP) {

    }
    sampleJSONProperties(){
      //return {"appSetup":{"map_url":"http://124.217.235.107:3047/","map_fmsfolder":"/SetupBAL/FMS_BAL/fmsAdminBAL.svc/","map_imageHandlerFolder":"/SetupBAL/IMGHandler/imageHandler.ashx?","psRegKey":"SEPurse","title":"Facility Booking","version":"1.0.0","BGType":"color","BGClr":"#262626","BGImg":"","font":{"alow":true,"selFont":"marko-one"},"language":{"alow":false,"selLang":"eng"},"currency":{"curSel":"MYR","curPos":"suffix"},"date":"dd/MM/yyyy","time":"t","errmsg":{"noInternet":"Please check your internet connection !","serverProb":"Connect to server problem !"}},"admnSetup":{"alowAppLoadSync":true,"alowPasCod":true,"pasCodVal":"1111","alowAdmnCard":false,"admnCardVals":"1234567890,3400723694","alowSetupAutoSynServr":true,"SetupAutoSynServrTimIntr":1},"FMSSetup":{"dataUpdatTimIntr":1,"enbHeader":true,"appHeader":{"size":"medium","enbLogo":true,"logo":"","title":"Facility Booking","BGClr":"rgba(0, 0, 0, 1)","txtClr":"#ffffff","enbTimeOrDate":true,"timeDateFormat":"ddd hh:mm tt"},"enbFooter":true,"appFooter":{"size":"small","enbLogo":true,"logo":"","msg":"The Facility Booking System comes with a lot of features.","enbRuning":true,"runingSpd":"slow","BGClr":"rgba(0,0,255,0.5)","txtClr":"#ffffff"},"mainCard":{"field1":{"enb":true,"fild":"XYZ_ROOM","clr":"#00DAFF","siz":"medium","txt":"Show Facility Name"},"field2":{"enb":true,"fild":"XYZ_REASON","clr":"#FFFFFF","siz":"large","txt":"Show Purpose & Remarks"},"field3":{"enb":true,"fild":"XYZ_CRETBY","clr":"#00FF16","siz":"small","txt":"Show Booked User Name"},"field4":{"enb":true,"fild":"XYZ_TIME","clr":"#fffb00","siz":"medium","txt":"Show Schedule Time"}},"enbUpComing":true,"upComing":{"type":"always","positn":"right","enbTimeOrDate":true,"timeDateSize":"small","timeDateFormat":"ddd hh:mm tt","BGClr":"rgba(91, 91, 91, 1)","txtClr":"#ffffff","showEmptyEvnt":true,"enbTitle":true,"title":{"clr":"yellow","fontSiz":"small","txt":"Up Next"},"tile":{"enbEmptyBook":true,"txt":"No Booking","BGClr1":"rgba(56, 198, 0, 1)","BGClr2":"rgba(234, 0, 0, 0.7)","field1":{"enb":true,"fild":"XYZ_ROOM","clr":"#ffffff","txt":"Show Purpose"},"field2":{"enb":false,"fild":"XYZ_REASON","clr":"#FFFFFF","txt":"Show Remarks"},"field3":{"enb":true,"fild":"XYZ_CRETBY","clr":"#ffffff","txt":"Show Created User Name"},"field4":{"enb":true,"fild":"XYZ_TIME","clr":"#fffb00","txt":"Show Schedule Time"}}}}};
      return {"common":{"appName":"Facility Booking","version":"1.0.0","BGType":"color","BGGradClr1":"#262626","BGGradClr2":"#262626","BGImg":"","LogoImg":"","font":{"alow":true,"selFont":"marko-one"},"language":{"alow":false,"selLang":"eng"},"date":"dd/MM/yyyy","time":"t","errmsg":{"noInternet":"Please check your internet connection !","serverProb":"Connect to server problem !"},"sync":{"enb_setupAutoSyn":false,"setupAutoSynServrTimIntr":"1","dataUpdatTimIntr":"1"}},"screen_ui":{"header":{"show_header":true,"show_title":true,"show_logo":true,"show_dateTime":true,"header_txt_size":"la","header_bg_grad1":"#00000000","header_bg_grad2":"#00000000","title_txt_color":"#FFFFFF","header_txt":"Facility Booking","date_txt_color":"#FFFFFF","date_formate":"hh:mm a"},"footer":{"show_footer":true,"show_logo":true,"show_title":true,"enb_title_runing":true,"title_running_speed":"slow","title_txt_color":"#FFFFFF","footer_txt_size":"me","footer_txt":"Facility Booking a complete solution","footer_bg_grad1":"#00000000","footer_bg_grad2":"#00000000"},"active_block":{"bg_type":"bystatus","normal_bg_grad_clr1":"#00000000","normal_bg_grad_clr2":"#00000000","avail_bg_grad_clr1":"#009a06a3","avail_bg_grad_clr2":"#00c608ab","engaged_bg_grad_clr1":"#ff1100ba","engaged_bg_grad_clr2":"#ff11008c","no_booking_txt":"No Bookings","field1":{"enb":true,"clr":"#FFFFFF","siz":"la","txt":"Room"},"field2":{"enb":true,"clr":"#FFFFFF","siz":"xla","txt":"Purpose"},"field3":{"enb":true,"clr":"#FFFFFF","siz":"me","txt":"FTTime"},"field4":{"enb":true,"clr":"#FFFFFF","siz":"sm","txt":"Remarks"},"field5":{"enb":true,"clr":"#FFFFFF","siz":"sm","txt":"Created By"},"field6":{"enb":true,"clr":"#FFFFFF","siz":"xsm","txt":"Number of Person(s)"}},"upcoming_block":{"type":"always","positn":"right","showEmptyEvnt":true,"bg_grad_clr1":"#00000070","bg_grad_clr2":"#0000008f","avail_tile_grad_clr1":"#8bf400","avail_tile_grad_clr2":"#03A9F4","engaged_tile_grad_clr1":"#673ab7","engaged_tile_grad_clr2":"#ea0050","enb_no_booking_tile":true,"no_booking_txt":"No Bookings","upcoming_header":{"enb":true,"clr":"#FFFFFF","fontSiz":"xla","txt":"Up Next","bg_grad_clr1":"#263238","bg_grad_clr2":"#607D8B"},"field1":{"enb":false,"clr":"#FFFFFF","siz":"xla","txt":"Room"},"field2":{"enb":true,"clr":"#FFFFFF","siz":"la","txt":"Purpose"},"field3":{"enb":true,"clr":"#FFFFFF","siz":"me","txt":"FTTime"},"field4":{"enb":true,"clr":"#FFFFFF","siz":"sm","txt":"Remarks"},"field5":{"enb":true,"clr":"rgb(194, 255, 0)","siz":"me","txt":"Created By"},"field6":{"enb":false,"clr":"#FFFFFF","siz":"xsm","txt":"Number of Person(s)"}}}};
    }

    localPostMethod(serviceName:string, postData:any)
    {
      return this.http.post(this.URL + this['APP_SERVICES'][serviceName], postData, httpOptions );
    }
    localGetMethod(serviceName:string, appendURL:string )
    {
      console.log(this.URL + this['APP_SERVICES'][serviceName] + appendURL);
      return this.http.get(this.URL + this['APP_SERVICES'][serviceName] + appendURL);
    }
}
