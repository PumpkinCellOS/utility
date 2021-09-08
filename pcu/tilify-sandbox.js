var data = document.getElementById("data");

var dataTable = new TlfDataTable();
dataTable.addField("test", "Test", function(data) { return this.text(data) });
dataTable.addField("test2", "Test2", function(data) { return this.anchor(data, data) });
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
