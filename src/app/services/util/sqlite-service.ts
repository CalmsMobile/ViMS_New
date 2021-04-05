import { Injectable} from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { AppSettings} from '../app-settings';

@Injectable()
export class SqliteService{
    theConsole: string = "Console Messages";
    SQL_QRYS = {
        "ACCOUNT":{
            "CREATE_": "create table IF NOT EXISTS vims_account (hostID VARCHAR(50), local TEXT, server TEXT)",
            "INSER_": "INSERT INTO vims_account(hostID, local, server) VALUES (?, ?, ?)",
            "UPDATE_local": "UPDATE vims_account SET local = ? WHERE hostID = ?",
            "UPDATE_server": "UPDATE vims_account SET server = ? WHERE hostID = ?",
            "DELETE_ACCOUNT":""
        }


    }
    db_options: any = {
        name: AppSettings.LOCAL_SQLITE_DB_NAME,
        location: 'default',
    }
    private sqlite_db:SQLiteObject;
    constructor(private sqlite:SQLite){
        this.connectToSQLiteDB();
    }
    private connectToSQLiteDB():void{
        this.sqlite.create(this.db_options).then(
            (db: SQLiteObject)=>{
                this.sqlite_db = db;
                this.sqlite_db.executeSql(this.SQL_QRYS.ACCOUNT.CREATE_,[])
             .then(() => this.theConsole += 'Executed SQL' + this.SQL_QRYS.ACCOUNT.CREATE_)
             .catch(e => this.theConsole += "Error: " + JSON.stringify(e));

            },(error)=>{}).catch(e => this.theConsole += JSON.stringify(e));
    }
    addInitialHostAccount(params):void {
        this.sqlite_db.executeSql(this.SQL_QRYS.ACCOUNT.INSER_,
            [params["hostID"], params["local"], params["server"]])
            .then(() => {this.theConsole += 'Executed SQL' + this.SQL_QRYS.ACCOUNT.INSER_},(error)=>{})
            .catch(e => this.theConsole += "Error: " + JSON.stringify(e));
    }
    updateHostAccount(params):void{
        var SQL = "";
        if(params['type'] === 'local')
            SQL = this.SQL_QRYS.ACCOUNT.UPDATE_local;
        else if(params['type'] === 'server')
            SQL = this.SQL_QRYS.ACCOUNT.UPDATE_server;

        this.sqlite_db.executeSql(SQL,
            [params[params["type"]], params["hostID"]])
            .then(() => {this.theConsole += 'Executed SQL' + this.SQL_QRYS.ACCOUNT.INSER_},(error)=>{})
            .catch(e => this.theConsole += "Error: " + JSON.stringify(e));

    }
    getConsoleMessages() {
        return this.theConsole;
    }
}
