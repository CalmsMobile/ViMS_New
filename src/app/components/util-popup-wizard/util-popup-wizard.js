var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
var UtilPopupWizardComponent = /** @class */ (function () {
    function UtilPopupWizardComponent(params, viewCtrl) {
        this.viewCtrl = viewCtrl;
        this.pop_type = "info";
        this.pop_types = {
            "error_no_internet": {
                "title": "COMMON.MSG.NO_INTERNET",
                "subtitle": "COMMON.MSG.NO_INTERNET_DETAIL",
                "btn_ok_txt": "COMMON.OK",
                "btn_ok_event": this.dismissModal,
                "btn_cancel_txt": "COMMON.CANCEL",
                "btn_cancel_event": this.dismissModal,
            },
            "error_server_connection": {
                "title": "COMMON.MSG.ERR_SERVER_CONCTN",
                "subtitle": "COMMON.MSG.ERR_SERVER_CONCTN_DETAIL",
                "btn_ok_txt": "COMMON.OK",
                "btn_ok_event": this.dismissModal,
                "btn_cancel_txt": "COMMON.CANCEL",
                "btn_cancel_event": this.dismissModal,
            }
        };
        this.pop_type = params.get('pop_type');
        if (this.pop_type != "common") {
            this.pop_data = this.pop_types[this.pop_type];
        }
    }
    UtilPopupWizardComponent.prototype.dismissModal = function () {
        this.viewCtrl.dismiss();
    };
    UtilPopupWizardComponent = __decorate([
        Component({
            selector: 'util-popup-wizard',
            templateUrl: 'util-popup-wizard.html'
        }),
        __metadata("design:paramtypes", [NavParams, ViewController])
    ], UtilPopupWizardComponent);
    return UtilPopupWizardComponent;
}());
export { UtilPopupWizardComponent };
//# sourceMappingURL=util-popup-wizard.js.map