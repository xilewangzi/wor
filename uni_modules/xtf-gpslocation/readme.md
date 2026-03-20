# xtf-gpslocation
# android ios 原生gps 定位
### 长期维护，有任何问题在插件群联系
### 插件测试使用方法
1. 选择试用，绑定要试用的项目appid，

2. 选择后下载到对应的本地项目，

3. 按照文档 -》把插件引入项目（即 import { isProviderEnabled, openLocSetting,  onStartLocs,LocData,stop,requestBackgroundLocPer,getLastLocations,LoctionData} from "@/uni_modules/xtf-gpslocation"
 需要先引入），

4. 发布-》云打包-》选择制作基座-》打包等基座制作完成 

5. 运行 -》 运行到手机或模拟器-》运行到Androidapp基座-》选择使用自定义基座运行-》选择手机-》运行
### 若长期无法获取到定位，请到室外进行定位  室内大概率无gps 信号
### [推荐作者保活插件一起使用](https://ext.dcloud.net.cn/plugin?id=20316)
### uniappx

~~~
import { isProviderEnabled, openLocSetting,  onStartLocs,LocData,stop,requestBackgroundLocPer,getLastLocations,LoctionData} from "@/uni_modules/xtf-gpslocation"



var on=isProviderEnabled();// 是否开启gps
if(!on){
	openLocSetting();// 打开gps 设置
}
requestBackgroundLocPer();// 申请后台定位权限 无权限则申请，有权限则直接跳过


// 获取上次定位
getLastLocations(function(loc:LoctionData){
	console.log(loc)
})

onStartLoc({
	backgroud:true,
} as LocData,function(loc:LoctionData){
	console.log(loc)
})
// stop(true);// 停止定位   参数为是否移除通知
~~~

### uniapp

~~~
import { isProviderEnabled, openLocSetting,  onStartLocs,stop,requestBackgroundLocPer,getLastLocations} from "@/uni_modules/xtf-gpslocation"



var on=isProviderEnabled();// 是否开启gps
if(!on){
	openLocSetting();// 打开gps 设置
}

requestBackgroundLocPer();// 申请后台定位权限 无权限则申请，有权限则直接跳过
// 获取上次定位
getLastLocations(function(loc){
	console.log(loc)
})

onStartLoc({
	backgroud:true,
},function(loc){
	console.log(loc)
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
### 返回参数  LoctionData 
~~~
 export type LoctionData={
	 msg:string,// 消息
	type:number,//  0 是上一次的  1 是最新的  2 定位失败
	lat:number, //经度
	lng:number,//纬度
	speed:number,//速度
	altitude:number,//海拔
	bearing:number,// 方向
};
~~~

### 开发文档
[UTS 语法](https://uniapp.dcloud.net.cn/tutorial/syntax-uts.html)
[UTS API插件](https://uniapp.dcloud.net.cn/plugin/uts-plugin.html)
[UTS uni-app兼容模式组件](https://uniapp.dcloud.net.cn/plugin/uts-component.html)
[UTS 标准模式组件](https://doc.dcloud.net.cn/uni-app-x/plugin/uts-vue-component.html)
[Hello UTS](https://gitcode.net/dcloud/hello-uts)