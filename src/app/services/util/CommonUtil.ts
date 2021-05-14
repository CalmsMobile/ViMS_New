

import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { AppSettings } from '../app-settings';

@Injectable()
export class CommonUtil{


    decryptQR(value){
       // value = "TYRiV7nhQ5wyYHTAmrXNgpKQcKeXLGrcnktskxJq59KUyphUHqukxYDhRKTg5JzvB9d1YgUTh+fG2Ea2rmsXAQ==";
        if(!value){
            return '';
        }
        console.log("Encrypted QRCode:"+ value);
        var aesKey = CryptoJS.enc.Utf8.parse("qweqweqweqweqweq");
        var aesIv = CryptoJS.enc.Utf8.parse("qweqweqweqweqweq");;
        var y = CryptoJS.AES.decrypt(value, aesKey, {
                    iv: aesIv
                });
        var decryptedValue = y.toString(CryptoJS.enc.Utf8)
        console.log(decryptedValue);
        return decryptedValue;
    }

    getRoomName(code) {
      let result = code;
      var masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
      if(masterDetails){
        const ROOMS = JSON.parse(masterDetails).Table8;
        for (var i = 0; i <= ROOMS.length - 1; i++) {
          if(ROOMS[i].MeetingRoomSeqId == code){
            result = ROOMS[i].MeetingRoomDesc;
            break;
          }
        }
      }
      return result;
    }

    getPurposeName(code) {
      let result = code;
      var masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
      if(masterDetails){
        const REASONS = JSON.parse(masterDetails).Table3;
        for (var i = 0; i <= REASONS.length - 1; i++) {
          if(REASONS[i].visitpurpose_id == code){
            result = REASONS[i].visitpurpose_desc;
            break;
          }
        }
      }
      return result;
    }
}
