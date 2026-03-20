@file:Suppress("UNCHECKED_CAST", "USELESS_CAST", "INAPPLICABLE_JVM_NAME", "UNUSED_ANONYMOUS_PARAMETER", "NAME_SHADOWING", "UNNECESSARY_NOT_NULL_ASSERTION")
package uts.sdk.modules.helloTest
import io.dcloud.uniapp.*
import io.dcloud.uniapp.extapi.*
import io.dcloud.unicloud.*
import io.dcloud.uts.*
import io.dcloud.uts.Map
import io.dcloud.uts.Set
import io.dcloud.uts.UTSAndroid
import kotlin.properties.Delegates
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
val UniErrorSubject = "uts-api"
val MyAPIErrors: Map<MyApiErrorCode, String> = Map(_uA(
    _uA(
        9010001,
        "custom error mseeage1"
    ),
    _uA(
        9010002,
        "custom error mseeage2"
    )
))
open class MyApiFailImpl : UniError, MyApiFail {
    override lateinit var errCode: MyApiErrorCode
    constructor(errCode: MyApiErrorCode) : super() {
        this.errSubject = UniErrorSubject
        this.errCode = errCode
        this.errMsg = MyAPIErrors.get(errCode) ?: ""
    }
}
val myApi: MyApi = fun(options: MyApiOptions) {
    if (options.paramA == true) {
        val res = MyApiResult(fieldA = 85, fieldB = true, fieldC = "some message")
        options.success?.invoke(res)
        options.complete?.invoke(res)
    } else {
        val err = MyApiFailImpl(9010001)
        options.fail?.invoke(err)
        options.complete?.invoke(err)
    }
}
val myApiSync: MyApiSync = fun(paramA: Boolean): MyApiResult {
    val res = MyApiResult(fieldA = 85, fieldB = paramA, fieldC = "some message")
    return res
}
fun myApiByJs(options: MyApiOptions): Unit {
    return myApi(options)
}
fun myApiSyncByJs(paramA: Boolean): MyApiResult {
    return myApiSync(paramA)
}
