import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Line, Scatter } from 'react-chartjs-2'
import SpokeWord from '../structure/SpokeWord';
import '../App.css'
import wcLogo from './woodchuckLogo.png';

// chart.js config
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    } from 'chart.js'
    
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)


const fillerWords = ["like", "okay", "right", "you know", "ah", "so", "basically", "soup for dinner is yummy", "canned goods for lunch is yummy"]
const blacklist = ["i", "me", "you", "and", "a", "an", "but", "because", "so", "the", "of", "to"]

let recommendations = []
var stringSimilarity = require("string-similarity");

function swapTheme(theme) {
    if (theme =='light') {
        document.documentElement.style.setProperty('--bg', 'white');
        document.documentElement.style.setProperty('--text', 'black');
        document.documentElement.style.setProperty('--bg-nav', 'rgb(167, 165, 165)');
        document.documentElement.style.setProperty('--text-nav', 'white');
        document.documentElement.style.setProperty('--bttn-nav', 'rgb(82, 82, 82)');
    } else {
        document.documentElement.style.setProperty('--bg', 'rgb(68,68,68)');
        document.documentElement.style.setProperty('--text', 'white');
        document.documentElement.style.setProperty('--bg-nav', 'rgb(175,175,175)');
        document.documentElement.style.setProperty('--text-nav', 'black');
        document.documentElement.style.setProperty('--bttn-nav', 'rgb(211,211,211)');
    }
}

function Summary(props) {
    // console.log(props.spokenWords)
    const [sumFillWords, setSumFillWords] = useState(null)
	const [sumRepWords, setSumRepWords] = useState(null)
	const [sumRepPhrases, setSumRepPhrases] = useState(null)

	const [transcription, setTranscription] = useState(null)
	const [script, setScript] = useState(null)
	const [scriptScore, setScriptScore] = useState(null)

    const [xTime, setXTime] = useState([])
    const [ySpeed, setYSpeed] = useState([])
    const [colorState, setColorState] = useState(0)
	
	const [recomm, setRecomm] = useState([]);

    useEffect(() => {
		//setRecomm([]);
        if (props.spokenWords.length > 0) {
            genGraphData();
            genDetailsAsString();
            changeTranscriptionMode();
            finalizeRecommendations();
        }
    }, [props.isListening])

	useEffect(() => {
        changeTranscriptionMode();
    }, [colorState])
	
	const changeTranscriptionMode = () => {
		let t = props.spokenWords.map(sw => <span>{sw.getWord(colorState, props.colorblindMode)} </span>);
		setTranscription(t);
	}

    const genDetailsAsString = () => {
        let detFillWords = []
        let detRepWords = []
        let detRepPhrases = []
        
        let results1 = SpokeWord.getCommonFillWords(props.spokenWords, fillerWords);
        for (let i = 0; i < results1.length; ++i)
            detFillWords.push(results1[i][0] + ": " + results1[i][1])
        
        let results2 = SpokeWord.getCommonPhrases(props.spokenWords, blacklist);
        for (let i = 0; i < results2[0].length; ++i)
            detRepWords.push(results2[0][i][0] + ": " + results2[0][i][1]);
        for (let i = 0; i < results2[1].length; ++i)
            detRepPhrases.push(results2[1][i][0] + ": " + results2[1][i][1])
        
        const detFillWordsHTML = detFillWords.map(sw => <h6>{sw} </h6>)
        const detRepWordsHTML = detRepWords.map(sw => <h6>{sw} </h6>)
        const detRepPhrasesHTML = detRepPhrases.map(sw => <h6>{sw} </h6>)
		let processedScript = SpokeWord.processScript(props.script);
        console.log("hi", props.spokenWords[0])
		let rawTranscription = props.spokenWords[0].getWord(-1, props.colorblindMode);
		for (let i = 1; i < props.spokenWords.length; ++i)
			rawTranscription += " " + props.spokenWords[i].getWord(-1, props.colorblindMode);

        setSumFillWords(detFillWordsHTML);
        setSumRepWords(detRepWordsHTML);
        setSumRepPhrases(detRepPhrasesHTML);
		setScript(SpokeWord.highlightSimilar(props.spokenWords, processedScript[1], props.colorblindMode));
		if (processedScript[0] == "")
			setScriptScore("");
		else {
			let accuracy = parseInt(100 * stringSimilarity.compareTwoStrings(processedScript[0], rawTranscription));
			setScriptScore("Transcription Accuracy: " + accuracy + "%");
			if (accuracy < 65)
				recomm.push(<h6>Your transcription did not match your speech very well!  Perhaps you didn't stick to the script or poorly pronounced some words?</h6>);
			else
				recomm.push(<h6>You matched the transcription well!  For furhter practice, try reciting the script with the "Show Script" toggled off.</h6>);
				
		}
		
		let len = props.spokenWords.length;
		let fillCount = 0;
		for (let i = 0; i < len; ++i)
			if (props.spokenWords[i].getIsFiller())
				fillCount++;
		
		if (fillCount * 20 >= len)
			recomm.push(<h6>Your speech contained a huge amount of filler words!  Try our beeping feature to help you catch and correct this.</h6>);
		else if (fillCount * 35 >= len)
			recomm.push(<h6>Your speech contained a large amount of filler words!  Try our beeping feature to help you catch this.</h6>);
		
		let var1 = results2[0].length > 0 ? results2[0][0][1] : 0;
		let var2 = results2[1].length > 0 ? results2[1][0][1] * ((results2[1][0][0]).split(" ").length) : 0;
		
		if (var1 * 20 >= len)
			recomm.push(<h6>You used the word "{results2[0][0][0]}" a lot!  If this isn't intentional, is there an alternative you could use?</h6>);
		if (var2 * 30 >= len)
			recomm.push(<h6>You used the phrase "{results2[1][0][0]}" a lot!  If this isn't intentional, is there an alternative you could use?</h6>);
		
    }
	
	const genGraphData = () => {
		let rawStamps1 = [];
		let pauses = [0, 0];
		for (let i = 0; i < props.spokenWords.length-1; ++i) {
			// let xval = (props.spokenWords[i].timeStamp - props.spokenWords[0].timeStamp) / 1000.0;
			let dtimeraw = props.spokenWords[i+1].timeStamp - props.spokenWords[i].timeStamp;
			//let dtime = 60.0 / (dtimeraw/1000.0);
			if (dtimeraw >= 4000) {
				if (i > 0)
					pauses[1]++;
				rawStamps1.push(-1);
			}
			else {
				rawStamps1.push(props.spokenWords[i].timeStamp);
				if (dtimeraw >= 2000 && i > 0)
					pauses[0]++;
			}
		}
		
		// wpmState.labels = [];
		// wpmState.datasets[0].data = [];
        let XTime = [];
        let YSpeed= [];
		let extremeCnt = [0, 0, 0];
		
		for (let i = 0; i < rawStamps1.length; ++i) {
			if (rawStamps1[i] === -1)
				continue;
			let j = i;
			while (j < rawStamps1.length && j < i + 6 && rawStamps1[j] !== -1)
				j++;
			j--;
			if (j-i < 5)
				continue;
			let dt = rawStamps1[j] - rawStamps1[i];
			if (dt === 0)
				continue;

			dt = 60.0 / (dt/((j-i)*1000.0));

			if (dt >= 300)
				dt = 300;
			
			XTime.push((rawStamps1[i] - rawStamps1[0]) / 1000.0);
			YSpeed.push(dt);
			
			if (dt >= 190)
				extremeCnt[1]++;
			else if (dt <= 100)
				extremeCnt[0]++;
			extremeCnt[2]++;
		}
		
		let groups = [[], [], false, false];
		// set word speed data for each word using linear interpolation
		if (XTime.length > 1 && rawStamps1.length > 0) {
			let li = 0;
			for (let wi = 0; wi < props.spokenWords.length; ++wi) {
				let modStamp = (props.spokenWords[wi].timeStamp - rawStamps1[0]) / 1000.0;
				while (li < XTime.length-2 && modStamp > XTime[li+1])
					li++;
				if (modStamp < XTime[li])
					props.spokenWords[wi].setWordSpeed(YSpeed[li]);
				else if (modStamp > XTime[li+1])
					props.spokenWords[wi].setWordSpeed(YSpeed[li+1]);
				else {
					let perc = (modStamp - XTime[li]) / (XTime[li+1] - XTime[li]);
					props.spokenWords[wi].setWordSpeed(YSpeed[li] + perc * (YSpeed[li+1] - YSpeed[li]));
				}
				
				let tooFast = props.spokenWords[wi].getSpeed() > 190;
				let tooSlow = props.spokenWords[wi].getSpeed() < 100;
				
				if (tooFast) {
					for (let wj = wi-1; wj >= 0 && wj >= wi-7; wj--)
						if (groups[1][wj] > groups[1][wi])
							groups[1][wi] = groups[1][wj];
					groups[1][wi]++;
					if (groups[1][wi] >= 20)
						groups[3] = true;
				}
				else if (tooSlow) {
					for (let wj = wi-1; wj >= 0 && wj >= wi-7; wj--)
						if (groups[0][wj] > groups[0][wi])
							groups[0][wi] = groups[0][wj];
					groups[0][wi]++;
					if (groups[0][wi] >= 10)
						groups[2] = true;
				}
			}
		}
        setXTime(XTime)
        setYSpeed(YSpeed)
		
		let len = props.spokenWords.length;
		if (pauses[0] * 40 > len)
			recomm.push(<h6>You made a lot of short pauses during your speech.  Try to speak consistently!</h6>);
		if (pauses[1] * 100 > len)
			recomm.push(<h6>You made a lot of long pauses during your speech.  Try to speak more consistently!</h6>);
		if (groups[2])
			recomm.push(<h6>At some point in your speech, you talked very slowly (less than 100 wpm) for a while.  In general, try to stick around 130-160 words per minute!</h6>);
		if (groups[3])
			recomm.push(<h6>At some point in your speech, you talked very quickly (more than 190 wpm) for a while.  In general, try to stick around 130-160 words per minute!</h6>);
		if (extremeCnt[0] >= extremeCnt[2]*0.35)
			recomm.push(<h6>You consistently talked slowly (less than 100 wpm)!  Try to talk a little faster.</h6>);
		if (extremeCnt[1] >= extremeCnt[2]*0.35)
			recomm.push(<h6>You consistently talked quickly (more than 190 wpm)!  Try to talk a little slower.</h6>);
	}

    const handleScriptChange = () => {
        props.handleScriptChange("")
    }

	const finalizeRecommendations = () => {
		if (props.spokenWords.length < 40) {
			recomm.push(<h6>Your speech was short!  These recommendations may be a little flawed because of this.</h6>);
		}
		else {
			if (recomm.length <= 2)
				recomm.push(<h6>In general, your speech looks very good!  Maybe try giving it one more time with other options!</h6>);			
		}
	}

    return (
        <div className="container-fluid">
            <div className="navbar">
                <tr>
                    <td className="thin"><img className="App-logo" src={wcLogo} alt="Woodchuck Logo"></img></td>
                    <td><h1>Team 7 Speech Expression: Summary</h1></td>
                    <td className="thin"><Link to="/" style={{textDecoration: "none", color: "black"}}><button onClick={handleScriptChange}>Go Back</button></Link></td>
                </tr>
            </div>
            <table className='summary-table'>
                <tr>
                    <td className="col box" rowSpan={3}>
                        <h4>Script</h4>
                        {script}
                        
					    <h4>{scriptScore}</h4>
                    </td>
                    <td className='col box' rowSpan={3}>
                        <h4>Transcribed Speech</h4>
                        <p>{transcription}</p>
                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                            <label onClick={() => {setColorState(0)}} style={{background: colorState === 0 ? "#EE6055" : "gray"}} className="btn btn-secondary">
                                Filler
                            </label>
                            <label onClick={() => {setColorState(1)}} style={{background: colorState === 1 ? "#17BEBB" : "gray"}} className="btn btn-secondary">
                                Speed
                            </label>
                            <label onClick={() => {setColorState(2)}} style={{background: colorState === 2 ? "#FFD97D" : "gray"}} className="btn btn-secondary">
                                Script
                            </label>
                        </div>
                    </td>
                    <td className='col box thin'>
                        <h4>Duration</h4>
                        <h5>{props.time}</h5>
                    </td>
                </tr>
                <tr>
                    <td className='col box thin'>
                        <h4>Filler Word Frequency</h4>
                        <p>{sumFillWords}</p>
                    </td>
                </tr>
                <tr>
                    <td className='col box thin'>
                        <h4>Repeated Language</h4>
                        <p>{sumRepWords}</p>
                        <p>{sumRepPhrases}</p>
                    </td>
                </tr>
            </table>
            <div className='row'> {/* Start of wpm graph code */}
                <div className="col box" >
                    <Line
                        data={{
                            labels: xTime,
                            datasets: [
                                {
                                    label: 'Words per minute',
                                    showLine: true,
                                    fill: false,
                                    lineTension: 0.5,
                                    backgroundColor: 'rgba(75,192,192,1)',
                                    borderColor: 'rgba(0,0,0,1)',
                                    borderWidth: 2,
                                    data: ySpeed
                                }
                            ]
                        }}
                        height={"10%"}
                        options={{
                            title:{
                                display:true,
                                text:'Speech Speed',
                                fontSize:20
                            },
                            legend:{
                                display:true,
                                position:'right'
                            },
                            scales:{
                                xAxes: [{
                                    display: true,
                                    type: 'linear',
                                    position: 'bottom',
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'fpr',
                                        fontStyle: 'bold'
                                    },
                                    ticks: {
                                        autoSkip: true,
                                        //maxTicksLimit: 10,
                                        stepSize: 1
                                    }
                                }],
                            },
                            maintainAspectRatio: false
                        }}
                    />
                </div> {/* End of wpm graph code */}
            </div>
            <h1 style={{textAlign: "left", margin: "20px"}}>What to do next?</h1>
			<h6 style={{textAlign: "left", margin: "20px"}}>{recomm}</h6>
            <Link to="/" style={{textDecoration: "none", color: "black"}}><button onClick={handleScriptChange}>Practice Again!</button></Link>
            <div style={{marginBottom: "50px"}}></div>
        </div>
    )
}

export default Summary
