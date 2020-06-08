let states_data = [];
let news_week_data = [];
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

Date.prototype.getWeek = function() { // https://stackoverflow.com/questions/9045868/javascript-date-getweek
    let onejan = new Date(this.getFullYear(),0,1);
    let today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
    let dayOfYear = ((today - onejan + 86400000)/86400000);
    return Math.ceil(dayOfYear/7)
};

function wordFreq(string) { // https://stackoverflow.com/questions/30906807/word-frequency-in-javascript
    var words = string.replace(/[.]/g, '').split(/\s/);
    var freqMap = {};
    words.forEach(function(w) {
        if (!freqMap[w]) {
            freqMap[w] = 0;
        }
        freqMap[w] += 1;
    });

    return freqMap;
}

function execute() {
    document.getElementById("loading").innerText = "";
    let target = document.getElementById("state");
    let current_state = target.options[target.selectedIndex].value;
    console.log(target.options[target.selectedIndex].value);
    d3.selectAll("svg").remove();

    let current_data = states_data.find(e => e.state === current_state).data;
    let week_data = [];
    current_data.forEach(d => {
        let i = week_data.findIndex(e => e.week === d.date_week);
        if (i < 0) {
            week_data.push({
                week: d.date_week,
                case: parseInt(d.case)
            })
        } else {
            week_data[i].case += parseInt(d.case);
        }
    });
    console.log(week_data);
    //var x = d3.scaleTime()
    //    .domain(d3.extent(current_data, function(d) { return d.date; }))
    //    .range([0,width]);



    var x_ = d3.scaleLinear()
        .domain(d3.extent(week_data, function(d) { return d.week;}))
        .range([0,width]);
    var y_ = d3.scaleLinear()
        .domain([0, d3.max(week_data, function(d) { return d.case; })])
        .range([height, 0]);


    var bar_svg = d3.select("#bar_chart")
        .append("svg")
        .attr('width',width + margin.left + margin.right)
        .attr('height',height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    bar_svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x_));

    bar_svg.append("g")
        .call(d3.axisLeft(y_));

    bar_svg.selectAll('rect')
        .data(week_data)
        .enter()
        .append('rect')
        .attr('x', function(d) {
            return x_(d.week);
        })
        .attr('y', function(d) {
            return y_(d.case);
        })
        .attr('width', function(d) {
            return 10;
        })
        .attr('height', function(d) {
            return height - y_(d.case);
        })
        .attr('fill','blue');

    bar_svg.selectAll('rect')
        .on("click", showNews);
    function showNews(datum) {
        let content = document.getElementById("contents");
        content.innerText = datum.week;
        let news_table = "";
        news_week_data.forEach((e,i) => {
            if (datum.week == e.date_week) {
                e.news.forEach((f,k) => {
                    news_table = news_table + "\n"+ f.title;
                })
            }
        });
        let news_freq = wordFreq(news_table);
        let news_freq_print = "";
        Object.keys(news_freq).sort(function(a, b) {
            return +(news_freq[a] < news_freq[b]) || +(news_freq[a] === news_freq[b]) - 1;
        }).forEach(function (word) {news_freq_print = news_freq_print + "\n" + word + ": " + news_freq[word]});
        content.innerText = news_freq_print;

    }
}

function case_data_handling(news_data, case_data) {
    console.log("case data handling called");
    let loader = document.getElementById("loading");
    case_data.forEach((d, k) => {
        let i = states_data.findIndex(e => e.state === d.state);
        if (i > -1) {
            let j = states_data[i].data.findIndex(e => e.date === d.date);
            if (j > -1) {
                states_data[i].data[j].case += d.cases;
            } else {
                states_data[i].data.push({
                    date: d.date,
                    case: d.cases,
                    date_week: d.date.getWeek()
                })
            }
        } else {
            states_data.push({
                state: d.state,
                data: [{
                    date: d.date,
                    case: d.cases,
                    date_week: d.date.getWeek()
                }]
            });
        }
    });
    console.log(states_data);

    states_data.forEach((e, i) => {
        if (i === 0) {
            let state_list = d3.select('#state').append("option").attr("value", e.state).html(e.state);
        } else {
            let state_list = d3.select('#state').append("option").attr("value", e.state).html(e.state);
        }
    });

    news_data.forEach((e,i) => {
        let k = news_week_data.findIndex(f => f.date_week == e.publish_date.getWeek());
        if (k > -1) {
            news_week_data[k].news.push({
                date: e.publish_date,
                title: e.title
            });
        }
        else {
            news_week_data.push({
                date_week: e.publish_date.getWeek(),
                news: [{
                    date: e.publish_date,
                    title: e.title
                }]
            });
        }
    });
    console.log(news_week_data);

    loader.innerText = "File reading completed!"
}