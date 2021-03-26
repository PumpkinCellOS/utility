/*
    HW Planner i18n
    Sppmacd (c) 2021
*/

var I18n = {
    translate: function(lang, key, args)
    {
        try
        {
            if(lang === null || lang === undefined)
                lang = this.LANG;

            var keys = key.split(".");
            var currentVal = lang;
            for(var k in keys)
            {
                var _key = keys[k];
                var currentNew = currentVal[_key];
                if(currentNew === undefined)
                {
                    if(lang == this.FALLBACK_LANG)
                    {
                        console.warn(`I18n: No translation key '${key}'`);
                        return "{" + key + "}(" + args.join(",") + ")";
                    }
                    if(this.debugFallback)
                    {
                        console.debug(`I18n: Using fallback language for '${key}'`);
                    }
                    return this.translate(this.FALLBACK_LANG, key, args);
                }
                currentVal = currentNew;
                lastKey = k;
            }
            
            if(currentVal instanceof Function)
            {
                return currentVal(args);
            }
                
            for(var i = 0; i < args.length; i++)
            {
                currentVal = currentVal.replaceAll(`{${i+1}}`, args[i]);
            }
            
            return currentVal;
        }
        catch(e)
        {
            console.error(`I18n: ${e}`);
            return null;
        }
    },
    
    translateAll: function(data)
    {
        var regexp = /{([\w.]*)}(?:\(([\w\d\s]+)\))?/gm;
        
        var matches = data.replace(regexp, (match, key, args, offset, string) => {
            var argsAsArray = [];
            if(args !== undefined)
                argsAsArray = args.split(',');
            
            var stringStart = string.substring(0, offset);
            
            for(var arg of argsAsArray)
                arg = this.translateAll(arg);
            
            var stringMatch = this.translate(null, key, argsAsArray);
            
            var stringEnd = string.substring(offset + match.length);
            return stringStart + stringMatch + stringEnd;
        });
        
        return matches;
    },

    translatePage: function()
    {
        var n, walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while(n = walk.nextNode())
        {
            n.nodeValue = this.translateAll(n.nodeValue);
        }
    },
};

function L(key)
{
    return I18n.translate(null, key, Array.from(arguments).slice(1));
}
