package cordova.plugins.vcardtemp;

public class FsdkDefine {
    public final static int com_close=0; //串口关闭
    public final static int com_open= 1;//串口打开
    public final static int com_receiving_data= 2;//串口接收数据中
    public final static int com_idle= 3;//串口空闲中

    public final static String ConfigT= "ConfigT";//查询配置
    public final static String QueryT= "QueryT";//获取所有温度点
    public final static String CalcT= "CalcT";//计算人体温度
    public final static String SetE= "SetE";//设置发射率
    public final static String QueryCalcT= "QueryCalcT";//查询所有温度点并且计算人体温度
    public final static String SetA= "SetA";//快速校准
    public final static String SetP= "SetP";//设置模块参数
}
