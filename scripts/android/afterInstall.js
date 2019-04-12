module.exports = function(ctx) {  
    console.log("android after install");
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

    if (systemWebViewClient.indexOf("INJECTION_TOKEN") == -1) {
        //console.log("systemWebViewClient = " + systemWebViewClient);
        var words = systemWebViewClient.split("shouldInterceptRequest");
        var part1 = words[0];
        var part2 = words[1];
        var start = part2.indexOf("try");
        console.log("try start = " + start);


        var injectionContent = 
        `//INJECTION_TOKEN_BEGIN
        String INJECTION_TOKEN = "http://injection/";
        if (url != null && url.contains(INJECTION_TOKEN)) {
            String assetPath = "www/" + url.substring(url.indexOf(INJECTION_TOKEN) + INJECTION_TOKEN.length(), url.length());
            try {
                return new WebResourceResponse(
                        "application/javascript",
                        "UTF-8",
                        view.getContext().getAssets().open(assetPath));
            } catch (IOException e) {
                e.printStackTrace();
                return new WebResourceResponse("text/plain", "UTF-8", null);
            }
        }
        //INJECTION_TOKEN_END
        `;

        var newPart2 = part2.slice(0, start) + injectionContent + part2.slice(start);

        //console.log('newPart2 = ' + newPart2);

        fs.writeFileSync(systemWebViewClientPath, part1 + "shouldInterceptRequest" +  newPart2, 'utf8');

        console.log('Updated Cordova SystemWebViewClient.java');
    }

    deferral.resolve();
    
    return deferral.promise;
};