

import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';

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
}