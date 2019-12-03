import * as d3 from "d3";
import Skycons from "./Skycons";

function convertFahrenheit(fTemp) {
  const t = ((fTemp - 32) * 5) / 9;
  return Number(t.toFixed(1));
}

export default function weaterChart(data) {
  const skycons = new Skycons({ color: "#abc6fb" });
  // on Android, a nasty hack is needed: {"resizeClear": true}

  const { hourly } = data;
  const margin = { top: 10, right: 30, bottom: 120, left: 40 };
  const width = 960 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;
  const overlayHeight = 400;

  let dateMarkers = {
    date: [],
    temperature: []
  };

  hourly.data.map(item => {
    const timeInSeconds = item.time * 1000;
    const date = new Date(timeInSeconds);

    dateMarkers.date.push(date);
    dateMarkers.temperature.push(convertFahrenheit(item.temperature));
  });

  // Add Y axis
  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(dateMarkers.temperature) * 1.1,
      d3.max(dateMarkers.temperature) * 1.1
    ])
    .range([overlayHeight, 0]);

  const xScale = d3.scaleTime().range([0, 960]);
  xScale.domain(d3.extent(dateMarkers.date));

  // 7. d3's line generator
  const line = d3
    .line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

  const lineCoordinates = dateMarkers.date.map((item, i) => ({
    x: item,
    y: dateMarkers.temperature[i]
  }));

  const drawYLinesGrid = () => {
    return d3.axisLeft(yScale).ticks(10);
  };

  const drawXLinesGrid = () => {
    return d3.axisBottom(xScale).ticks(20);
  };

  // get the position data in array
  const bisectDate = d3.bisector(data => {
    return data.x;
  }).left;

  // append the svg object to the body of the page
  const svg = d3
    .select("body")
    .append("svg")
    .attr("id", "test")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  skycons.add("test", Skycons.RAIN);
  skycons.play();
  svg
    .append("text")
    .attr("x", width / 2 - margin.left)
    .attr("y", 20)
    .attr("style", "font-size: 1.2em")
    .text(data.timezone.split("/")[1]);

  svg
    .append("g")
    .attr("class", "grid")
    .call(
      drawYLinesGrid()
        .tickSize(-1000)
        .tickFormat("")
    );

  svg
    .append("g")
    .attr("class", "grid")
    .call(
      drawXLinesGrid()
        .tickSize(height + 80)
        .tickFormat("")
    );

  svg
    .append("path")
    .datum(lineCoordinates)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  svg
    .append("g")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end");

  svg
    .append("g")
    // eslint-disable-next-line no-undef
    .attr("transform", `translate(0, ${height + 80})`)
    .call(d3.axisBottom(xScale).ticks(20))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.5em")
    .attr("dy", ".95em")
    .attr("transform", "rotate(-65)");

  const focus = svg
    .append("g")
    .attr("class", "focus")
    .style("display", "none");

  function renderTooltip(x, y) {
    const toolTipWidth = 200;
    const toolTipHeight = 50;
    const staticPosition = { x: 10, y: -22 };
    const marginItems = { textY: 42, textX: 10, tooltipX: 10, tooltipY: 12 };
    const isResolveTopPosition = toolTipHeight + marginItems.tooltipY > y;
    const resolveBottomPosition =
      y + toolTipHeight > overlayHeight
        ? -(toolTipHeight + marginItems.tooltipY)
        : staticPosition.y;
    const posX =
      x + toolTipWidth > width
        ? -(toolTipWidth + marginItems.tooltipX)
        : staticPosition.x;
    const posY = isResolveTopPosition ? 0 : resolveBottomPosition;

    focus
      .append("rect")
      .attr("class", "tooltip")
      .attr("width", toolTipWidth)
      .attr("height", toolTipHeight)
      .attr("x", posX)
      .attr("y", posY)
      .attr("rx", 4)
      .attr("ry", 4);
    focus
      .append("circle")
      .attr("r", 5)
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("fill", "white");

    focus
      .append("text")
      .attr("class", "tooltip-temperature")
      .attr("x", posX + marginItems.textX)
      .attr("y", posY + marginItems.textY / 2);

    focus
      .append("text")
      .attr("x", posX + marginItems.textX)
      .attr("y", posY);



    focus
      .append("text")
      .attr("class", "tooltip-date")
      .attr("x", posX + marginItems.textX)
      .attr("y", posY + marginItems.textY);
  }

  function removeOldTooltips() {
    focus.selectAll("*").remove();
  }

  function mousemove() {
    const [x] = d3.mouse(this);
    const previousValue = xScale.invert(x);
    const index = bisectDate(lineCoordinates, previousValue); // index of Data cell in array
    const posX = xScale(lineCoordinates[index].x);
    const posY = yScale(lineCoordinates[index].y);
    const format = d3.timeFormat("%H:%M - %d %B, %Y");

    focus.attr("transform", `translate(${posX}, ${posY})`);
    focus.selectAll(".tooltip").remove();
    removeOldTooltips();
    renderTooltip(posX, posY);
    focus
      .select(".tooltip-temperature")
      .text(`${lineCoordinates[index].y}, \xB0C`);
    focus.select(".tooltip-date").text(format(lineCoordinates[index].x));
  }

  svg
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width + margin.right)
    .attr("height", height + 80)
    .on("mouseover", () => {
      focus.style("display", null);
    })
    .on("mouseout", () => {
      focus.style("display", "none");
    })
    .on("mousemove", mousemove);

  // add styles for grid
  svg.selectAll(".grid line").style("opacity", 0.2);
}
