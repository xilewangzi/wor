let getData = {
    fetchApi: function (params) {
        let that = this;
        return new Promise((resolve, reject) => {
            var contenttype = params.contenttype;
            if(contenttype){
                uni.request({
                    url: params.API_URL,
                    data: Object.assign( params.data),
                    method: params.method ? params.method : 'GET',
                    header: {
                        Authorization: 'Bearer ' + uni.getStorageSync('token'),
                        'content-type': 'application/json',
						token: uni.getStorageSync('token'),
                    },
                    Connection: "keep-alive",
                    "Transfer-Encoding": "chunked",
                    success: resolve,
                    fail: reject
                });
            }else{
                uni.request({
                    url: params.API_URL,
                    data: Object.assign({}, params.data),
                    method: params.method ? params.method : 'GET',
                    header: {
                        'content-type': 'application/json',
                        Authorization: 'Bearer ' + uni.getStorageSync('token'),
                        'content-type': 'application/x-www-form-urlencoded',
						token: uni.getStorageSync('token'),
                    },
                    success: resolve,
                    fail: reject
                });
            }
            
        });
    },
    result: function (params) {
        let that = this;
        return that.fetchApi(params).then((res) => res);
    }
};
export default getData;