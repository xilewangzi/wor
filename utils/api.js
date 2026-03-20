// let host = "https://zone.maxdata.cc:4430/api/v1" // 生产域名
let host = 'https://car.jiaqiandianzi.xyz/index.php/api/v1';
let host1 = 'https://applet.jiaqiandianzi.xyz';
let host2 = 'https://wor.jiaqiandianzi.xyz';

let api = {
    
	//选择声浪
	chooseVoice:`${host}/user/choose-voice/`,
	//登录
	miniLogin :`${host1}/api/user/third`,
	//首页车辆列表
	carList:`${host1}/api/index/car_list`,
	//获取系统设置
	system:`${host1}/api/index/base_config`,
	//提交信息
	userSave: `${host1}/api/index/user_save`,
	//激活
	activeCar: `${host1}/api/index/active_car`,
	//生成订单
	// createOrder: `${host1}/api/index/save_order`,
	//APP生成订单
	createOrder:`${host1}/api/index/save_order`,
	//支付
	 wxPay:`${host1}/api/payment/order_pay`,
	// 支付宝支付
	// export const wxPay = BASE_URL + '/api/payment/order_alipay'
	// 支付宝APP支付
	// aliPay :`${host1}/api/payment/order_app_alipay`,
	// 微信APP支付
	// wxPay:`${host1}/api/payment/order_miniapp_pay`,
	// wxPay:`${host1}/api/payment/order_pay`,
	// 手机号登录
	// export const Login = BASE_URL + '/api/user/login' 
	Login:`${host1}/api/user/login_mobile`,
	quickLogin:`${host1}/api/user/login_mobile_nocode`,
	// 注册
	register:`${host1}/api/user/register`,
	// 协议
	agreement:`${host1}/api/user/agreement`,
	// 退出登录
	Logout:`${host1}/api/user/logout`,
	// 获取验证码
	verifica:`${host1}/api/sms/send`,
};

export {api,host1};