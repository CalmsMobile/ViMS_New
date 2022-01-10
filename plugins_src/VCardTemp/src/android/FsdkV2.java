package cordova.plugins.vcardtemp;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.os.Handler;
import android.os.Message;
import android.text.TextUtils;
import android.util.Log;

import com.hoho.android.usbserial.BuildConfig;
import com.hoho.android.usbserial.driver.UsbSerialDriver;
import com.hoho.android.usbserial.driver.UsbSerialPort;
import com.hoho.android.usbserial.driver.UsbSerialProber;
import com.vims.host.R;

import java.io.IOException;
import java.util.Arrays;

import fsdktempv2.Callback;
import fsdktempv2.Fsdktempv2;

public class FsdkV2 {
    public final static int D6T32L = 3120;
    public final static int D6T44L = 3121;
    public final static int D6T1A = 3122;
    public final static int D6T8A = 3123;
    public final static int D6T8062A = 3221;
    public static int MX = 0;
    public static int MY =0;
    private  int es = 950;
    private int com_status = 0;
    private String fsdk_status = "";
    private Context instnace = null;
    private FsdkCallback fsdkCallback = null;
    private boolean isSetting =false;
    public static boolean DebugVer = false;
    public static int DeadPixCount = 0;
    public static int SensorType = D6T32L;
    public static String Version = "ff.ff";
    public static String ModuleNum ="";
    public static String Factory = "";
    public static int CompemsationFactor=0;
    public FsdkV2(Context context){
        instnace = context;
    }

    public void SetCallBack(FsdkCallback callback){
        this.fsdkCallback = callback;
    }

    public int get_com_status(){
        return com_status;
    }

    public String get_fsdk_status(){
        return fsdk_status;
    }

    public int getE() {
        return es;
    }

    public int ConfigT(){
        if( com_status == FsdkDefine.com_close){
            return 0;
        }
        fsdk_status = FsdkDefine.ConfigT;
       return sendData(FsdkCmd.ConfigT().getBytes());
    }
    public int QueryT(){
        if( com_status == FsdkDefine.com_close){
            return 0;
        }
        fsdk_status = FsdkDefine.QueryT;
        return sendData(FsdkCmd.QueryT().getBytes());
    }
    public int CalcT(){
        if( com_status == FsdkDefine.com_close){
            return 0;
        }
        fsdk_status = FsdkDefine.CalcT;
        return sendData(FsdkCmd.CalcT().getBytes());
    }
    public int SetE(int e){
        if( com_status == FsdkDefine.com_close){
            return 0;
        }
        isSetting = true;
        try {
            Thread.sleep(1000);
        }catch (Exception e1){
            e1.printStackTrace();
        }
        fsdk_status = FsdkDefine.SetE;
        return sendData(FsdkCmd.SetE(e).getBytes());
    }
    public int QueryCalcT(){
        if( com_status == FsdkDefine.com_close){
            return 0;
        }
        if(isSetting) {
            return 0;
        }
        fsdk_status = FsdkDefine.QueryCalcT;
        return sendData(FsdkCmd.QueryCalcT().getBytes());
    }

    public int SetA(int mode, float t){
        if( com_status == FsdkDefine.com_close){
            return 0;
        }
        isSetting = true;
        try {
            Thread.sleep(1000);
        }catch (Exception e){
            e.printStackTrace();
        }
        fsdk_status = FsdkDefine.SetA;
        return sendData(FsdkCmd.SetA(mode,t).getBytes());
    }

    public int SetP(int index, int value){
        if( com_status == FsdkDefine.com_close){
            return 0;
        }
        isSetting = true;
        try {
            Thread.sleep(1000);
        } catch (Exception e){
            e.printStackTrace();
        }
        fsdk_status = FsdkDefine.SetP;
        return sendData(FsdkCmd.SetP(index,value).getBytes());
    }

    public int SetP2(String cmd){
        if(TextUtils.isEmpty(cmd)){
            return 0;
        }
        if(cmd.startsWith("SetP=")==false){
            return 0;
        }
        if( com_status == FsdkDefine.com_close){
            return 0;
        }
        isSetting = true;
        try {
            Thread.sleep(1000);
        } catch (Exception e){
            e.printStackTrace();
        }
        fsdk_status = FsdkDefine.SetP;
        return sendData(String.format("%s\r\n",cmd).getBytes());
    }

    private int sendData(byte[] data) {
        if(!connected) {
            return 0;
        }
        try {
            return usbSerialPort.write(data, WRITE_WAIT_MILLIS);
        } catch (Exception e) {
            e.printStackTrace();
            disconnect();
        }
        return 0;
    }

    private byte[] getData() {
        if(!connected) {
            return null;
        }
        try {
            byte[] buffer = new byte[8192];
            int len = usbSerialPort.read(buffer, READ_WAIT_MILLIS);
            return Arrays.copyOf(buffer, len);
        } catch (IOException e) {
            e.printStackTrace();
            disconnect();
        }
        return null;
    }

    public boolean openCom() {
        return connect();
    }
    public void resetCom(){

    }
    public void closeCom() {
        disconnect();
    }

    private void parseData(byte[] data){
        if( data ==null) {
            return;
        }
        try {
//            Log.d("FREELANCER", " parseData:"+ data[0] + " " + data[1] + " data.length" + data.length);
            switch (fsdk_status){
                case FsdkDefine.ConfigT:
                    Fsdktempv2.configT(data, new Callback() {
                        @Override
                        public void result(long l, String s) {
                            Log.d("FREELANCER", " code:" + l + " msg:"+s);
                            if(l !=0) {
                                if ( fsdkCallback!=null){
                                    fsdkCallback.Error(s);
                                }
                                return;
                            } else {
                                int e = FsdkHandle.ConfigT(s);
                                if ( fsdkCallback!=null){
                                    fsdkCallback.onEChange(e);
                                }
                                if( DebugVer) {
                                    QueryT();
                                } else {
                                    QueryCalcT();
                                }
                            }
                        }

                        @Override
                        public void result2(byte[] bytes) {

                        }
                    });
                    break;
                case FsdkDefine.CalcT:
                    Fsdktempv2.calcT(data, new Callback() {
                        @Override
                        public void result(long l, String s) {
                            Log.d("FREELANCER", " code:" + l + " msg:"+s);
                            if(fsdkCallback != null){
                                fsdkCallback.Msg(s);
                            }
                        }

                        @Override
                        public void result2(byte[] bytes) {

                        }
                    });
                    break;
                case FsdkDefine.QueryT:
                    Fsdktempv2.queryT(data, new Callback() {
                        @Override
                        public void result(long l, String s) {
//                            Log.d("FREELANCER", " code:" + l + " msg:"+s);
                            if ( l != 0) {
                                if ( fsdkCallback!=null){
                                    fsdkCallback.Error(s);
                                }
                                return;
                            }
                            float temp = FsdkHandle.QueryT(s);
                            if(fsdkCallback != null){
                                fsdkCallback.Temp(temp);
                                fsdkCallback.TempList(s);
                            }
                        }

                        @Override
                        public void result2(byte[] bytes) {
                        }
                    });
                    break;
                case FsdkDefine.QueryCalcT:
                    Fsdktempv2.queryCalcT(data, new Callback() {
                        @Override
                        public void result(long l, String s) {
//                            Log.d("FREELANCER", " code:" + l + " msg:"+s );
                            if ( l != 0) {
                                if ( fsdkCallback!=null){
                                    fsdkCallback.Error(s);
                                }
                                return;
                            }
                            if(fsdkCallback != null){
                                 FsdkHandle.QueryCalcT(s,fsdkCallback);
                            }
                        }

                        @Override
                        public void result2(byte[] bytes) {
                        }
                    });
                    break;
                case FsdkDefine.SetA:
                    Fsdktempv2.setA(data, new Callback() {
                        @Override
                        public void result(long l,final String s) {
                            Log.d("FREELANCER", "setA code :" + l + " ret:"+s);
                            if( l==0) {
                                fsdkCallback.Msg(instnace.getResources().getString(R.string.txt_cal_success));
                            } else {
                                if(fsdkCallback != null){
                                    fsdkCallback.Error(instnace.getResources().getString(R.string.txt_cal_fail));
                                }
                            }
                            isSetting = false;
                            try {
                                Thread.sleep(1000);
                            }catch (Exception e) {
                                e.printStackTrace();
                            }
                            ConfigT();
                        }

                        @Override
                        public void result2(byte[] bytes) {

                        }
                    });

                    break;
                case FsdkDefine.SetE:
                    Fsdktempv2.setE(data, new Callback() {
                        @Override
                        public void result(long l, String s) {
                            Log.d("FREELANCER", "setE code :" + l + " ret:"+s);
                            if(l==0) {
                                fsdkCallback.Error(instnace.getResources().getString(R.string.txt_set_success));
                            } else {
                                if(fsdkCallback != null){
                                    fsdkCallback.Error(String.format(instnace.getResources().getString(R.string.txt_set_fail)));
                                }
                            }
                            isSetting = false;
                            try {
                                Thread.sleep(1000);
                            }catch (Exception e) {
                                e.printStackTrace();
                            }
                            ConfigT();
                        }

                        @Override
                        public void result2(byte[] bytes) {

                        }
                    });
                    break;
                case FsdkDefine.SetP:
                    Fsdktempv2.setE(data, new Callback() {
                        @Override
                        public void result(long l, String s) {
                            Log.d("FREELANCER", "SetP code :" + l + " ret:"+s);
                            if(l==0) {
                                fsdkCallback.Error(instnace.getResources().getString(R.string.txt_set_success));
                            } else {
                                if(fsdkCallback != null){
                                    fsdkCallback.Error(String.format(instnace.getResources().getString(R.string.txt_set_fail)));
                                }
                            }
                            isSetting = false;
                            try {
                                Thread.sleep(1000);
                            }catch (Exception e) {
                                e.printStackTrace();
                            }
                            ConfigT();
                        }

                        @Override
                        public void result2(byte[] bytes) {

                        }
                    });
                    break;
                default:
                    break;
            }
        } catch (Exception e){
            e.printStackTrace();
        }
    }

    private boolean working = false;
    public void start(){
        if (working) {
            Log.d("FREELACNER", "ComWrokThread has running");
            return;
        }
        new ComWrokThread().start();
    }

    private class ComWrokThread extends Thread {
        @Override
        public void run() {
            super.run();
            byte[] dData = new byte[10240];
            int size = 0;
            working = true;
            while (FsdkDefine.com_close < com_status) {
                try {
                    byte[] respData = getData();
                    if(respData ==null) {
                        Thread.sleep(1000);
                        continue;
                    }
                    if(TextUtils.equals(fsdk_status, FsdkDefine.ConfigT)){
                        System.arraycopy(respData,0,dData,size,respData.length);
                        size = size + respData.length;
//                        Log.d("FREELANCER", "respData:"+ respData.length + " size:"+size);
                        if(size >= 37){
                            parseData(Arrays.copyOf(dData,size));
                            size = 0;
                        }
                    } else if(TextUtils.equals(fsdk_status, FsdkDefine.QueryCalcT)){
                        System.arraycopy(respData,0,dData,size,respData.length);
                        size = size + respData.length;
//                        Log.d("FREELANCER", "respData:"+ respData.length + " size:"+size);
                        int length = 0;
                        if(FsdkV2.SensorType == D6T32L || FsdkV2.SensorType == 3111 || FsdkV2.SensorType == 3112){
                            length = 2060;
                        } else  if(FsdkV2.SensorType == D6T44L ){
                            length = 44;
                        } else if(FsdkV2.SensorType == D6T1A ){
                            length = 14;
                        } else if(FsdkV2.SensorType == D6T8A ){
                            length = 28;
                        } else if(FsdkV2.SensorType == D6T8062A ){
                            length = 10092;
                        }
                        if(size >= length){
                            parseData(Arrays.copyOf(dData,size));
                            size = 0;
                            QueryCalcT();
                        }
                    } else if(TextUtils.equals(fsdk_status, FsdkDefine.QueryT)){
                        System.arraycopy(respData,0,dData,size,respData.length);
                        size = size + respData.length;
//                        Log.d("FREELANCER", "respData:"+ respData.length + " size:"+size);
                        int length = 0;
                        if(FsdkV2.SensorType == D6T32L || FsdkV2.SensorType == 3111 || FsdkV2.SensorType == 3112){
                            length = 2054;
                        } else  if(FsdkV2.SensorType == D6T44L ){
                            length = 38;
                        } else if(FsdkV2.SensorType == D6T1A ){
                            length = 8;
                        } else if(FsdkV2.SensorType == D6T8A ){
                            length = 22;
                        } else if(FsdkV2.SensorType == D6T8062A ){
                            length = 10086;
                        }
                        if(size >= length){
                            parseData(Arrays.copyOf(dData,size));
                            size = 0;
                            QueryT();
                        }
                    } else if(TextUtils.equals(fsdk_status, FsdkDefine.SetA)){
                        System.arraycopy(respData,0,dData,size,respData.length);
                        size = size + respData.length;
//                        Log.d("FREELANCER", "respData:"+ respData.length + " size:"+size);
                        if(size >= 8){
                            parseData(Arrays.copyOf(dData,size));
                            size = 0;
                        }
                    } else if(TextUtils.equals(fsdk_status, FsdkDefine.SetE)){
                        System.arraycopy(respData,0,dData,size,respData.length);
                        size = size + respData.length;
//                        Log.d("FREELANCER", "respData:"+ respData.length + " size:"+size);
                        if(size >= 7){
                            parseData(Arrays.copyOf(dData,size));
                            size = 0;
                        }
                    } else if(TextUtils.equals(fsdk_status, FsdkDefine.SetP)){
                        System.arraycopy(respData,0,dData,size,respData.length);
                        size = size + respData.length;
//                        Log.d("FREELANCER", "respData:"+ respData.length + " size:"+size);
                        if(size >= 7){
                            parseData(Arrays.copyOf(dData,size));
                            size = 0;
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            working = false;
            size=0;
        }
    }

    public enum UsbPermission { Unknown, Requested, Granted, Denied };

    public static final String INTENT_ACTION_GRANT_USB = BuildConfig.APPLICATION_ID + ".GRANT_USB";
    private static final int WRITE_WAIT_MILLIS = 2000;
    private static final int READ_WAIT_MILLIS = 2000;

    private int pid = 0x7523;
    private int vid = 0x1a86;

    private int pid2 = 0xea60;
    private int vid2 = 0x10c4;

    public static int baudRate=115200;

    private int portNum=0;
    public UsbPermission usbPermission = UsbPermission.Unknown;
    public UsbSerialPort usbSerialPort;
    private boolean connected = false;

    public boolean connect()  {
        try {
            UsbDevice device = null;
            UsbManager usbManager = (UsbManager) instnace.getSystemService(Context.USB_SERVICE);
            for (UsbDevice v : usbManager.getDeviceList().values()) {
                Log.d("FREELANCER", String.format(" getProductId:%x getVendorId:%x", v.getProductId(), v.getVendorId()));
                if (v.getVendorId() == vid && v.getProductId() == pid) {
                    device = v;
                    break;
                }
                if (v.getVendorId() == vid2 && v.getProductId() == pid2) {
                    device = v;
                    break;
                }
            }
            if (device == null) {
                if (fsdkCallback != null) {
                    fsdkCallback.Error("connection failed: device not found");
                }
                Log.d("FREELANCER", "connection failed: device not found");
                return false;
            }
            UsbSerialDriver driver = UsbSerialProber.getDefaultProber().probeDevice(device);
            if (driver == null) {
                driver = CustomProber.getCustomProber().probeDevice(device);
            }
            if (driver == null) {
                Log.d("FREELANCER", "connection failed: no driver for device");
                return false;
            }
            if (driver.getPorts().size() < portNum) {
                Log.d("FREELANCER", "connection failed: not enough ports at device");
                return false;
            }
            usbSerialPort = driver.getPorts().get(portNum);
            UsbDevice usbDevice = driver.getDevice();
            if ( usbDevice == null ||!usbManager.hasPermission(driver.getDevice())) {
                Log.d("FREELANCER", "driver.getDevice() null");
//                usbPermission = UsbPermission.Requested;
                PendingIntent usbPermissionIntent = PendingIntent.getBroadcast(instnace, 0, new Intent(INTENT_ACTION_GRANT_USB), 0);
                usbManager.requestPermission(driver.getDevice(), usbPermissionIntent);
                return false;
            }
            UsbDeviceConnection usbConnection = usbManager.openDevice(usbDevice);
            if (usbConnection == null && usbPermission == UsbPermission.Unknown && !usbManager.hasPermission(driver.getDevice())) {
                usbPermission = UsbPermission.Requested;
                PendingIntent usbPermissionIntent = PendingIntent.getBroadcast(instnace, 0, new Intent(INTENT_ACTION_GRANT_USB), 0);
                usbManager.requestPermission(driver.getDevice(), usbPermissionIntent);
                return false;
            }
            if (usbConnection == null) {
                if (!usbManager.hasPermission(driver.getDevice())) {
                    Log.d("FREELANCER", "connection failed: permission denied");
                } else {
                    Log.d("FREELANCER", "connection failed: open failed");
                }
                return false;
            }
            try {
                usbSerialPort.open(usbConnection);
                usbSerialPort.setParameters(baudRate, 8, UsbSerialPort.STOPBITS_1, UsbSerialPort.PARITY_NONE);
                connected = true;
                com_status = FsdkDefine.com_open;
            } catch (Exception e) {
                e.printStackTrace();
                disconnect();
                return false;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    public void disconnect() {
        com_status = FsdkDefine.com_close;
        try {
            Thread.sleep(1000);
        } catch (Exception e){
            e.printStackTrace();
        }
        //刷新缓存用
        getData();
        connected = false;
        try {
            if(usbSerialPort!=null) {
                usbSerialPort.close();
            }
        } catch (Exception ignored) {
            ignored.printStackTrace();
        }
        usbSerialPort = null;
    }
}
