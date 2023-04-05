import React from "react"
import { ReactDOM } from "react";

export const Greeting = () => {
    var myDate = new Date();
    var hours= myDate.getHours();
    var greet;

    if (hours < 12)
        greet =  "morning";
    else if (hours >= 12 && hours <= 17)
        greet = "afternoon";
    else if (hours >= 17 && hours <= 24)
        greet = "evening";

    return <h1 className="mb-5 text-5xl md:text-8xl font-bold">Good {greet}!</h1>
}