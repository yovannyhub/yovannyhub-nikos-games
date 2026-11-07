import { useEffect, useRef, useState } from "react";
import type { Settings } from "../game/types";

const ANIMALS = ["🐷","🐮","🐥","🐴","🐑","🐰","🦆","🐶"];
const ROUNDS = [2,3,3,4,4,4,5,5,6,6];
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
type Card = { id:number; animal:string };
function makeCards(round:number):Card[] {
  const pairs=ROUNDS[round];
  const chosen=Array.from({length:pairs},(_,i)=>ANIMALS[(i+round)%ANIMALS.length]);
  const cards=chosen.flatMap((animal,i)=>[{id:i*2,animal},{id:i*2+1,animal}]);
  // Deterministic shuffled arrangement: stable across React renders.
  return cards.map((_,i)=>cards[(i*5+3)%cards.length]).filter((c,i,arr)=>arr.findIndex(x=>x.id===c.id)===i).length===cards.length
    ? cards.map((_,i)=>cards[(i*5+3)%cards.length])
    : cards.slice().sort((a,b)=>((a.id*7+round*3)%17)-((b.id*7+round*3)%17));
}
export function FarmMemoryWorld({settings,onFinish,onHome,onHearLaury,onInteract,onFinalAnswer}:{
  settings:Settings;onFinish:(score:number)=>void;onHome:()=>void;onHearLaury:()=>void;onInteract:()=>void;onFinalAnswer:()=>void;
}) {
  const [round,setRound]=useState(0);
  const [opened,setOpened]=useState<number[]>([]);
  const [matched,setMatched]=useState<number[]>([]);
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState("Find two matching farm friends!");
  const [confirmExit,setConfirmExit]=useState(false);
  const timer=useRef<number|null>(null);
  const cards=makeCards(round);
  useEffect(()=>()=>{if(timer.current!==null)window.clearTimeout(timer.current);},[]);
  function choose(card:Card){
    onInteract();
    if(busy||matched.includes(card.id)||opened.includes(card.id))return;
    if(opened.length===0){setOpened([card.id]);return;}
    const first=cards.find(c=>c.id===opened[0]);
    setOpened([opened[0],card.id]);
    setBusy(true);
    if(first?.animal===card.animal){
      setFeedback("A perfect pair! ⭐");
      const next=[...matched,opened[0],card.id];
      timer.current=window.setTimeout(()=>{
        setMatched(next);setOpened([]);setBusy(false);
        if(next.length===cards.length){
          if(round===ROUNDS.length-1){
            onFinalAnswer();
            setFeedback("You matched every farm friend! ⭐");
            timer.current=window.setTimeout(()=>onFinish(1000),3500);
          }else{
            setFeedback("Wonderful! Let's meet more farm friends.");
            timer.current=window.setTimeout(()=>{setRound(r=>r+1);setMatched([]);setOpened([]);setBusy(false);setFeedback("Find two matching farm friends!");},settings.calm?500:900);
            setBusy(true);
          }
        }
      },settings.calm?350:650);
    }else{
      setFeedback("Not a match yet. Try again!");
      timer.current=window.setTimeout(()=>{setOpened([]);setBusy(false);},settings.calm?650:1100);
    }
  }
  return <div className="absolute inset-0 z-20 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-center text-[#3b2f4a]">
    <FarmScenery/>
    <div className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-3 py-2">
      <div className="flex w-full items-center justify-between gap-2">
        <button type="button" className="min-h-12 rounded-full bg-white px-3 font-bold" onClick={()=>confirmExit?onHome():setConfirmExit(true)}>{confirmExit?"Tap again to exit":"🏠 Home"}</button>
        <span className="rounded-full bg-white px-3 py-2 text-sm font-bold">🐷 Happy Farm · {round+1}/10</span>
        <button type="button" className="min-h-12 rounded-full bg-[#7750f7] px-3 font-bold text-white" onClick={onHearLaury}>🔊 Laury</button>
      </div>
      <div className="w-full rounded-[2rem] border-4 border-white bg-white/95 p-3 shadow-lg sm:p-7">
        <h2 className="text-2xl font-extrabold sm:text-4xl">Memory Match!</h2>
        <p className="mt-1 font-semibold">Tap two cards to find matching animals.</p>
        <div className="mx-auto mt-4 grid max-w-xl grid-cols-4 gap-2 sm:gap-3">
          {cards.map(card=>{
            const shown=opened.includes(card.id)||matched.includes(card.id);
            return <button type="button" key={card.id} onClick={()=>choose(card)} disabled={busy||matched.includes(card.id)} aria-label={shown?card.animal:"Hidden farm animal card"} aria-pressed={shown} className={`flex aspect-square min-h-14 touch-manipulation items-center justify-center rounded-2xl border-2 border-white text-3xl shadow-md transition-colors sm:text-5xl ${matched.includes(card.id)?"bg-[#c9f1c7]":shown?"bg-[#fff1c5]":"bg-[#8b73d6]"}`}>{shown?card.animal:"❔"}</button>;
          })}
        </div>
        <p role="status" aria-live="polite" className="mt-4 min-h-8 font-bold text-[#5d4787]">{feedback}</p>
        <div className="mt-2 flex justify-center gap-1" aria-label={round+" of ten rounds completed"}>{Array.from({length:10},(_,i)=><span key={i} className="text-lg sm:text-2xl" aria-hidden="true">{i<=round?"⭐":"☆"}</span>)}</div>
      </div>
      <p className="text-sm font-bold text-white">Take your time. Every match is a win!</p>
    </div>
  </div>;
}
