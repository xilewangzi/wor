import DCloudUTSFoundation
public var hello = {
() -> String in
return "hello my uts test"
}
public func helloByJs() -> String {
    return hello()
}
@objc(UTSSDKModulesHelloTestIndexSwift)
@objcMembers
public class UTSSDKModulesHelloTestIndexSwift : NSObject {
    public static func s_helloByJs() -> String {
        return helloByJs()
    }
}
