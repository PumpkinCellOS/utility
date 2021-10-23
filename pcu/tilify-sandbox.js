var data = document.getElementById("data");

var dataTable = new TlfDataTable();
dataTable.addField("Test", function(data) { return this.text(data.test) });
dataTable.addField("Test2", function(data) { return this.anchor(data.test2, data.test2) });
dataTable.addEntry({ test: "111", test2: "222" });

data.appendChild(dataTable.generate());

var plot = new TlfPlot(function(x) {
    return x * x;
}, {
    mode: "line",
    step: 0.01,
    xRange: [-2, 2]
});
plot.drawInto(document.getElementById("plot-canvas"));
