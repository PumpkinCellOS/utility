/*
    HW Planner EXE Expression Stringify
    Sppmacd (c) 2020 - 2021
*/

module.exports = {

    exe_type_str: function(type)
    {
        switch(type)
        {
            case "B": return L("exe.book");
            case "C": return L("exe.chapter");
            case "P": return L("exe.page");
            case "p": return L("exe.point");
            case "T": return L("exe.topic");
            case "x": return L("exe.ex");
            case null:
            case undefined:
                return "???";
            default: return type + " (?)";
        }
    },

    colorify: function(val, color)
    {
        return "<span style='color: " + color + "'>" + val + "</span>";
    },

    exe_stringify_value: function(obj)
    {
        if(typeof obj == "object")
        {
            if(obj.type && obj.type == "topic-expression")
                return obj.value.join(".");
            else
                return obj;
        }
        return obj;
    },

    exe_stringify_definer: function(obj)
    {
        if(typeof obj == "object")
        {
            if(obj.length)
            {
                var i = 0;
                var output = "<b>(</b>";
                for(var val of obj)
                {
                    output += this.exe_stringify_definition(val);
            
                    if(i < obj.length - 1)
                        output += ", ";
                    
                    i++;
                }
                return output + "<b>)</b>";
            }
            return this.exe_type_str(obj.type) + " <span class='exe-value'><b>" + this.exe_stringify_value(obj.value) + "</b></span>";
        }
        if(obj == "*")
            return "All";
        return obj;
    },

    exe_stringify_definition: function(obj)
    {
        var output = "";
        
        var i = 0;
        for(var val of obj)
        {
            output += this.exe_stringify_definer(val);
            
            if(i < obj.length - 1)
                output += " &#10148; ";
            
            i++;
        }
        
        return output;
    },

    exe_stringify_hr: function(obj)
    {
        var output = "";
        
        if(obj == null)
            return "(invalid)";
        
        var i = 0;
        for(var val of obj)
        {
            output += this.exe_stringify_definition(val);
            
            if(i < obj.length - 1)
                output += " &nbsp;&#8275;&nbsp; ";
            
            i++;
        }
        
        return output;
    }
};
