package cordova.plugins.myKadReader;


import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.util.Base64;
import android.view.View;
import android.widget.Toast;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.model.EventAttendee;
import com.securemetric.reader.myid.MYKAD;
import com.securemetric.reader.myid.MYKID;
import com.securemetric.reader.myid.MyID;
import com.securemetric.reader.myid.MyIDException;
import com.securemetric.reader.myid.MyIDListener;
import com.securemetric.reader.myid.MyIDPermissionListener;
import com.securemetric.reader.myid.MyIDReaderStatus;
import com.vims.host.R;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

/**
 * This class echoes a string called from JavaScript.
 */
public class MyKadReader extends CordovaPlugin  implements MyIDListener, MyIDPermissionListener {
  public final static String BROADCAST_ID = "com.securemetric.myidreader";

  private boolean callerReadPhoto = true;

  private Handler intentCalledHandler = null;
  private Runnable intentCalledRunnable = null;
  public static final String INTENT_CALLER_ID = "com.securemetric.myidreader.READ";
  public static final String INTENT_MYKAD = "initMyKad";
  private MyID readerManager;
  private Object read;
  private Handler handlerTask = new Handler();
  private TaskCanceler taskCanceler;
  AsyncTask task = null;
  String pluggedReader = "";
  private final int APP_IN_BACKGROUND = 0x00;
  private final int READER_TIMEOUT = 0xFF;
  private LocalBroadcastManager mLocalBCManager;
  ReadMyKADPhoto readPhotoTask = null;
  private Runnable myIDInfoActivityStartup;
  CallbackContext callbackContext;
  private MyReceiver myReceiver;
  private Activity activity;
  private boolean intentCalled = false;

  public class MyReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
      // assumes WordService is a registered service

      String action = intent.getAction();

      if(action == null || action.isEmpty()){
        return;
      }
      switch (action){
        case INTENT_CALLER_ID:
          if(intent.getAction().equalsIgnoreCase(INTENT_CALLER_ID)) {
            intentCalled = true;
            JSONObject jsonObject = new JSONObject();

            try {
              jsonObject.put("ACTION", INTENT_CALLER_ID);
              jsonObject.put("RESULT", "Success");
            } catch (JSONException e) {
              e.printStackTrace();
            }
            PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
            result.setKeepCallback(true);
            callbackContext.sendPluginResult(result);
          }
          break;
        case INTENT_MYKAD:
          break;

      }
    }
  }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
      activity = this.cordova.getActivity();
      boolean value = false;
      switch (action) {
        case "coolMethod":
          String message = args.getString(0);
//          this.coolMethod(message, callbackContext);
          this.initMyKad(callbackContext);
          value  =  true;
          break;
        case "initMyKad":
          this.initMyKad(callbackContext);
          value  =  true;
          break;
      }
      return value;
    }

    private void coolMethod(String message, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {
            callbackContext.success(message);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }

  @Override
  public void onStart() {
    super.onStart();
    myReceiver = new MyReceiver();
    mLocalBCManager = LocalBroadcastManager.getInstance(this.cordova.getActivity().getApplicationContext());
    IntentFilter intentFilter = new IntentFilter();
    // Add network connectivity change action.
    intentFilter.addAction(INTENT_CALLER_ID);
    intentFilter.addAction(INTENT_MYKAD);
    // Set broadcast receiver priority.
    intentFilter.setPriority(100);
    this.cordova.getActivity().registerReceiver(myReceiver, intentFilter);

  }

  @Override
  public  void onStop() {
    if (task != null && task.getStatus() == AsyncTask.Status.RUNNING
      && taskCanceler != null && handlerTask != null){
      handlerTask.removeCallbacks(taskCanceler);
      Activity activity = this.cordova.getActivity();
      taskCanceler = new TaskCanceler(activity, task, APP_IN_BACKGROUND);
      handlerTask.post(taskCanceler);
    }

  }

  @Override
  public void onDestroy() {
    readerManager.setOnUsbPermissionListener(null);
    readerManager.setOnReaderStatusChanged(null);
    readerManager.destroy();
    try{
      this.cordova.getActivity().unregisterReceiver(myReceiver);
    }catch (Exception e){
      e.printStackTrace();
    }
    super.onDestroy();
  }

  private void initMyKad(CallbackContext callbackContext) {
    Activity activity = this.cordova.getActivity();
    this.callbackContext = callbackContext;
    if(mLocalBCManager == null){
      mLocalBCManager = LocalBroadcastManager.getInstance(this.cordova.getActivity().getApplicationContext());
    }
    if (callbackContext != null) {
      intentCalled = false;
      readerManager = new MyID();
      readerManager.setOnReaderStatusChanged(this);
      readerManager.setOnPermissionListener(this);

      try {
        readerManager.init(activity, true);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("ACTION", "InitDone");
        jsonObject.put("RESULT", "Success");
        PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
        result.setKeepCallback(true);
        callbackContext.sendPluginResult(result);
      } catch (MyIDException | JSONException e) {
        JSONObject jsonObject = new JSONObject();
        try {
          jsonObject.put("ACTION", "InitDone");
          jsonObject.put("RESULT", "Failed");
          jsonObject.put("Description", e.getMessage());
        } catch (JSONException e1) {
          e1.printStackTrace();
        }
        PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
        result.setKeepCallback(true);
        callbackContext.sendPluginResult(result);
      }


    } else {
      JSONObject jsonObject = new JSONObject();
      try {
        jsonObject.put("ACTION", "InitDone");
        jsonObject.put("RESULT", "Failed");
        jsonObject.put("Description", "Callback not found");
      } catch (JSONException e1) {
        e1.printStackTrace();
      }
      PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
      result.setKeepCallback(true);
      callbackContext.sendPluginResult(result);
    }
  }

  @Override
  public void onCardStatusChange(final String readerName, short status) {
    Activity activity = this.cordova.getActivity();
    if (myIDInfoActivityStartup != null && handlerTask != null){
      handlerTask.removeCallbacks(myIDInfoActivityStartup);
      myIDInfoActivityStartup = null;
    }

    if(status == MyIDReaderStatus.READER_INSERTED) {
      JSONObject jsonObject = new JSONObject();
      try {
        jsonObject.put("ACTION", "READER_INSERTED");
        jsonObject.put("RESULT", "insert card");
        jsonObject.put("PLACE", "onCardStatusChange");
        jsonObject.put("Description", activity.getResources().getString(R.string.msg_insert_smartcard));
      } catch (JSONException e1) {
        e1.printStackTrace();
      }
      PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
      result.setKeepCallback(true);
      callbackContext.sendPluginResult(result);
    }
    else if(status == MyIDReaderStatus.READER_REMOVED){
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          JSONObject jsonObject = new JSONObject();
          try {
            jsonObject.put("ACTION", "READER_REMOVED");
            jsonObject.put("RESULT", "reader removed");
            jsonObject.put("PLACE", "onCardStatusChange");
            jsonObject.put("Description", activity.getResources().getString(R.string.msg_insert_reader));
          } catch (JSONException e1) {
            e1.printStackTrace();
          }
          PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
          result.setKeepCallback(true);
          callbackContext.sendPluginResult(result);
        }
      });

      if (pluggedReader.equalsIgnoreCase(readerName)) {
        Intent broadcast = new Intent(BROADCAST_ID);
        mLocalBCManager.sendBroadcast(broadcast);
      }
    }
    else if(status == MyIDReaderStatus.CARD_INSERTED) {

      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          task = new ReadCard(activity).execute(readerName);
          if (taskCanceler != null && handlerTask != null) {
            handlerTask.removeCallbacks(taskCanceler);

            taskCanceler = new TaskCanceler(activity
              ,task, READER_TIMEOUT);
            handlerTask.postDelayed(taskCanceler,
              activity.getResources().getInteger(R.integer.timeout_reading) * 1000);
          } else {
            taskCanceler = new TaskCanceler(activity,task, READER_TIMEOUT);
            handlerTask.postDelayed(taskCanceler,
              activity.getResources().getInteger(R.integer.timeout_reading) * 1000);
          }
          pluggedReader = readerName;

        }
      });
    }
    else if(status == MyIDReaderStatus.CARD_REMOVE) {
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {

          if (task != null && task.getStatus() == AsyncTask.Status.RUNNING) {
            readerManager.disconnectReader();
            task.cancel(true);
            JSONObject jsonObject = new JSONObject();
            try {
              jsonObject.put("ACTION", "CARD_REMOVE");
              jsonObject.put("RESULT", "card remove");
              jsonObject.put("Description", activity.getResources().getString(R.string.msg_insert_smartcard));
            } catch (JSONException e1) {
              e1.printStackTrace();
            }
            PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
            result.setKeepCallback(true);
            callbackContext.sendPluginResult(result);
          }

        }
      });

      if (pluggedReader.equalsIgnoreCase(readerName)) {
        Intent broadcast = new Intent(BROADCAST_ID);
        mLocalBCManager.sendBroadcast(broadcast);
      }
    }
  }

  @Override
  public void onRequestUsbPermission(UsbDevice usbDevice) {
    Activity activity = this.cordova.getActivity();
    UsbManager usbManager = (UsbManager) activity.getSystemService(Context.USB_SERVICE);
    PendingIntent usbPendingIntent = PendingIntent.getBroadcast(activity.getApplicationContext(), 0,
      new Intent(MyID.ACTION_USB_PERMISSION), 0);
    usbManager.requestPermission(usbDevice, usbPendingIntent);
  }

  @Override
  public void onRequestBluetoothEnable(BluetoothAdapter bluetoothAdapter) {

  }

  String mykadToJson (MYKAD myKAD, String photo) {
    JSONObject jMyKad = new JSONObject();
    JSONObject jMyKadDetail = new JSONObject();
    SimpleDateFormat sdt = new SimpleDateFormat("yyyy-MM-dd z");

    try {

      jMyKadDetail.put("name", myKAD.getName());
      jMyKadDetail.put("gmpc_name", myKAD.getGmpcName() );
      jMyKadDetail.put("kpt_name", myKAD.getKptName() );
      jMyKadDetail.put("icno", myKAD.getIcNo() );
      jMyKadDetail.put("old_icno", myKAD.getOldIcNo() );

      Date dob = myKAD.getDob();
      if (dob != null) {
        try {
          sdt.setTimeZone(TimeZone.getTimeZone("GMT+8"));
          jMyKadDetail.put("date_of_birth", sdt.format(dob) );
        } catch (Exception e) {

        }
      }


      jMyKadDetail.put("place_of_birth", myKAD.getPob() );
      jMyKadDetail.put("gender", myKAD.getGender() );
      jMyKadDetail.put("citizenship", myKAD.getCitizenship() );

      Date issueDate = myKAD.getIssueDate();
      if (issueDate != null) {
        try {
          sdt.setTimeZone(TimeZone.getTimeZone("GMT+8"));
          jMyKadDetail.put("issue_date", sdt.format(issueDate) );
        } catch (Exception e) {

        }
      }

      jMyKadDetail.put("race", myKAD.getRace() );
      jMyKadDetail.put("religion", myKAD.getReligion() );
      jMyKadDetail.put("address1", myKAD.getAddress1() );
      jMyKadDetail.put("address2", myKAD.getAddress2() );
      jMyKadDetail.put("address3", myKAD.getAddress3() );
      jMyKadDetail.put("poscode", myKAD.getPostCode() );
      jMyKadDetail.put("city", myKAD.getCity() );
      jMyKadDetail.put("state", myKAD.getState() );

      if(photo != null) {
        photo = photo.replace("\n","");
        jMyKadDetail.put("photo", photo );
      }

      jMyKad.put("mykad", jMyKadDetail);

      return jMyKad.toString();
    }
    catch (Exception e) {
      return "";
    }
  }

  String mykidToJson (MYKID myKid) {
    JSONObject jMyKid = new JSONObject();
    JSONObject jMyKidDetail = new JSONObject();
    JSONObject jMyKidFather = new JSONObject();
    JSONObject jMyKidMother = new JSONObject();

    SimpleDateFormat sdt = new SimpleDateFormat("yyyy-MM-dd z");

    try {

      jMyKidFather.put("name", myKid.getFatherName());
      jMyKidFather.put("icno", myKid.getFatherIcNo());
      jMyKidFather.put("race", myKid.getFatherRace());
      jMyKidFather.put("religion", myKid.getFatherReligion());
      jMyKidFather.put("resident_type", myKid.getFatherResidentType());

      jMyKidMother.put("name", myKid.getMotherName());
      jMyKidMother.put("icno", myKid.getMotherIcNo());
      jMyKidMother.put("race", myKid.getMotherRace());
      jMyKidMother.put("religion", myKid.getMotherReligion());
      jMyKidMother.put("resident_type", myKid.getMotherResidentType());


      jMyKidDetail.put("name", myKid.getName());
      jMyKidDetail.put("icno", myKid.getIcNo() );
      jMyKidDetail.put("birth_cert_no", myKid.getBirthCertNo() );
      jMyKidDetail.put("gender", myKid.getGender() );
      jMyKidDetail.put("citizenship", myKid.getCitizenship() );

      Date registrationDate = myKid.getRegistrationDate();
      if (registrationDate != null) {
        try {
          sdt.setTimeZone(TimeZone.getTimeZone("GMT+8"));
          jMyKidDetail.put("registration_date", sdt.format(registrationDate) );
        } catch (Exception e) {

        }
      }

      Date dob = myKid.getDob();
      if (dob != null) {
        try {
          sdt.setTimeZone(TimeZone.getTimeZone("GMT+8"));
          jMyKidDetail.put("date_of_birth", sdt.format(dob) );
        } catch (Exception e) {

        }
      }

      jMyKidDetail.put("place_of_birth", myKid.getPob() );
      jMyKidDetail.put("address1", myKid.getAddress1() );
      jMyKidDetail.put("address2", myKid.getAddress2() );
      jMyKidDetail.put("address3", myKid.getAddress3() );
      jMyKidDetail.put("poscode", myKid.getPostcode() );
      jMyKidDetail.put("state", myKid.getState() );

      jMyKidDetail.put("father", jMyKidFather);
      jMyKidDetail.put("mother", jMyKidMother);

      jMyKid.put("mykid", jMyKidDetail);

      return jMyKid.toString();
    }
    catch (Exception e) {
      return "";
    }
  }


  public class ReadCard extends AsyncTask<String, String, String> {
    long startTime, endTime;
    String readerName;
    JSONObject resultData = null;

    Activity activity;

    ReadCard(Activity activity){
      this.activity = activity;
    }

    protected void onPreExecute() {
      startTime = System.currentTimeMillis();
      JSONObject jsonObject = new JSONObject();
      try {
        jsonObject.put("ACTION", "READING");
        jsonObject.put("RESULT", "STARTED");
        jsonObject.put("Description", activity.getResources().getString(R.string.msg_reading_smartcard));
      } catch (JSONException e1) {
        e1.printStackTrace();
      }
      PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
      result.setKeepCallback(true);
      callbackContext.sendPluginResult(result);

    }

    @Override
    protected void onPostExecute(String s) {
      super.onPostExecute(s);
      endTime = System.currentTimeMillis();

      readerManager.disconnectReader();
      if (s != null) {

        if (s.equals(activity.getResources().getString(R.string.msg_MyKAD_read_success))) {
          if(intentCalled) {

          } else {
            myIDInfoActivityStartup = new ShowMyIDInfo(activity, resultData, readerName, true);

//                        if (activity.hasWindowFocus()) {
            handlerTask.post(myIDInfoActivityStartup);
            myIDInfoActivityStartup = null;
//                        } else {
//                          JSONObject jsonObject = new JSONObject();
//                          try {
//                            jsonObject.put("ACTION", "WAITING");
//                            jsonObject.put("RESULT", "STARTED");
//                            jsonObject.put("Description", activity.getResources().getString(R.string.msg_waiting_for_user));
//                          } catch (JSONException e1) {
//                            e1.printStackTrace();
//                          }
//                          callbackContext.success(jsonObject.toString());
//
//                        }
          }





        } else if (s.equals(activity.getResources().getString(R.string.msg_MyKID_read_success))) {
          if(intentCalled) {

          } else {
            myIDInfoActivityStartup = new ShowMyIDInfo(activity, resultData, readerName, false);

            if (activity.hasWindowFocus()) {
              handlerTask.post(myIDInfoActivityStartup);
              myIDInfoActivityStartup = null;
            } else {
              JSONObject jsonObject = new JSONObject();
              try {
                jsonObject.put("ACTION", "WAITING");
                jsonObject.put("RESULT", "STARTED");
                jsonObject.put("Description", activity.getResources().getString(R.string.msg_waiting_for_user));
              } catch (JSONException e1) {
                e1.printStackTrace();
              }
              PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
              result.setKeepCallback(true);
              callbackContext.sendPluginResult(result);

            }
          }



        } else {
          //   showAlertDialog(s);
          Toast.makeText(activity, s, Toast.LENGTH_LONG).show();
          JSONObject jsonObject = new JSONObject();
          try {
            jsonObject.put("ACTION", "INSERT");
            jsonObject.put("RESULT", "REINSERT");
            jsonObject.put("Description", activity.getResources().getString(R.string.msg_re_insert_smartcard));
          } catch (JSONException e1) {
            e1.printStackTrace();
          }
          PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
          result.setKeepCallback(true);
          callbackContext.sendPluginResult(result);
        }
      } else {
        Toast.makeText(activity, activity.getResources().getString(R.string.msg_unhandled_error), Toast.LENGTH_LONG).show();
        // showAlertDialog(getResources().getString(R.string.msg_unhandled_error));
        JSONObject jsonObject = new JSONObject();
        try {
          jsonObject.put("ACTION", "INSERT");
          jsonObject.put("RESULT", "REINSERT");
          jsonObject.put("Description", activity.getResources().getString(R.string.msg_re_insert_smartcard));
        } catch (JSONException e1) {
          e1.printStackTrace();
        }
        PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
        result.setKeepCallback(true);
        callbackContext.sendPluginResult(result);

      }
    }

    @Override
    protected void onCancelled(String result){
      // UI cleanup is handled by private class TaskCanceler. See below for more info.
      readerManager.disconnectReader();
    }

    @Override
    protected void onProgressUpdate(String... progressText){
//            statusTxt.setText(progressText[0]);
      JSONObject jsonObject = new JSONObject();
      try {
        jsonObject.put("ACTION", "CARD READ PROGRESS");
        jsonObject.put("RESULT", "PROGRESS");
        jsonObject.put("PROGRESS", progressText[0]);
        jsonObject.put("Description", activity.getResources().getString(R.string.msg_re_insert_smartcard));
      } catch (JSONException e1) {
        e1.printStackTrace();
      }
      PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
      result.setKeepCallback(true);
      callbackContext.sendPluginResult(result);
    }

    @Override
    protected String doInBackground(String... params) {

      String photo = null;

      try {
        readerName = params[0];
        readerManager.connectReader(readerName);
        try {
          read = readerManager.readMyIDCard();
        } catch (Exception e) {
          e.printStackTrace();
          showAlertDialog(activity.getResources().getString(R.string.msg_invalid_smartcard));
          return activity.getResources().getString(R.string.msg_invalid_smartcard);
        }

        if (read instanceof MYKAD) {
          MYKAD value = (MYKAD) read;

          //verify fingerprint
          if (readerManager.isFingerprintAvailable()) {
            publishProgress(activity.getResources().getString(R.string.msg_verifiy_fingerprint));
            try {
              Boolean result = readerManager.verifyRightFingerprint();

              if (isCancelled()){
                return null;
              }

              if (!result) {
                return activity.getResources().getString(R.string.msg_failed_verifiy_fingerprint);
              }

            } catch (Exception e) {
              return activity.getResources().getString(R.string.msg_failed_verifiy_fingerprint);
            }
          }

          if (isCancelled()){
            return null;
          }


          //get the MyKad data
          if(intentCalled) {
            if(intentCalledHandler != null) {
              intentCalledHandler.removeCallbacks(intentCalledRunnable);
            }

            if(callerReadPhoto) {
              byte[] photoArray = (byte[])readerManager.readMyKADPhoto(MyID.PLAIN_FORMAT);
              photo = Base64.encodeToString(photoArray, Base64.NO_WRAP);
            }

            resultData = new JSONObject();
            resultData.put("card_type", 0x2801 );
            resultData.put("payload", mykadToJson(value, photo) );
          } else  {
            resultData = new JSONObject();
            resultData.put("readerName", readerName);
            resultData.put("name", value.getName());
            resultData.put("gmpcName", value.getGmpcName());
            resultData.put("kptName", value.getKptName());
            resultData.put("icNo", value.getIcNo());
            resultData.put("oldIcNo", value.getOldIcNo());

            Date dob = value.getDob();
            if (dob != null) {
              try {
                SimpleDateFormat sdt = new SimpleDateFormat("yyyy-MM-dd z");
                sdt.setTimeZone(TimeZone.getTimeZone("GMT+8"));

                resultData.put("dob", sdt.format(dob));
              } catch (Exception e) {
                e.printStackTrace();
              }
            }

            resultData.put("pob", value.getPob());
            resultData.put("gender", value.getGender());
            resultData.put("citizenship", value.getCitizenship());

            Date issueDate = value.getIssueDate();
            if (issueDate != null) {
              try {
                SimpleDateFormat sdt = new SimpleDateFormat("yyyy-MM-dd");

                resultData.put("issueDate", sdt.format(issueDate));
              } catch (Exception e) {
                e.printStackTrace();
              }
            }

            resultData.put("race", value.getRace());
            resultData.put("religion", value.getReligion());
            resultData.put("address1", value.getAddress1());
            resultData.put("address2", value.getAddress2());
            resultData.put("address3", value.getAddress3());
            resultData.put("postcode", value.getPostCode());
            resultData.put("city", value.getCity());
            resultData.put("state", value.getState());
          }

          if (taskCanceler != null && handlerTask != null) {
            handlerTask.removeCallbacks(taskCanceler);
          }

          return activity.getResources().getString(R.string.msg_MyKAD_read_success);

        } else if (read instanceof MYKID) {

          MYKID value = (MYKID) read;

          if(intentCalled) {

            if(intentCalledHandler != null) {
              intentCalledHandler.removeCallbacks(intentCalledRunnable);
            }

            resultData = new JSONObject();
            resultData.put("card_type", 0x2802 );
            resultData.put("payload", mykidToJson (value) );

          }else  {
            resultData = new JSONObject();
            resultData.put("name", value.getName());
            resultData.put("icNo", value.getIcNo());
            resultData.put("birthCertNo", value.getBirthCertNo());

            Date dob = value.getDob();
            if (dob != null) {
              try {
                SimpleDateFormat sdt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                sdt.setTimeZone(TimeZone.getTimeZone("GMT+8"));
                resultData.put("dob", sdt.format(dob));
              } catch (Exception e) {
                e.printStackTrace();
              }
            }

            Date regDate = value.getRegistrationDate();
            if (regDate != null) {
              try {
                SimpleDateFormat sdt = new SimpleDateFormat("yyyy-MM-dd z");
                resultData.put("regDate", sdt.format(regDate));
              } catch (Exception e) {
                e.printStackTrace();
              }
            }

            resultData.put("pob", value.getPob());
            resultData.put("gender", value.getGender());
            resultData.put("citizenship", value.getCitizenship());
            resultData.put("address1", value.getAddress1());
            resultData.put("address2", value.getAddress2());
            resultData.put("address3", value.getAddress3());
            resultData.put("city", value.getCity());
            resultData.put("state", value.getState());

            resultData.put("fatherName", value.getFatherName());
            resultData.put("fatherIcNo", value.getFatherIcNo());
            resultData.put("fatherResidentType", value.getFatherResidentType());
            resultData.put("fatherRace", value.getFatherRace());
            resultData.put("fatherReligion", value.getFatherReligion());

            resultData.put("motherName", value.getMotherName());
            resultData.put("motherIcNo", value.getMotherIcNo());
            resultData.put("motherResidentType", value.getMotherResidentType());
            resultData.put("motherRace", value.getMotherRace());
            resultData.put("motherReligion", value.getMotherReligion());
          }

          if (taskCanceler != null && handlerTask != null) {
            handlerTask.removeCallbacks(taskCanceler);
          }

          return activity.getResources().getString(R.string.msg_MyKID_read_success);

        }

      } catch (Exception e) {
        return activity.getResources().getString(R.string.msg_reading_error);
      }

      return activity.getResources().getString(R.string.msg_unhandled_error);
    }

  }

  private class TaskCanceler implements Runnable {
    private AsyncTask task;
    private int how;
    Activity activity;

    public TaskCanceler(Activity activity, AsyncTask task, final int how) {
      this.activity = activity;
      this.task = task;
      this.how = how;
    }

    @Override
    public void run() {
      if (task.getStatus() == AsyncTask.Status.RUNNING) {

        task.cancel(true);

        if (how == APP_IN_BACKGROUND) {
          JSONObject jsonObject = new JSONObject();
          try {
            jsonObject.put("ACTION", "CANCEL");
            jsonObject.put("RESULT", "canceled");
            jsonObject.put("Description", activity.getResources().getString(R.string.msg_cancelled_by_user));
          } catch (JSONException e1) {
            e1.printStackTrace();
          }
          PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
          result.setKeepCallback(true);
          callbackContext.sendPluginResult(result);
        }
        else if (how == READER_TIMEOUT) {

          JSONObject jsonObject = new JSONObject();
          try {
            jsonObject.put("ACTION", "CANCEL");
            jsonObject.put("RESULT", "canceled");
            jsonObject.put("Description", activity.getResources().getString(R.string.msg_timeout_reading_process));
          } catch (JSONException e1) {
            e1.printStackTrace();
          }
          PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
          result.setKeepCallback(true);
          callbackContext.sendPluginResult(result);
          BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
          if (mBluetoothAdapter.isEnabled()) {
            Handler handler = new Handler();
            handler.postDelayed(new Runnable() {
              public void run() {

                Toast.makeText(activity.getApplicationContext(),
                  activity.getResources().getString(R.string.msg_restart_bluetooth), Toast.LENGTH_LONG).show();
              }
            }, 3 * 1000); // time in millis
          }
        }

      }

    }
  }

  private class ShowMyIDInfo implements Runnable {
    private String readerName;
    private boolean showMyKadPhoto;
    private JSONObject resultData = null;
    Activity activity;

    ShowMyIDInfo(Activity activity, final JSONObject resultData, final String readerName, final boolean showMyKadPhoto){
      this.activity = activity;
      this.readerName = readerName;
      this.showMyKadPhoto = showMyKadPhoto;
      this.resultData = resultData;
    }
    @Override
    public void run() {

      readPhotoTask = new ReadMyKADPhoto(activity);
      readPhotoTask.execute(readerName);
      handlerTask.postDelayed(new Runnable() {
        @Override
        public void run() {
          if (readPhotoTask.getStatus() == AsyncTask.Status.RUNNING) {
            readPhotoTask.cancel(true);
          }
        }
      }, activity.getResources().getInteger(R.integer.timeout_reading) * 1000);

      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          JSONObject jsonObject = new JSONObject();
          try {
            jsonObject.put("ACTION", "CARD_READ_SUCCESS");
            jsonObject.put("RESULT", resultData.toString());
            jsonObject.put("PLACE", "ShowMyIDInfo");
            jsonObject.put("Description", "Read MyKad Done");
          } catch (JSONException e1) {
            e1.printStackTrace();
          }
          PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
          result.setKeepCallback(true);
          callbackContext.sendPluginResult(result);
        }

      });

    }
  }

  public class ReadMyKADPhoto extends AsyncTask<String, Void, Bitmap> {
    Activity activity;
    public ReadMyKADPhoto(Activity activity) {
      this.activity = activity;
    }

    @Override
    protected Bitmap doInBackground(String... params){

      String readerName = params[0];
      try {
        if (!isCancelled()) {
          readerManager.connectReader(readerName);
        } else {
          return null;
        }
      } catch (MyIDException e) {
        return null;
      }

      try {
        if (!isCancelled()) {
          return readerManager.readMyKADPhoto();
        } else {
          return null;
        }
      } catch (MyIDException e) {
        return null;
      }


    }

    @Override
    protected void onCancelled(Bitmap bitmap){
      readerManager.disconnectReader();
    }

    @SuppressLint("WrongThread")
    @Override
    protected void onPostExecute(Bitmap bitmap) {
      try {
        readerManager.disconnectReader();
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 60, byteArrayOutputStream);
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        String encoded = Base64.encodeToString(byteArray, Base64.DEFAULT);

        activity.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            JSONObject jsonObject = new JSONObject();
            try {
              jsonObject.put("ACTION", "CARD_READ_PHOTO_SUCCESS");
              jsonObject.put("RESULT", encoded);
              jsonObject.put("PLACE", "ReadMyKADPhoto");
              jsonObject.put("Description", "Read MyKad photo done");
            } catch (JSONException e1) {
              e1.printStackTrace();
            }
            PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
            result.setKeepCallback(true);
            callbackContext.sendPluginResult(result);
          }

        });
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }

  private void showAlertDialog(String alertMessage) {
    AlertDialog alertDialog = new AlertDialog.Builder(this.cordova.getContext()).create();
    alertDialog.setTitle(this.cordova.getActivity().getResources().getString(R.string.lblError));
    alertDialog.setMessage(alertMessage);
    alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
      new DialogInterface.OnClickListener() {
        public void onClick(DialogInterface dialog, int which) {
          dialog.dismiss();

        }
      });
    alertDialog.show();
  }
}
