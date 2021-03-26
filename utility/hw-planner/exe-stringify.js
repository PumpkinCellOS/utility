/*
    HW Planner EXE Expression Stringify
    Sppmacd (c) 2020 - 2021
*/

function exe_parse(str)
{
    return EXEParser.parse(str);
}

function exe_type_str(type)
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
}

function colorify(val, color)
{
    return "<span style='color: " + color + "'>" + val + "</span>";
}

function exe_stringify_value(obj)
{
    if(typeof obj == "object")
    {
        if(obj.type && obj.type == "topic-expression")
            return obj.value.join(".");
        else
            return obj;
    }
    return obj;
}

function exe_stringify_definer(obj)
{
    if(typeof obj == "object")
    {
        if(obj.length)
        {
            var i = 0;
            var output = "<b>(</b>";
            for(var val of obj)
            {
                output += exe_stringify_definition(val);
        
                if(i < obj.length - 1)
                    output += ", ";
                
                i++;
            }
            return output + "<b>)</b>";
        }
        return exe_type_str(obj.type) + " <span class='exe-value'><b>" + exe_stringify_value(obj.value) + "</b></span>";
    }
    if(obj == "*")
        return "All";
    return obj;
}

function exe_stringify_definition(obj)
{
    var output = "";
    
    var i = 0;
    for(var val of obj)
    {
        output += exe_stringify_definer(val);
        
        if(i < obj.length - 1)
            output += " &#10148; ";
        
        i++;
    }
    
    return output;
}

function exe_stringify_hr(obj)
{
    var output = "";
    
    if(obj == null)
        return "(invalid)";
    
    var i = 0;
    for(var val of obj)
    {
        output += exe_stringify_definition(val);
        
        if(i < obj.length - 1)
            output += " &nbsp;&#8275;&nbsp; ";
        
        i++;
    }
    
    return output;
}
