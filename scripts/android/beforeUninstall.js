module.exports = function(ctx) {  
    console.log("android before uninstall");
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

    var systemWebViewClientPath = path.join(projectRoot, "platforms/android/CordovaLib/src/org/apache/cordova/engine/SystemWebViewClient.java");
    console.log("systemWebViewClientPath = " + systemWebViewClientPath);

    var systemWebViewClient = fs.readFileSync(systemWebViewClientPath, 'utf-8');

    if (systemWebViewClient.indexOf("INJECTION_TOKEN") > 0) {
        //console.log("systemWebViewClient = " + systemWebViewClient);
        var words = systemWebViewClient.split("shouldInterceptRequest");
        var part1 = words[0];
        var part2 = words[1];
        var begin = part2.indexOf("INJECTION_TOKEN_BEGIN");
        var end = part2.indexOf("INJECTION_TOKEN_END");
        console.log("INJECTION_TOKEN_BEGIN  = " + begin);
        console.log("INJECTION_TOKEN_END = " + end);

        var newPart2 = part2.slice(0, begin - 2) +  part2.slice(end + "INJECTION_TOKEN_END".length);

        fs.writeFileSync(systemWebViewClientPath, part1 + "shouldInterceptRequest" +  newPart2, 'utf8');

        console.log('Updated Cordova SystemWebViewClient.java');
    }

    deferral.resolve();
    
    return deferral.promise;
};