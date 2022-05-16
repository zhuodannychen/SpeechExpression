import React, { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home'

const { PUBLIC_URL } = process.env

// Timer source: https://dev.to/gspteck/create-a-stopwatch-in-javascript-2mak

// const timerElement = document.getElementById('stopwatch');
var hr, min, sec = 0;
//var timerText = "00:00:00"
var blankTime = "00:00:00"
// var timerOff = true;
// var time = new Date();  // for possible later changes

function Timer() {
    const [isTiming, timerisTiming] = useState(false)
    const [timerText, setTimerText] = useState(null)
    useEffect(() => {handleTiming();}, [isTiming]);
    const handleTimerCount = newVal => {timerisTiming(newVal);}

    // const [isBlank, timerIsBlank] = useState(true)
    // useEffect(() => {handleBlanking()}, [isBlank])
    // const handleTimerReset = newVal => {timerIsBlank(newVal);}

    const handleTiming = () => {
        if (isTiming) {
			// find current time values
            sec = parseInt(sec);
            min = parseInt(min);
            hr = parseInt(hr);
            // increment seconds by 1, then update time values
            sec = sec + 1;
            // if sec or min == 60, update next highest time val & wipe lower ones 
            if (sec == 60) {
                min = min + 1;
                sec = 0;
            }
            if (min == 60) {
                hr = hr + 1;
                min = 0;
                sec = 0;
            }
            // make time variables strings in "0#" format
            sec = '0' + sec;
            min = '0' + min;
            hr = '0' + hr;
            // wait for incremented second to pass; update timer display
            setTimeout("Timer()", 1000);
            const modTimerText = new String("Change");//new String(hr.slice(-2) + ':' + min.slice(-2) + ':' + sec.slice(-2));
            setTimerText(modTimerText);
        }
        // const handleBlanking = () => {
        //     if (isBlanking) {
        //         timerText = blankTime;
        //     }
        // }
    }
    return (
        <div className="Timer">
            <BrowserRouter basename={PUBLIC_URL}>
                <Routes>
                    <Route path="/" element={<Home timerText={timerText} isTiming={isTiming} handleTimerCount={handleTimerCount}/>} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default Timer;

/*
function resetTimer() {
    // stops timer, resets time variables, & resets timer display
    isTiming = false;
    hr, sec, min = 0;
    timer.innerHTML = "00:00:00";
}

    // if timer is NOT stopped...
    while (isTiming == true) {
        // find current time values
        sec = parseInt(sec);
        min = parseInt(min);
        hr = parseInt(hr);
        // increment seconds by 1, then update time values
        sec = sec + 1;
        // if sec or min == 60, update next highest time val & wipe lower ones 
        if (sec == 60) {
            min = min + 1;
            sec = 0;
        }
        if (min == 60) {
            hr = hr + 1;
            min = 0;
            sec = 0;
        }
        // make time variables strings in "0#" format
        sec = '0' + sec;
        min = '0' + min;
        hr = '0' + hr;
        // wait for incremented second to pass; update timer display
        setTimeout("timerCycle()", 1000);
        timer.innerHTML = hr.slice(-2) + ':' + min.slice(-2) + ':' + sec.slice(-2);
    }
}

function startTimer() {
    // starts/restarts timer, does nothing if timer is on
    if (isTiming == false) {
        timerOff = true;
        timerCycle();
    }
}

function stopTimer() {
    // stops timer, does nothing if timer is off
    if (isTiming == true) {
        isTiming = false;
    }
}
*/