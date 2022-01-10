package cordova.plugins.vcardtemp;

public class FsdkCmd {
    public static String ConfigT(){
        String cmd="ConfigT\r\n";
        return cmd;
    }
    public static String QueryT(){
        String cmd="QueryT\r\n";
        return cmd;
    }
    public static String CalcT(){
        String cmd="CalcT\r\n";
        return cmd;
    }
    public static String SetE(int e){
        String cmd=String.format("SetE=%d\r\n", e);
        return cmd;
    }
    public static String QueryCalcT(){
        String cmd="QueryCalcT\r\n";
        return cmd;
    }

    public static String SetA(int mode, float t){
        int temp = (int)(t*10)+2731;
        String cmd=String.format("SetA=%d,%d\r\n", mode,temp);
        return cmd;
    }

    public static String SetP(int index, int value){
        String cmd=String.format("SetP=%d,%d\r\n", index,value);
        return cmd;
    }
}
