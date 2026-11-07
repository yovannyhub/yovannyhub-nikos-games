import { useEffect, useRef, useState } from "react";
import type { Settings } from "../game/types";

const COUNTS = [1, 2, 3, 4, 5, 3, 2, 5, 4, 6];
const OBJECTS = ["⭐", "🪐", "🚀", "🌟", "👽", "🌙", "☄️", "🛸", "💫", "⭐"];
function GalaxyBackground() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="galaxySky" x2="1" y2="1"><stop stopColor="#101d59"/><stop offset=".5" stopColor="#4a278b"/><stop offset="1" stopColor="#102a65"/></linearGradient><radialGradient id="galaxyGlow"><stop stopColor="#e4aaff" stopOpacity=".6"/><stop offset="1" stopColor="#e4aaff" stopOpacity="0"/></radialGradient></defs>
      <rect width="1200" height="800" fill="url(#galaxySky)"/>
      <ellipse cx="560" cy="350" rx="590" ry="360" fill="url(#galaxyGlow)"/>
      {Array.from({length:85},(_,i)=><circle key={i} cx={(i*197+41)%1200} cy={(i*131+27)%800} r={i%7===0?4:1.5} fill={i%4===0?"#ffd7ff":"#ffffff"} opacity={.4+(i%5)*.12}/>)}
      <g transform="translate(1080 175)"><circle r="120" fill="#ffca89"/><ellipse rx="180" ry="35" fill="none" stroke="#ffebc3" strokeWidth="22" transform="rotate(-22)"/><circle cx="-30" cy="-36" r="22" fill="#e8a879" opacity=".6"/></g>
      <g transform="translate(105 610)"><circle r="130" fill="#65c7e9"/><path d="M-110 45Q-35 -20 25 60T120 10" fill="none" stroke="#3f9dbd" strokeWidth="30" opacity=".65"/></g>
      <g transform="translate(1030 655)"><circle r="58" fill="#e6a4ed"/><circle cx="-17" cy="-15" r="13" fill="#c984d5"/></g>
      <path d="M0 790Q350 705 680 795T1200 740V800H0Z" fill="#422c83"/>
    </svg>
    <span className="absolute left-[6%] top-[15%] text-5xl sm:text-7xl">🚀</span>
    <span className="absolute right-[8%] bottom-[17%] text-5xl sm:text-7xl">👽</span>
  </div>;
}

export function GalaxyCountingWorld({settings,onFinish,onHome,onHearLaury,onInteract,onFinalAnswer}:{
  settings:Settings;onFinish:(score:number)=>void;onHome:()=>void;onHearLaury:()=>void;onInteract:()=>void;onFinalAnswer:()=>void;
}) {
  const [step,setStep]=useState(0);
  const [correct,setCorrect]=useState(0);
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState("");
  const [confirmExit,setConfirmExit]=useState(false);
  const timer=useRef<number|null>(null);
  useEffect(()=>()=>{if(timer.current!==null)window.clearTimeout(timer.current);},[]);
  const count=COUNTS[step];
  const options=[count, count===1?2:count-1, count===6?4:count+1];
  const choices=step%3===0?options:step%3===1?[options[1],options[0],options[2]]:[options[2],options[1],options[0]];
  function choose(answer:number) {
    onInteract();
    if(busy)return;
    if(answer!==count){setFeedback("Good try! Count each space friend again.");return;}
    setBusy(true);
    if(step===COUNTS.length-1)onFinalAnswer();
    setCorrect(c=>c+1);
    setFeedback("Amazing counting! You found "+count+"! ⭐");
    timer.current=window.setTimeout(()=>{
      if(step===COUNTS.length-1)onFinish((correct+1)*100);
      else {setStep(s=>s+1);setFeedback("");setBusy(false);}
    },step===COUNTS.length-1?3500:settings.calm?450:800);
  }
  return <div className="absolute inset-0 z-20 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-center text-[#302752]">
    <GalaxyBackground/>
    <div className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-3 py-2">
      <div className="flex w-full items-center justify-between gap-2">
        <button type="button" className="min-h-12 rounded-full bg-white px-3 font-bold" onClick={()=>confirmExit?onHome():setConfirmExit(true)}>{confirmExit?"Tap again to exit":"🏠 Home"}</button>
        <span className="rounded-full bg-white px-3 py-2 text-sm font-bold">🚀 Galaxy · {step+1}/10</span>
        <button type="button" className="min-h-12 rounded-full bg-[#7750f7] px-3 font-bold text-white" onClick={onHearLaury}>🔊 Laury</button>
      </div>
      <div className="w-full rounded-[2rem] border-4 border-white bg-white/95 p-4 shadow-lg sm:p-7">
        <div className="text-4xl" aria-hidden="true">🚀 🪐 ⭐</div>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-4xl">Counting Fun!</h2>
        <p className="mt-2 font-semibold">How many space friends can you see?</p>
        <div className="mx-auto mt-3 flex min-h-28 max-w-md flex-wrap items-center justify-center gap-2 rounded-3xl border-4 border-[#e5ddff] bg-[#ede8ff] px-4 py-4 sm:min-h-36">
          {Array.from({length:count},(_,i)=><span key={i} className="text-4xl sm:text-5xl" aria-label={OBJECTS[step]}>{OBJECTS[step]}</span>)}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-5">
          {choices.map(n=><button key={n} type="button" disabled={busy} onClick={()=>choose(n)} aria-label={n+" objects"} className="flex min-h-24 touch-manipulation items-center justify-center rounded-3xl border-4 border-white bg-[#f1edff] p-2 text-5xl font-black shadow-md sm:min-h-36 sm:text-7xl">{n}</button>)}
        </div>
        <p role="status" aria-live="polite" className="mt-4 min-h-8 text-base font-bold text-[#5d4787]">{feedback||"Count slowly. There is no timer!"}</p>
        <div className="mt-2 flex justify-center gap-1" aria-label={correct+" counting stars earned"}>{Array.from({length:10},(_,i)=><span key={i} className="text-lg sm:text-2xl" aria-hidden="true">{i<correct?"⭐":"☆"}</span>)}</div>
      </div>
      <p className="text-sm font-bold text-white">Every little count is a big discovery!</p>
    </div>
  </div>;
}
