import * as d3 from "d3";
import Skycons from "./Skycons";

function convertFahrenheit(fTemp) {
  const t = ((fTemp - 32) * 5) / 9;
  return Number(t.toFixed(1));
}

export default function weaterChart(data) {
  const skycons = new Skycons({ color: "#b9d1ff" });
  const { hourly } = data;
  const margin = { top: 10, right: 30, bottom: 120, left: 40 };
  const width = 960 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;
  const overlayHeight = 400;

  let dataMarkers = {
    date: [],
    temperature: [],
    icon: [],
    description: []
  };

  hourly.data.map(item => {
    const timeInSeconds = item.time * 1000;
    const date = new Date(timeInSeconds);

    dataMarkers.date.push(date);
    dataMarkers.temperature.push(convertFahrenheit(item.temperature));
    dataMarkers.icon.push(item.icon.toUpperCase().replace(/[-]/g, "_"));
    dataMarkers.description.push(item.summary);
  });

  // Add Y axis
  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(dataMarkers.temperature) * 1.1,
      d3.max(dataMarkers.temperature) * 1.1
    ])
    .range([overlayHeight, 0]);

  const xScale = d3.scaleTime().range([0, 960]);
  xScale.domain(d3.extent(dataMarkers.date));

  // 7. d3's line generator
  const line = d3
    .line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

  const lineCoordinates = dataMarkers.date.map((item, i) => ({
    x: item,
    y: dataMarkers.temperature[i]
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

  function getDateRange() {
    const format = d3.timeFormat("%e %b");
    const [start, end] = d3.extent(dataMarkers.date);
    return ` ${format(start)} - ${format(end)}`;
  }

  function renderIcon(indexDataItem) {
    const { icon } = dataMarkers;
    d3.select("#graphic")
      .append("canvas")
      .attr("id", "icon")
      .attr("class", "icon")
      .attr("width", "100")
      .attr("height", "100");

    skycons.add("icon", Skycons[icon[indexDataItem]]);
    skycons.play();
  }

  function removeOldElements() {
    focus.selectAll("*").remove();
    d3.select("#icon").remove();
  }


  function mousemove() {
    const [x] = d3.mouse(this);
    const previousValue = xScale.invert(x);
    const indexOfDataItem = bisectDate(lineCoordinates, previousValue); // index of Data cell in array
    const posX = xScale(lineCoordinates[indexOfDataItem].x);
    const posY = yScale(lineCoordinates[indexOfDataItem].y);
    const format = d3.timeFormat("%H:%M - %d %B, %Y");

    focus.attr("transform", `translate(${posX}, ${posY})`);
    focus.selectAll(".tooltip").remove();
    removeOldElements(); // TODO improve removing/hide of elements
    renderTooltip(posX, posY);
    renderIcon(indexOfDataItem);
    focus
      .select(".tooltip-temperature")
      .text(
        `${lineCoordinates[indexOfDataItem].y}, \xB0C, ${dataMarkers.description[indexOfDataItem]}`
      );
    focus
      .select(".tooltip-date")
      .text(format(lineCoordinates[indexOfDataItem].x));
  }


  d3.select("#graphic")
    .append("p")
    .attr("style", "font-size: 1.2em;text-align: center")
    .text(data.timezone.split("/")[1])
    .append("span")
    .text(getDateRange());
  // append the svg object to the body of the page

  const svg = d3
    .select("#graphic")
    .append("svg")
    .attr("id", "test")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

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
    const toolTipWidth = 250;
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
      d3.select("#icon").style("display", "none");
    })
    .on("mousemove", mousemove);

  // add styles for grid
  svg.selectAll(".grid line").style("opacity", 0.2);
}
