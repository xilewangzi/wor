# xtf-gpslocation
# android ios 原生gps 定位
### 长期维护，有任何问题在插件群联系
### 若长期无法获取到定位，请到室外进行定位  室内大概率无gps 信号
### [推荐作者保活插件一起使用](https://ext.dcloud.net.cn/plugin?id=20316)
### uniappx
~~~
import { isProviderEnabled, openLocSetting,  onStartLoc,LocData,stop,requestBackgroundLocPer,getLastLocation,LocationData} from "@/uni_modules/xtf-gpslocation"



var on=isProviderEnabled();// 是否开启gps
if(!on){
	openLocSetting();// 打开gps 设置
}
requestBackgroundLocPer();// 申请后台定位权限 无权限则申请，有权限则直接跳过


// 获取上次定位
getLastLocation(function(type:number,lat:number,lng:number,speed:number,alt:number,bearing:number){
	console.log(loc)
})

onStartLoc({
	backgroud:true,
} as LocData,function(type:number,lat:number,lng:number,speed:number,alt:number,bearing:number){
	//console.log(loc)
})
// stop(true);// 停止定位   参数为是否移除通知
~~~

### uniapp
~~~
import { isProviderEnabled, openLocSetting,  onStartLocs,LocData,stop,requestBackgroundLocPer,getLastLocations} from "@/uni_modules/xtf-gpslocation"



var on=isProviderEnabled();// 是否开启gps
if(!on){
	openLocSetting();// 打开gps 设置
}

requestBackgroundLocPer();// 申请后台定位权限 无权限则申请，有权限则直接跳过
// 获取上次定位
getLastLocation(function(type,lat,lng,speed,alt,bearing){
	//console.log(loc)
})

onStartLoc({
	backgroud:true,
} as LocData,function(type,lat,lng,speed,alt,bearing){
	//console.log(loc)
})
// stop(true);// 停止定位   参数为是否移除通知
~~~
### 请求参数  LocData 
~~~
 export type LocData={
	 title?:string,// 通知栏标题
	 content?:string,// 通知栏内容
	 notifationIconName?:string, // 通知栏icon名称  插件目录 /app-android/res/drawable/
	 time?:number, // 定位时间间隔，默认0  为仅定位一次 时间为毫秒
	 distance?:number,// 定位位置间隔距离  // 默认0
	 backgroud?:boolean,// 是否是后台定位,
	 getLastFast?:boolean,// 是否先获取上次定位 之后在返回新的定位 // 默认true
};
~~~
### 返回参数  LocationData 
~~~
 export type LocationData={
	 msg:string,// 消息
	type:number,//  0 是上一次的  1 是最新的  2 定位失败
	lat:number, //经度
	lng:number,//纬度
	speed:number,//速度
	altitude:number,//海拔
};
~~~

### 开发文档
[UTS 语法](https://uniapp.dcloud.net.cn/tutorial/syntax-uts.html)
[UTS API插件](https://uniapp.dcloud.net.cn/plugin/uts-plugin.html)
[UTS uni-app兼容模式组件](https://uniapp.dcloud.net.cn/plugin/uts-component.html)
[UTS 标准模式组件](https://doc.dcloud.net.cn/uni-app-x/plugin/uts-vue-component.html)
[Hello UTS](https://gitcode.net/dcloud/hello-uts)