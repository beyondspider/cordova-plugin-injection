module.exports = function(ctx) {  
    console.log("iosBeforeUninstall");
    
    var path = ctx.requireCordovaModule('path'),
        fs = ctx.requireCordovaModule('fs'),
        projectRoot = ctx.opts.projectRoot,
        deferral = ctx.requireCordovaModule('q').defer(),
        plugins = ctx.opts.plugins || [];

    var ConfigParser = null;  
    try {    
        ConfigParser = ctx.requireCordovaModule('cordova-common').ConfigParser;  
    } catch (e) {     // fallback
            
        ConfigParser = ctx.requireCordovaModule('cordova-lib/src/configparser/ConfigParser');  
    }

      
    var config = new ConfigParser(path.join(projectRoot, "config.xml"));

    console.log("config = " + config);
    var name = config.name();

    console.log("name = " + name);

    var iosDelegateFilePath = path.join(projectRoot, "platforms/ios/" + name + "/Classes/AppDelegate.m");
    console.log("iosDelegateFilePath = " + iosDelegateFilePath);

    var iosDelegateFileContent = `
#import "AppDelegate.h"
#import "MainViewController.h"
@implementation AppDelegate

- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    self.viewController = [[MainViewController alloc] init];
    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

@end
`
    fs.writeFileSync(iosDelegateFilePath, iosDelegateFileContent, 'utf8');
    console.log('Updated Cordova AppDelegate.m');

    deferral.resolve();
    
    return deferral.promise;
};