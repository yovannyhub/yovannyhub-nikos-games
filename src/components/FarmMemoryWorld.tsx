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
  const [feedback,setFeedback]=useState("");
  const [confirmExit,setConfirmExit]=useState(false);
  const timer=useRef<number|null>(null);
  useEffect(()=>()=>{if(timer.current!==null)window.clearTimeout(timer.current);},[]);
  const target=TARGETS[round];
  const distractors=ANIMALS.map((_,i)=>i).filter(i=>i!==target);
  const choices=[target,distractors[(round*2)%distractors.length],distractors[(round*2+1)%distractors.length]];
  const ordered=round%3===0?choices:round%3===1?[choices[1],choices[0],choices[2]]:[choices[2],choices[1],choices[0]];
  function choose(index:number){
    onInteract();
    if(busy)return;
    if(index!==target){setFeedback("Good try! Find the "+ANIMALS[target].name+".");return;}
    setBusy(true);
    setFeedback("Wonderful! That's the "+ANIMALS[target].name+"! ⭐");
    if(round===TARGETS.length-1)onFinalAnswer();
    timer.current=window.setTimeout(()=>{
      if(round===TARGETS.length-1)onFinish(1000);
      else {setRound(r=>r+1);setBusy(false);setFeedback("");}
    },round===TARGETS.length-1?3500:settings.calm?450:800);
  }
  return <div className="absolute inset-0 z-20 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-center text-[#3b2f4a]">
    <FarmScenery/>
    <div className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-3 py-2">
      <div className="flex w-full items-center justify-between gap-2">
        <button type="button" className="min-h-12 rounded-full bg-white px-3 font-bold" onClick={()=>confirmExit?onHome():setConfirmExit(true)}>{confirmExit?"Tap again to exit":"🏠 Home"}</button>
        <span className="rounded-full bg-white px-3 py-2 text-sm font-bold">🐷 Happy Farm · {round+1}/10</span>
        <button type="button" className="min-h-12 rounded-full bg-[#7750f7] px-3 font-bold text-white" onClick={onHearLaury}>🔊 Laury</button>
      </div>
      <div className="w-full rounded-[2rem] border-4 border-white bg-white/95 p-4 shadow-lg sm:p-7">
        <div className="text-4xl" aria-hidden="true">🐷 🐮 🐥</div>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-4xl">Farm Animal Friends!</h2>
        <p className="mt-2 text-xl font-extrabold text-[#6c43aa]">Which one is the {ANIMALS[target].name}?</p>
        <p className="mt-1 text-sm font-semibold">Tap the correct animal.</p>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-5">
          {ordered.map(index=><button key={index} type="button" disabled={busy} onClick={()=>choose(index)} aria-label={ANIMALS[index].name} className="flex min-h-28 touch-manipulation items-center justify-center rounded-3xl border-4 border-white bg-[#f1edff] p-2 text-5xl shadow-md sm:min-h-40 sm:text-7xl">{ANIMALS[index].emoji}</button>)}
        </div>
        <p role="status" aria-live="polite" className="mt-4 min-h-8 text-base font-bold text-[#5d4787]">{feedback||"Look carefully. There is no timer!"}</p>
        <div className="mt-2 flex justify-center gap-1" aria-label={round+" of ten animals found"}>{Array.from({length:10},(_,i)=><span key={i} className="text-lg sm:text-2xl" aria-hidden="true">{i<round||(busy&&i===round)?"⭐":"☆"}</span>)}</div>
      </div>
      <p className="text-sm font-bold text-white">Every farm friend is a new discovery!</p>
    </div>
  </div>;
}
