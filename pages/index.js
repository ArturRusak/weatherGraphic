import React, { useEffect } from "react";
import * as d3 from "d3";
import css from "styled-jsx/css";
import fetch from "isomorphic-unfetch";

import Header from "../components/Header";
import Footer from "../components/Footer";

const styles = css`
  .content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: #dadada;
    justify-items: center;
    align-items: center;
  }
  .content-item.graph {
    grid-column-start: span 2;
    padding: 1em;
  }
`;

export default function Home(props) {
  useEffect(() => {
    const { data, error } = props;
    let dateMarkers = {
      date: [],
      time: []
    };
    if (data) {
      data.hourly.data.map(item => {
        const timeInSeconds = item.time * 1000;
        const date = new Date(timeInSeconds);

        item.time = date;
        dateMarkers.date.push(item.time);
        dateMarkers.time.push(date.getHours());
      });
    }

    console.log(data, "----");
    console.log(dateMarkers.date, "----");
    const margin = { top: 10, right: 30, bottom: 90, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([d3.min(dateMarkers.time), d3.max(dateMarkers.time)])
      .range([400, 0]);

    const bottom = d3
      .scaleTime()
      .domain([
        dateMarkers.date[0],
        dateMarkers.date[dateMarkers.date.length - 1]
      ])
      .range([0, 960]);

    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("g")
      // eslint-disable-next-line no-undef
      .attr("transform", `translate(0, 400)`)
      .call(d3.axisBottom(bottom).ticks(40));
  }, []);

  return (
    <div>
      <Header />
      <div className="content">
        <div className="content-item">
          <h1>Hello World !!!!!</h1>
        </div>
        <div className="content-item">
          <span>RIGHT</span>
        </div>
        <div className="content-item graph">
          <span>Graph1</span>
        </div>
      </div>
      <Footer />
      <style jsx>{styles}</style>
    </div>
  );
}

Home.getInitialProps = async function() {
  // eslint-disable-next-line no-undef
  const response = await (() =>
    fetch(
      "https://api.darksky.net/forecast/177ed2d5a571643fc368b4f16acc1802/53.54,27.30?lang=ru&exclude=flags,alerts"
    )
      .then(res => res.json())
      .then(data => {
        return { data };
      })
      .catch(error => {
        return { error };
      }))();
  return response;
};
