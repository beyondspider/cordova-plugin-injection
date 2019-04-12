---
title: Injection
description: Access native API.
---

# cordova-plugin-injection
This plugin provides the ability to access device native API for remote website.

## Supported Platforms

- Android
- iOS

## Install
```bash
cordova plugin add https://github.com/beyondspider/cordova-plugin-injection.git
cordova plugin rm cordova-plugin-injection
```

## Use
edit index.html, add follow code fragment

```javascript
<script type="text/javascript">
    $(document).ready(function(){
        var script = document.createElement('script'); 
        script.type = "text/javascript"; 
        script.src="http://injection/cordova.js"; 
        document.getElementsByTagName('body')[0].appendChild(script);
    });  
</script>
```
http://injection/cordova.js will redirect to local file:///www/cordova.js.

## License

Copyright (c) 2019 beyondspider

[MIT License](http://en.wikipedia.org/wiki/MIT_License)