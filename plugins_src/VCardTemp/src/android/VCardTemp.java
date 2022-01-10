package cordova.plugins.vcardtemp;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.graphics.Bitmap;
import android.util.Log;
import android.widget.Toast;

import com.vims.host.R;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * This class echoes a string called from JavaScript.
 */
public class VCardTemp extends CordovaPlugin {
  private FsdkV2 fsdkV2 =null;
  private int TempMode = 0;
  private CallbackContext callbackContext;
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        this.callbackContext = callbackContext;
        if (action.equals("coolMethod")) {
          initSdk();
            return true;
        } else if (action.equals("intSDK")) {
          initSdk();
          return true;
        } else if (action.equals("scan")) {
          openConnection();
          return true;
        } else if (action.equals("closeConnection")) {
          closeConnection();
          return true;
        }
        return false;
    }


    private void closeConnection(){
      JSONObject jsonObject = new JSONObject();

      try {
        jsonObject.put("ACTION", "CLOSE_CONNECTION");
        jsonObject.put("RESULT", "Success");
        fsdkV2.closeCom();
      } catch (Exception e) {
        e.printStackTrace();
      }
      PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
      result.setKeepCallback(true);
      callbackContext.sendPluginResult(result);
    }


  private ProgressDialog progressDialog = null;
  private void showProgress(){
    progressDialog = new ProgressDialog(this.cordova.getContext());
    progressDialog.setCanceledOnTouchOutside(false);
    // 设置ProgressDialog 标题
    progressDialog.setTitle("Vcard");
    // 设置ProgressDialog 提示信息
    progressDialog.setMessage(this.cordova.getContext().getResources().getString(R.string.txt_loading));
    progressDialog.show();
  }

  private void hideProgress(){
    if( progressDialog == null) {
      return;
    }
    progressDialog.dismiss();
  }

    private void openConnection() {
      initSdk();
      if(fsdkV2.usbPermission == FsdkV2.UsbPermission.Granted) {
        showProgress();
      }
      Activity activity = this.cordova.getActivity();
      new Thread(new Runnable() {
        @Override
        public void run() {
          try {
            if (!fsdkV2.openCom()){
              Log.d("FREELANCER", "fsdkV2.openCom() == false " + fsdkV2.usbPermission);
              activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                  hideProgress();
                  Toast.makeText(activity, activity.getResources().getString(R.string.txt_usb_open_error),Toast.LENGTH_SHORT).show();
                }
              });
              return;
            }
          } catch (Exception e) {
            e.printStackTrace();
            activity.runOnUiThread(new Runnable() {
              @Override
              public void run() {
                hideProgress();
                Toast.makeText(activity, activity.getResources().getString(R.string.txt_usb_open_error),Toast.LENGTH_SHORT).show();
              }
            });
            return;
          }
          activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
              if( fsdkV2.get_com_status() == FsdkDefine.com_open){
                fsdkV2.start();
                fsdkV2.ConfigT();
                JSONObject jsonObject = new JSONObject();

//                try {
//                  jsonObject.put("ACTION", "START_CONNECTION");
//                  jsonObject.put("RESULT", "Success");
//                } catch (JSONException e) {
//                  e.printStackTrace();
//                }
//                PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
//                result.setKeepCallback(true);
//                callbackContext.sendPluginResult(result);
              }
              hideProgress();
            }
          });
        }
      }).start();
    }


  private void initSdk(){
    if (fsdkV2 == null){
      fsdkV2 = new FsdkV2(this.cordova.getContext());
      fsdkV2.SetCallBack(new FsdkCallback() {
        @Override
        public void Temp(final float t) {

          JSONObject jsonObject = new JSONObject();

          try {
            jsonObject.put("ACTION", "TEMPERATURE");
            jsonObject.put("RESULT", "Success");
            jsonObject.put("TEMPERATURE", String.valueOf(t));
          } catch (JSONException e) {
            e.printStackTrace();
          }
          PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
          result.setKeepCallback(true);
          callbackContext.sendPluginResult(result);
        }

        @Override
        public void MaxTemp(float t, int x, int y) {

          JSONObject jsonObject = new JSONObject();

          try {
            jsonObject.put("ACTION", "TEMPERATURE");
            jsonObject.put("RESULT", "Success");
            jsonObject.put("TEMPERATURE", String.valueOf(t));
          } catch (JSONException e) {
            e.printStackTrace();
          }
          PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
          result.setKeepCallback(true);
          callbackContext.sendPluginResult(result);

        }

        @Override
        public void HeatBitmap(final Bitmap bit) {

        }

        @Override
        public void TempList(String tl) {

        }

        @Override
        public void Error(final String s) {

          JSONObject jsonObject = new JSONObject();

          try {
            jsonObject.put("ACTION", "ERROR");
            jsonObject.put("RESULT", "Fail");
            jsonObject.put("MESSAGE", s);
          } catch (JSONException e) {
            e.printStackTrace();
          }
          PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
          result.setKeepCallback(true);
          callbackContext.sendPluginResult(result);
        }

        @Override
        public void onEChange(final  int e) {

        }

        @Override
        public void Msg(final String s) {
          JSONObject jsonObject = new JSONObject();
          try {
            jsonObject.put("ACTION", "ERROR");
            jsonObject.put("RESULT", "Fail");
            jsonObject.put("MESSAGE", s);
          } catch (JSONException e) {
            e.printStackTrace();
          }
          PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
          result.setKeepCallback(true);
          callbackContext.sendPluginResult(result);
        }
      });
      JSONObject jsonObject = new JSONObject();

      try {
        jsonObject.put("ACTION", "INIT");
        jsonObject.put("RESULT", "Success");
      } catch (JSONException e) {
        e.printStackTrace();
      }
      PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
      result.setKeepCallback(true);
      callbackContext.sendPluginResult(result);
    }
  }
}
