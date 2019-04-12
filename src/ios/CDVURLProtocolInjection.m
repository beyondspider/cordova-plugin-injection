//
//  CDVURLProtocolInjection.m
//  cashflowApp
//
//  Created by Zhou, Mingming on 2019/3/18.
//

#import "CDVURLProtocolInjection.h"
#import <CoreServices/UTType.h>

NSString* const kCDVAssetsLibraryPrefixes = @"http://injection/";

@implementation CDVURLProtocolInjection

// 这个方法用来拦截H5页面请求
+ (BOOL)canInitWithRequest:(NSURLRequest*)theRequest
{
    NSURL* theUrl = [theRequest URL];
    
    // 判断是否是我们定义的url，若是，返回YES，继续执行其他方法，若不是，返回NO，不执行其他方法
    if ([[theUrl absoluteString] hasPrefix:kCDVAssetsLibraryPrefixes]) {
        return YES;
    }
    
    return NO;
}

+ (NSURLRequest*)canonicalRequestForRequest:(NSURLRequest*)request
{
    // NSLog(@"%@ received %@", self, NSStringFromSelector(_cmd));
    return request;
}
// 获取本地文件路径
- (NSString*)pathForResource:(NSString*)resourcepath
{
    NSBundle* mainBundle = [NSBundle mainBundle];
    NSMutableArray* directoryParts = [NSMutableArray arrayWithArray:[resourcepath componentsSeparatedByString:@"/"]];
    NSString* filename = [directoryParts lastObject];
    
    [directoryParts removeLastObject];
    NSString* directoryPartsJoined = [directoryParts componentsJoinedByString:@"/"];
    NSString* directoryStr = @"www";
    
    if ([directoryPartsJoined length] > 0) {
        directoryStr = [NSString stringWithFormat:@"%@/%@", directoryStr, [directoryParts componentsJoinedByString:@"/"]];
    }
    
    return [mainBundle pathForResource:filename ofType:@"" inDirectory:directoryStr];
}

// 在canInitWithRequest方法返回YES以后，会执行该方法，完成替换资源并返回给H5页面
- (void)startLoading
{
    // NSLog(@"%@ received %@ - start", self, NSStringFromSelector(_cmd));
    NSString* url=super.request.URL.resourceSpecifier;
    NSString* cordova = [url stringByReplacingOccurrencesOfString:@"//injection/" withString:@""];
    NSURL* startURL = [NSURL URLWithString:cordova];
    NSLog(@"%@", cordova);
    
    NSString* cordovaFilePath =[self pathForResource:[startURL path]];
    if (!cordovaFilePath) {
        [self sendResponseWithResponseCode:401 data:nil mimeType:nil];//重要
        return;
    }
    CFStringRef pathExtension = (__bridge_retained CFStringRef)[cordovaFilePath pathExtension];
    CFStringRef type = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, pathExtension, NULL);
    CFRelease(pathExtension);
    NSString *mimeType = (__bridge_transfer NSString *)UTTypeCopyPreferredTagWithClass(type, kUTTagClassMIMEType);
    if (type != NULL)
    CFRelease(type);
    //    NSURLResponse *response = [[NSURLResponse alloc] initWithURL:super.request.URL    MIMEType:mimeType expectedContentLength:-1 textEncodingName:nil];
    NSData* data = [NSData dataWithContentsOfFile:cordovaFilePath];
    [self sendResponseWithResponseCode:200 data:data mimeType:mimeType];
}


- (void)stopLoading
{
    // do any cleanup here
}

+ (BOOL)requestIsCacheEquivalent:(NSURLRequest*)requestA toRequest:(NSURLRequest*)requestB
{
    return NO;
}

// 将本地资源返回给H5页面
- (void)sendResponseWithResponseCode:(NSInteger)statusCode data:(NSData*)data mimeType:(NSString*)mimeType
{
    if (mimeType == nil) {
        mimeType = @"text/plain";
    }
    
    NSHTTPURLResponse* response = [[NSHTTPURLResponse alloc] initWithURL:[[self request] URL] statusCode:statusCode HTTPVersion:@"HTTP/1.1" headerFields:@{@"Content-Type" : mimeType}];
    
    [[self client] URLProtocol:self didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageNotAllowed];
    if (data != nil) {
        [[self client] URLProtocol:self didLoadData:data];
    }
    [[self client] URLProtocolDidFinishLoading:self];
}

@end
