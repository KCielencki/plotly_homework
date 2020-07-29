$(document).ready(function() {
    populateIDFilter();
});

function populateIDFilter() {
    $.ajax({
        type: 'GET',
        url: "static/data/samples.json",
        contentType: 'application/json;charset=UTF-8',
        success: function(data) {
            //console.log(data);
            data["names"].forEach(function(id) {
                console.log(id);
                let option = `<option>${id}</option>`;
                $('#selDataset').append(option);
            });

            let initID = data["names"][0]

            optionChanged(initID);
        }
    });
}

function optionChanged(id) {
    loadMetaData(id);
    makeBarPlot(id);
    makeBubblePlot(id);
    makeGaugePlot(id)
}

function loadMetaData(id) {
    $.ajax({
        type: 'GET',
        url: "static/data/samples.json",
        contentType: 'application/json;charset=UTF-8',
        success: function(data) {
            let metaData = data["metadata"].filter(x => x.id == id)[0];
            console.log(metaData);

            $('#sample-metadata').empty(); //clear the meta data table thing

            Object.entries(metaData).forEach(function([key, value]) {
                let info = `<p><b>${key.toUpperCase()}</b> : ${value} </p>`;
                $('#sample-metadata').append(info);
            });
        }
    });
}

function makeBarPlot(id) {
    $.ajax({
        type: 'GET',
        url: "static/data/samples.json",
        contentType: 'application/json;charset=UTF-8',
        success: function(data) {
            let sampleData = data["samples"].filter(x => x.id == id)[0];
            //I straight-up copied Alexander's code here (https://stackoverflow.com/questions/22015684/how-do-i-zip-two-arrays-in-javascript)
            let plotData = sampleData["otu_ids"].map(function(e, i) {
                return [e, sampleData["sample_values"][i]]; //creates a list of list
            });
            let plotData_Sorted = plotData.sort((a, b) => b[1] - a[1]);
            x = plotData_Sorted.map(x => x[1]).slice(0, 10).reverse() //[1] corresponds to the sample_value
            y = plotData_Sorted.map(x => "OTU " + x[0]).slice(0, 10).reverse() //[0] corresponds to the OTU ID (the OTU is neccessary to append)

            var traces = [{
                type: 'bar',
                x: x,
                y: y,
                orientation: 'h',
                marker: {
                    color: x,
                    colorscale: 'Bluered'
                }
            }];

            var layout = {
                title: 'OTU Ids to Values'
            };

            Plotly.newPlot('bar', traces, layout);
        }
    });
}

function makeBubblePlot(id) {
    $.ajax({
        type: 'GET',
        url: "static/data/samples.json",
        contentType: 'application/json;charset=UTF-8',
        success: function(data) {
            let sampleData = data["samples"].filter(x => x.id == id)[0];

            var trace1 = {
                x: sampleData["otu_ids"],
                y: sampleData["sample_values"],
                mode: 'markers',
                marker: {
                    size: sampleData["sample_values"].map(x => x * 0.75),
                    color: sampleData["otu_ids"],
                    colorscale: 'Bluered'
                }
            };

            var data = [trace1];

            var layout = {
                title: 'OTU Ids to Values',
                showlegend: false,
            };

            Plotly.newPlot('bubble', data, layout);
        }
    });
}

function makeGaugePlot(id) {
    $.ajax({
        type: 'GET',
        url: "static/data/samples.json",
        contentType: 'application/json;charset=UTF-8',
        success: function(data) {
            let sampleData = data["metadata"].filter(x => x.id == id)[0];

            let all_wfreq = data["metadata"].map(x => x.wfreq);
            all_wfreq = all_wfreq.filter(function(el) {
                return el != null;
            });

            //function for average
            let average = (array) => array.reduce((a, b) => a + b) / array.length;

            console.log(sampleData);

            var trace1 = {
                type: "indicator",
                mode: "gauge+number+delta",
                value: sampleData.wfreq,
                delta: { reference: average(all_wfreq), increasing: { color: "RebeccaPurple" } },
                gauge: {
                    axis: { range: [Math.min(...all_wfreq), Math.max(...all_wfreq)], tickwidth: 1, tickcolor: "darkblue" },
                    bar: { color: "darkblue" },
                    bgcolor: "white",
                    borderwidth: 2,
                    bordercolor: "gray",
                    steps: [
                        { range: [Math.min(...all_wfreq), Math.max(...all_wfreq)], color: "cyan" }
                    ],
                    threshold: {
                        line: { color: "red", width: 4 },
                        thickness: 0.75,
                        value: sampleData.wfreq
                    }
                }
            }

            var data = [trace1];

            var layout = {
                title: "Belly Button Washing Frequency"
            };

            Plotly.newPlot('gauge', data, layout);
        }
    });
}