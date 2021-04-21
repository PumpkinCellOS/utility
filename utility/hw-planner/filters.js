

module.exports = {

/*
var data = {};

data.status = [];
if(form["status-f"].checked) data.status.push("f");
if(form["status-ip"].checked) data.status.push("i");
if(form["status-e"].checked) data.status.push("a");
if(form["status-v"].checked) data.status.push("v");
if(form["status-x"].checked) data.status.push("x");
if(form["status-n"].checked) data.status.push("n");

data.turn_in = {};
data.turn_in.mode = form["turn-in-mode"].value;
data.turn_in.unit = form["turn-in-unit"].value;
data.turn_in.sign = form["turn-in-sign"].value;
data.turn_in.value = form["turn-in"].value;

data.added = {};
data.added.mode = form["added-mode"].value;
data.added.unit = form["added-unit"].value;
data.added.value = form["added"].value;

data.exercise_list = form["exercise-list"].checked;
data.optional = form["optional"].checked;
data.description = form["description"].checked;

data.label = null;
data.sub = null;
*/
    
filter: function(hw, filters)
{
    if(filters.exercise_list && hw.topicFormat != "N")
        return false;

    console.log(hw.optional);
    if(filters.optional && hw.optional == '0')
        return false;
    
    if(filters.description && hw.description.length == 0)
        return false;
    
    return true;
}

}
