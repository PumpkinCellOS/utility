module.exports = {

generateLabel(label, customImp)
{
    const tl = label.name;

    var topicLabelHTML = "";
    
    if(label == undefined)
    {
        if(customImp != undefined)
            return `<span class='topic-label imp-${customImp}'>` + tl + "</span>";
        return "<span class='topic-label imp-none'>" + tl + "</span>";
    }
    
    var imp = label.imp;
    
    console.log("hwPlanner.generateLabel(): ", tl, customImp);
    if(customImp != undefined)
    {
        imp = customImp;
    }
    
    switch(imp)
    {
        case "verybig": topicLabelHTML += "<span class='topic-label imp-verybig'>" + tl + "</span>"; break;
        case "big":     topicLabelHTML += "<span class='topic-label imp-big'>" + tl + "</span>"; break;
        case "medium":  topicLabelHTML += "<span class='topic-label imp-medium'>" + tl + "</span>"; break;
        case "small":   topicLabelHTML += "<span class='topic-label imp-small'>" + tl + "</span>"; break;
        case "none":    topicLabelHTML += "<span class='topic-label imp-none'>" + tl + "</span>"; break;
        default:        topicLabelHTML += "<span class='topic-label'>" + tl + "</span>"; break;
    }
    if(label.fullFlow == '1')
        topicLabelHTML += "&#128068; "; // mouth
    return topicLabelHTML;
},

openEditor(data) {
    // TODO: I18n
    console.log("Open Editor", data);
    tlfOpenForm([
        {type: "text", name: "name", value: data.name, placeholder: "Name"},
        {type: "select", options: [
            // TODO: Don't hardcode it everywhere
            {displayName: "None", value: "none"},
            {displayName: "Small", value: "small"},
            {displayName: "Medium", value: "medium"},
            {displayName: "Big", value: "big"},
            {displayName: "Very big", value: "verybig"}
        ], name: "imp", value: data.imp, displayName: "Importancy"},
        {type: "checkbox", name: "fullFlow", value: data.fullFlow, displayName: "Full flow &#128068;"},
        {type: "number", name: "preparationTime", value: data.preparationTime, displayName: "Preparation time"},
        {type: "number", name: "evaluationTime", value: data.evaluationTime, displayName: "Evaluation time"}
    ], (modifiedData)=> {
        modifiedData.id = data.id;
        hwPlannerAPI.call("modify-label", modifiedData, ()=> {
            hwPlannerAPI.call("get-labels", {}, (data)=> {
                this.openList(loadLabels(data));
            });
        });
    }, {
        title: "Edit label"
    });
},

openList(labels) {
    // TODO: I18n
    let dataTable = new TlfDataTable();
    let _this = this;
    dataTable.addField("Name", function(val) {
        return this.span(_this.generateLabel(val));
    });

    dataTable.addField("Preparation time", function(val) {
        return this.text(val.preparationTime ? val.preparationTime + " days" : "");
    });
    dataTable.addField("Evaluation time", function(val) {
        return this.text(val.evaluationTime ? val.evaluationTime + " days" : "");
    });
    dataTable.addControl("Edit", (data) => {
        this.openEditor(data);
    }, (data) => {return data.id !== undefined;});
    for(const [name, label] of Object.entries(labels))
    {
        if(label.id === undefined)
            continue;
        let entry = label;
        entry.name = label.display ?? name;
        dataTable.addEntry(entry);
    }
    let container = document.getElementById("label-editor-list-container");
    container.innerHTML = "";
    container.appendChild(dataTable.generate());
    document.getElementById("label-editor-list").style.display = "block";
}

}
