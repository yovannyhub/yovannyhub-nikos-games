import { useEffect, useRef, useState } from "react";
import type { Settings } from "../game/types";

const ANIMALS = [
  { name: "pig", emoji: "🐷" },
  { name: "cow", emoji: "🐮" },
  { name: "chick", emoji: "🐥" },
  { name: "horse", emoji: "🐴" },
  { name: "sheep", emoji: "🐑" },
  { name: "rabbit", emoji: "🐰" },
  { name: "duck", emoji: "🦆" },
  { name: "puppy", emoji: "🐶" },
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
  const [feedback,setFeedback]=useState("Tap the animal Laury asks you to catch!");
  const [confirmExit,setConfirmExit]=useState(false);
  const timer=useRef<number|null>(null);
  useEffect(()=>()=>{if(timer.current!==null)window.clearTimeout(timer.current);},[]);
  const target=TARGETS[round];
  const count=round<3?2:3;
  const others=ANIMALS.map((_,i)=>i).filter(i=>i!==target);
  const picked=[target,...others.slice(round%5,round%5+count-1)];
  const choices=round%3===0?picked:round%3===1?[...picked].reverse():[picked[1],picked[0],...(picked[2]===undefined?[]:[picked[2]])];
  function choose(index:number){
    onInteract();
    if(busy)return;
    if(index!==target){setFeedback("Good try! Look for the "+ANIMALS[target].name+".");return;}
    setBusy(true);
    setFeedback("You caught the "+ANIMALS[target].name+"! ⭐");
    if(round===TARGETS.length-1)onFinalAnswer();
    timer.current=window.setTimeout(()=>{
      if(round===TARGETS.length-1)onFinish(1000);
      else {setRound(r=>r+1);setBusy(false);setFeedback("Catch the "+ANIMALS[TARGETS[round+1]].name+"!");}
    },round===TARGETS.length-1?3500:settings.calm?600:1000);
  }
  return <div className="absolute inset-0 z-20 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-center text-[#3b2f4a]">
    <style>{`@keyframes niko-farm-fall { from { transform:translateY(-12px) } to { transform:translateY(145px) } } @media (prefers-reduced-motion:reduce){.niko-farm-falling{animation:none!important;transform:translateY(55px)!important}}`}</style>
    <FarmScenery/>
    <div className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-3 py-2">
      <div className="flex w-full items-center justify-between gap-2">
        <button type="button" className="min-h-12 rounded-full bg-white px-3 font-bold" onClick={()=>confirmExit?onHome():setConfirmExit(true)}>{confirmExit?"Tap again to exit":"🏠 Home"}</button>
        <span className="rounded-full bg-white px-3 py-2 text-sm font-bold">🐷 Happy Farm · {round+1}/10</span>
        <button type="button" className="min-h-12 rounded-full bg-[#7750f7] px-3 font-bold text-white" onClick={onHearLaury}>🔊 Laury</button>
      </div>
      <div className="w-full rounded-[2rem] border-4 border-white bg-white/95 p-3 shadow-lg sm:p-7">
        <h2 className="text-2xl font-extrabold sm:text-4xl">Catch the Animals!</h2>
        <p className="mt-2 text-xl font-extrabold text-[#6c43aa]" aria-live="polite">🐾 Catch the {ANIMALS[target].name}! {ANIMALS[target].emoji}</p>
        <p className="mt-1 text-sm font-semibold">Tap the right animal as it gently falls.</p>
        <div key={round} className="relative mt-3 h-64 overflow-hidden rounded-3xl border-4 border-[#bde8ac] bg-gradient-to-b from-[#c7f0ff] to-[#d8f4bd] sm:h-80">
          <div className="absolute inset-x-0 bottom-0 h-12 rounded-t-[50%] bg-[#92cf7a]"/>
          <div className="relative z-10 grid h-full grid-cols-3 gap-1 px-1">
            {choices.map((index,i)=><div key={index} className="flex items-start justify-center">
              <button type="button" disabled={busy} onClick={()=>choose(index)}
                aria-label={"Catch "+ANIMALS[index].name}
                className="niko-farm-falling flex h-20 w-20 touch-manipulation items-center justify-center rounded-full border-4 border-white bg-white/90 text-5xl shadow-lg sm:h-28 sm:w-28 sm:text-7xl"
                style={{animation:settings.calm||settings.slow?"none":"niko-farm-fall 7s linear infinite",animationDelay:`${i*-.9}s`,transform:settings.calm||settings.slow?"translateY(70px)":undefined}}>
                {ANIMALS[index].emoji}
              </button>
            </div>)}
          </div>
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-7 font-bold text-[#5d4787]">{feedback}</p>
        <div className="mt-2 flex justify-center gap-1" aria-label={round+" of ten animals caught"}>{Array.from({length:10},(_,i)=><span key={i} className="text-lg sm:text-2xl" aria-hidden="true">{i<round||(busy&&i===round)?"⭐":"☆"}</span>)}</div>
      </div>
      <p className="text-sm font-bold text-white">No timer, no lost lives. Just happy catches!</p>
    </div>
  </div>;
}
