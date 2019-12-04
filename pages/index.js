import React, { useEffect, useState } from "react";
import weaterChart from "../static/js/weatherGraph";
import "../static/home/styles.css";
import fetch from "isomorphic-unfetch";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home(props) {
  const [isCelsius, setSsCelsius] = useState(true);
  useEffect(() => {
    if (!props.data) {
      return;
    }
    weaterChart(props.data);
  }, []);

  const changeTemp = () => {
    setSsCelsius(prevState => !prevState);
  };

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
      <div className="graphic" id="graphic">
        <button name="changeTemp" type="button" onClick={changeTemp}>
          change to {isCelsius ? "F" : "C"}
        </button>
        <canvas className="icon" id="icon" width="100" height="100"/>
      </div>
      <Footer />
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
