var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { AppSettings } from '../app-settings';
var SqliteService = /** @class */ (function () {
    function SqliteService(sqlite) {
        this.sqlite = sqlite;
        this.theConsole = "Console Messages";
        this.SQL_QRYS = {
            "ACCOUNT": {
                "CREATE_": "create table IF NOT EXISTS vims_account (hostID VARCHAR(50), local TEXT, server TEXT)",
                "INSER_": "INSERT INTO vims_account(hostID, local, server) VALUES (?, ?, ?)",
                "UPDATE_local": "UPDATE vims_account SET local = ? WHERE hostID = ?",
                "UPDATE_server": "UPDATE vims_account SET server = ? WHERE hostID = ?",
                "DELETE_ACCOUNT": ""
            }
        };
        this.db_options = {
            name: AppSettings.LOCAL_SQLITE_DB_NAME,
            location: 'default',
        };
        this.connectToSQLiteDB();
    }
    SqliteService.prototype.connectToSQLiteDB = function () {
        var _this = this;
        this.sqlite.create(this.db_options).then(function (db) {
            _this.sqlite_db = db;
            _this.sqlite_db.executeSql(_this.SQL_QRYS.ACCOUNT.CREATE_, [])
                .then(function () { return _this.theConsole += 'Executed SQL' + _this.SQL_QRYS.ACCOUNT.CREATE_; })
                .catch(function (e) { return _this.theConsole += "Error: " + JSON.stringify(e); });
        }, function (error) { }).catch(function (e) { return _this.theConsole += JSON.stringify(e); });
    };
    SqliteService.prototype.addInitialHostAccount = function (params) {
        var _this = this;
        this.sqlite_db.executeSql(this.SQL_QRYS.ACCOUNT.INSER_, [params["hostID"], params["local"], params["server"]])
            .then(function () { _this.theConsole += 'Executed SQL' + _this.SQL_QRYS.ACCOUNT.INSER_; }, function (error) { })
            .catch(function (e) { return _this.theConsole += "Error: " + JSON.stringify(e); });
    };
    SqliteService.prototype.updateHostAccount = function (params) {
        var _this = this;
        var SQL = "";
        if (params['type'] === 'local')
            SQL = this.SQL_QRYS.ACCOUNT.UPDATE_local;
        else if (params['type'] === 'server')
            SQL = this.SQL_QRYS.ACCOUNT.UPDATE_server;
        this.sqlite_db.executeSql(SQL, [params[params["type"]], params["hostID"]])
            .then(function () { _this.theConsole += 'Executed SQL' + _this.SQL_QRYS.ACCOUNT.INSER_; }, function (error) { })
            .catch(function (e) { return _this.theConsole += "Error: " + JSON.stringify(e); });
    };
    SqliteService.prototype.getConsoleMessages = function () {
        return this.theConsole;
    };
    SqliteService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [SQLite])
    ], SqliteService);
    return SqliteService;
}());
export { SqliteService };
//# sourceMappingURL=sqlite-service.js.map
