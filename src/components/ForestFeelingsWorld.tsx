import { useEffect, useRef, useState } from "react";
import type { Settings } from "../game/types";

const FEELINGS = [
  {name:"happy",face:"😊"}, {name:"sad",face:"😢"}, {name:"surprised",face:"😮"},
  {name:"angry",face:"😠"}, {name:"calm",face:"😌"}, {name:"excited",face:"🤩"},
  {name:"sleepy",face:"😴"}, {name:"worried",face:"😟"}
];
const TARGETS=[0,1,2,3,4,5,6,7,0,4];

function ForestScenery(){
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <svg className="absolute h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="feelingsForestSky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a2dff0"/><stop offset=".65" stopColor="#e7f4c2"/><stop offset="1" stopColor="#8dcf89"/></linearGradient></defs>
      <rect width="1200" height="800" fill="url(#feelingsForestSky)"/>
      <circle cx="990" cy="115" r="68" fill="#fff0a5" opacity=".9"/>
      <path d="M0 490Q270 375 560 475T1200 420V800H0Z" fill="#91c985"/>
      <path d="M0 630Q280 520 610 610T1200 545V800H0Z" fill="#5aab72"/>
      {[55,185,325,940,1090,1190].map((x,i)=><g key={x} transform={`translate(${x} ${585+(i%3)*25})`}>
        <rect x="-18" y="-215" width="36" height="250" rx="10" fill="#886346"/>
        <ellipse cx="0" cy="-230" rx="100" ry="125" fill={i%2?"#397c61":"#4a9567"}/>
        <ellipse cx="-35" cy="-280" rx="64" ry="77" fill="#65ae77" opacity=".9"/>
        <ellipse cx="35" cy="-205" rx="65" ry="85" fill="#69b780" opacity=".85"/>
      </g>)}
      <path d="M0 735Q270 690 490 735T1200 705V800H0Z" fill="#438f5f"/>
      {Array.from({length:25},(_,i)=><g key={i} transform={`translate(${(i*173+47)%1200} ${665+(i*43)%130})`}><path d="M0 0V15" stroke="#377e4d" strokeWidth="3"/><circle r="6" fill={i%3===0?"#ffce75":i%3===1?"#f5b4d5":"#fff3d3"}/></g>)}
    </svg>
    <span className="absolute bottom-[13%] left-[5%] text-5xl">🦊</span>
    <span className="absolute bottom-[14%] right-[6%] text-5xl">🦋</span>
  </div>;
}

export function ForestFeelingsWorld({settings,onFinish,onHome,onHearLaury,onInteract,onFinalAnswer}:{
  settings:Settings;onFinish:(score:number)=>void;onHome:()=>void;onHearLaury:()=>void;onInteract:()=>void;onFinalAnswer:()=>void;
}){
  const [round,setRound]=useState(0);
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState("");
  const [confirmExit,setConfirmExit]=useState(false);
  const timer=useRef<number|null>(null);
  useEffect(()=>()=>{if(timer.current!==null)window.clearTimeout(timer.current);},[]);
  const target=TARGETS[round];
  const others=FEELINGS.map((_,i)=>i).filter(i=>i!==target);
  const options=[target,others[(round*2)%others.length],others[(round*2+1)%others.length]];
  const ordered=round%3===0?options:round%3===1?[options[1],options[0],options[2]]:[options[2],options[1],options[0]];
  function choose(index:number){
    onInteract();
    if(busy)return;
    if(index!==target){setFeedback("Good try! Find the "+FEELINGS[target].name+" face.");return;}
    setBusy(true);
    setFeedback("Wonderful! That's the "+FEELINGS[target].name+" face! ⭐");
    if(round===TARGETS.length-1)onFinalAnswer();
    timer.current=window.setTimeout(()=>{
      if(round===TARGETS.length-1)onFinish(1000);
      else {setRound(r=>r+1);setBusy(false);setFeedback("");}
    },round===TARGETS.length-1?3500:settings.calm?450:800);
  }
  return <div className="absolute inset-0 z-20 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-center text-[#3b2f4a]">
    <ForestScenery/>
    <div className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-3 py-2">
      <div className="flex w-full items-center justify-between gap-2">
        <button type="button" className="min-h-12 rounded-full bg-white px-3 font-bold" onClick={()=>confirmExit?onHome():setConfirmExit(true)}>{confirmExit?"Tap again to exit":"🏠 Home"}</button>
        <span className="rounded-full bg-white px-3 py-2 text-sm font-bold">🦊 Forest · {round+1}/10</span>
        <button type="button" className="min-h-12 rounded-full bg-[#7750f7] px-3 font-bold text-white" onClick={onHearLaury}>🔊 Laury</button>
      </div>
      <div className="w-full rounded-[2rem] border-4 border-white bg-white/95 p-4 shadow-lg sm:p-7">
        <div className="text-5xl" aria-hidden="true">{FEELINGS[target].face}</div>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-4xl">Feelings & Faces!</h2>
        <p className="mt-2 text-xl font-extrabold text-[#6c43aa]">Which face looks {FEELINGS[target].name}?</p>
        <p className="mt-1 text-sm font-semibold">Tap the matching feeling.</p>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-5">
          {ordered.map(index=><button key={index} type="button" disabled={busy} onClick={()=>choose(index)} aria-label={FEELINGS[index].name+" face"} className="flex min-h-28 touch-manipulation items-center justify-center rounded-3xl border-4 border-white bg-[#f1edff] p-2 text-5xl shadow-md sm:min-h-40 sm:text-7xl">{FEELINGS[index].face}</button>)}
        </div>
        <p role="status" aria-live="polite" className="mt-4 min-h-8 text-base font-bold text-[#5d4787]">{feedback||"Look carefully. There is no timer!"}</p>
        <div className="mt-2 flex justify-center gap-1" aria-label={round+" of ten feelings found"}>{Array.from({length:10},(_,i)=><span key={i} className="text-lg sm:text-2xl" aria-hidden="true">{i<round||(busy&&i===round)?"⭐":"☆"}</span>)}</div>
      </div>
      <p className="text-sm font-bold text-white">Every feeling is okay. Let's learn together!</p>
    </div>
  </div>;
}
