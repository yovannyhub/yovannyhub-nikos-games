import { useEffect, useRef, useState } from "react";
import type { Settings } from "../game/types";

const ANIMALS = [
  { name: "pig", emoji: "🐷" }, { name: "cow", emoji: "🐮" },
  { name: "chick", emoji: "🐥" }, { name: "horse", emoji: "🐴" },
  { name: "sheep", emoji: "🐑" }, { name: "rabbit", emoji: "🐰" },
  { name: "duck", emoji: "🦆" }, { name: "puppy", emoji: "🐶" },
];
const TARGETS = [0,1,2,3,4,5,6,7,0,1];
function FarmScenery() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <svg className="absolute h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="farmSky" x2="0" y2="1"><stop stopColor="#7fd1fc"/><stop offset=".7" stopColor="#d4f3ff"/><stop offset="1" stopColor="#f4edb6"/></linearGradient></defs>
      <rect width="1200" height="800" fill="url(#farmSky)"/>
      <circle cx="1040" cy="115" r="75" fill="#ffe28c"/>
      {[130,490,810].map((x,i)=><g key={x} transform={`translate(${x} ${105+i*45})`} fill="#fff" opacity=".9"><ellipse cx="0" cy="0" rx="85" ry="28"/><circle cx="-34" cy="-18" r="32"/><circle cx="26" cy="-27" r="40"/></g>)}
      <path d="M0 500Q250 385 520 500T1200 465V800H0Z" fill="#98d67e"/>
      <path d="M0 620Q320 510 700 610T1200 550V800H0Z" fill="#60b967"/>
      <g transform="translate(875 375)"><path d="M-135 0L0 -120L135 0V220H-135Z" fill="#e75e54"/><path d="M-160 0L0 -140L160 0" stroke="#7c443c" strokeWidth="25" fill="none" strokeLinejoin="round"/><rect x="-45" y="65" width="90" height="155" rx="8" fill="#ffe8c6"/><path d="M-45 65L45 220M45 65L-45 220" stroke="#bd6656" strokeWidth="12"/><rect x="-95" y="25" width="50" height="45" fill="#c8edff" stroke="#fff0dc" strokeWidth="9"/></g>
      {[70,230,395,560,1090].map((x,i)=><g key={x} transform={`translate(${x} ${595+(i%2)*35})`}><rect x="-8" y="-100" width="16" height="100" fill="#996c42"/><circle cx="0" cy="-118" r="56" fill="#4ba65a"/><circle cx="-28" cy="-135" r="40" fill="#68bd65"/></g>)}
      <path d="M0 705H1200" stroke="#f5e1af" strokeWidth="12"/>
      {[50,170,290,410,530,650,770,890,1010,1130].map(x=><path key={x} d={`M${x} 680V775`} stroke="#f5e1af" strokeWidth="13" strokeLinecap="round"/>)}
      {Array.from({length:28},(_,i)=><g key={i} transform={`translate(${(i*173)%1200} ${650+(i*41)%145})`}><path d="M0 0V18" stroke="#317c43" strokeWidth="3"/><circle r="6" fill={i%2?"#fff3a0":"#ffd3e5"}/></g>)}
    </svg>
    <span className="absolute bottom-[12%] left-[5%] text-5xl">🐷</span>
    <span className="absolute bottom-[13%] right-[6%] text-5xl">🐮</span>
  </div>;
}


export function FarmMemoryWorld({settings,onFinish,onHome,onHearLaury,onInteract,onFinalAnswer}:{
  settings:Settings;onFinish:(score:number)=>void;onHome:()=>void;onHearLaury:()=>void;onInteract:()=>void;onFinalAnswer:()=>void;
}) {
  const [round,setRound]=useState(0);
  const [busy,setBusy]=useState(false);
  const [caught,setCaught]=useState<number|null>(null);
  const [feedback,setFeedback]=useState("");
  const [confirmExit,setConfirmExit]=useState(false);
  const timer=useRef<number|null>(null);
  useEffect(()=>()=>{if(timer.current!==null)window.clearTimeout(timer.current);},[]);
  const target=TARGETS[round];
  const otherIndices=ANIMALS.map((_,i)=>i).filter(i=>i!==target);
  const count=round<3?2:3;
  const selected=[target,...Array.from({length:count-1},(_,i)=>otherIndices[(round*2+i)%otherIndices.length])];
  const choices=round%3===0?selected:round%3===1?[...selected].reverse():[selected[1],selected[0],...(selected[2]===undefined?[]:[selected[2]])];
  function choose(index:number){
    onInteract();
    if(busy)return;
    if(index!==target){setFeedback("Try again! Find the "+ANIMALS[target].name+".");return;}
    setBusy(true);
    setCaught(index);
    setFeedback("You caught the "+ANIMALS[target].name+"! ⭐");
    if(round===TARGETS.length-1)onFinalAnswer();
    timer.current=window.setTimeout(()=>{
      if(round===TARGETS.length-1)onFinish(1000);
      else {setRound(r=>r+1);setBusy(false);setCaught(null);setFeedback("");}
    },round===TARGETS.length-1?3500:settings.calm?700:1100);
  }
  return <div className="absolute inset-0 z-20 overflow-hidden text-center text-[#332850]">
    <style>{`
      @keyframes farmFloatDown {
        0% {transform:translate3d(0,-15vh,0) rotate(-5deg)}
        50% {transform:translate3d(0,23vh,0) rotate(5deg)}
        100% {transform:translate3d(0,59vh,0) rotate(-5deg)}
      }
      @keyframes farmCatchPop {
        0% {transform:scale(1);opacity:1}
        50% {transform:scale(1.3);opacity:1}
        100% {transform:scale(.4);opacity:0}
      }
      @media (prefers-reduced-motion:reduce) {
        .farm-float {animation:none!important;transform:translate3d(0,23vh,0)!important}
      }
    `}</style>
    <FarmScenery/>
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center gap-2 px-3 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between gap-2">
        <button type="button" className="min-h-12 rounded-full bg-white/95 px-3 text-sm font-bold shadow-lg" onClick={()=>confirmExit?onHome():setConfirmExit(true)}>{confirmExit?"Tap again to exit":"🏠 Home"}</button>
        <span className="rounded-full bg-white/95 px-3 py-2 text-sm font-extrabold shadow-lg">🐷 Happy Farm · {round+1}/10</span>
        <button type="button" className="min-h-12 rounded-full bg-[#7750f7] px-3 text-sm font-bold text-white shadow-lg" onClick={onHearLaury}>🔊 Laury</button>
      </div>
      <div className="rounded-3xl border-2 border-white bg-white/95 px-5 py-3 shadow-xl">
        <h2 className="text-lg font-black sm:text-2xl">Catch the {ANIMALS[target].name}! {ANIMALS[target].emoji}</h2>
        <p className="text-xs font-semibold sm:text-sm">Tap the right animal as it floats down</p>
      </div>
    </div>
    <div key={round} className="absolute inset-x-0 top-[23%] bottom-[16%] z-10 mx-auto w-full max-w-5xl">
      {choices.map((index,i)=>{
        const positions=count===2?[25,75]:[17,50,83];
        const left=positions[i];
        const isCaught=caught===index;
        return <button key={index} type="button" disabled={busy} onClick={()=>choose(index)}
          aria-label={"Catch "+ANIMALS[index].name}
          className="farm-float absolute top-0 flex h-20 w-20 touch-manipulation items-center justify-center rounded-full bg-transparent text-6xl drop-shadow-[0_5px_4px_rgba(0,0,0,0.35)] sm:h-28 sm:w-28 sm:text-8xl"
          style={{
            left:`calc(${left}% - 2.5rem)`,
            animation:isCaught?"farmCatchPop .65s ease-out forwards":settings.calm||settings.slow?"none":`farmFloatDown ${settings.slow?14:11}s linear ${-i*1.3}s infinite`,
            transform:settings.calm||settings.slow?"translate3d(0,23vh,0)":undefined,
          }}>
          {ANIMALS[index].emoji}
          {isCaught&&<span className="absolute -right-3 -top-4 text-4xl" aria-hidden="true">⭐</span>}
        </button>;
      })}
    </div>
    <div className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 flex flex-col items-center gap-2 px-3">
      <div role="status" aria-live="polite" className="min-h-10 rounded-full bg-white/95 px-5 py-2 text-sm font-extrabold shadow-lg sm:text-base">{feedback||"Take your time. No timer or lost lives!"}</div>
      <div className="flex flex-wrap justify-center gap-1 rounded-full bg-white/95 px-4 py-2 shadow-lg" aria-label={round+" of ten animals caught"}>
        {Array.from({length:10},(_,i)=><span key={i} className="text-xl sm:text-2xl" aria-hidden="true">{i<round||(busy&&i===round)?"⭐":"☆"}</span>)}
      </div>
    </div>
  </div>;
}
