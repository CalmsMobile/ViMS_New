package cordova.plugins.vcardtemp;

import android.text.TextUtils;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

public class FsdkHandle {
    public static int ConfigT(String reslut){
        try {
            JSONObject json = new JSONObject(reslut);
            String Version = json.optString("Version");
            if (TextUtils.equals("ff.ff", Version)) {
                FsdkV2.DebugVer = true;
            }
            FsdkV2.Version = Version;
            FsdkV2.ModuleNum= json.optString("ModuleNum");
            FsdkV2.SensorType = json.optInt("SensorType");
            FsdkV2.Factory = json.optString("Factory");
            FsdkV2.DeadPixCount = json.optInt("DeadPixCount");
            FsdkV2.CompemsationFactor = json.optInt("CompemsationFactor");
            return  json.optInt("Emissivity");
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }
    public static float QueryT(String reslut){
        try {
            float max = 0;
            JSONArray jsonArray = new JSONArray(reslut);
            if( jsonArray != null) {
                for(int i =0 ; i < jsonArray.length();i++) {
                    float t= (float) jsonArray.optDouble(i);
                    if( t > max) {
                        max = t;
                    }
                }
            }
            return max;
        }catch (Exception e) {
            e.printStackTrace();
        }
        return 0f;
    }
    public static void CalcT(String reslut){
        return;
    }
    public static boolean SetE(byte[] data){
        return false;
    }
    public static float QueryCalcT(String reslut, FsdkCallback callback){
        try {
            JSONObject json = new JSONObject(reslut);
            float temp =(float) json.optDouble("Temp");
            if ( callback != null) {
                JSONArray array = json.optJSONArray("TSet");
                float max =(float) json.optDouble("Max");
                int mx = json.optInt("MX");
                int my = json.optInt("MY");
                FsdkV2.MX=mx;
                FsdkV2.MY=my;
                callback.MaxTemp(max,mx,my);
                callback.Temp(temp);
                callback.TempList(array.toString());
                float ltemp =(float) json.optDouble("LTemp");
                callback.Msg(String.format("%s:%.2f","Background temperature",ltemp));
            }
            return temp;
        } catch (Exception e) {
            Log.d("FREELANCER", " QueryCalcT:" + reslut);
            e.printStackTrace();
        }
        return 0;
    }
    public static boolean SetA(byte[] data){
        return false;
    }
}

