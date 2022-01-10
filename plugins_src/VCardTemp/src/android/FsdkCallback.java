package cordova.plugins.vcardtemp;

import android.graphics.Bitmap;

public interface FsdkCallback {
    public void Temp(float t);
    public void MaxTemp(float t, int x , int y);
    public void HeatBitmap(Bitmap bit);
    public void TempList(String tl);
    public void Error(String s);
    public void onEChange(int e);
    public void Msg(String s);
}
