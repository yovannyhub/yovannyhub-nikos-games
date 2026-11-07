import { useEffect, useRef, useState } from "react";
import type { Settings } from "../game/types";

const FRIENDS=[
  {name:"bird",emoji:"🐦",hint:"Look up in the trees!"},
  {name:"panda",emoji:"🐼",hint:"Look near the bamboo!"},
  {name:"butterfly",emoji:"🦋",hint:"Look around the flowers!"},
  {name:"frog",emoji:"🐸",hint:"Look near the pond!"},
  {name:"rabbit",emoji:"🐰",hint:"Look beside the bushes!"},
  {name:"monkey",emoji:"🐵",hint:"Look up in the branches!"},
  {name:"bee",emoji:"🐝",hint:"Look near the flowers!"},
  {name:"turtle",emoji:"🐢",hint:"Look beside the water!"},
  {name:"fox",emoji:"🦊",hint:"Look around the trees!"},
  {name:"duck",emoji:"🦆",hint:"Look near the pond!"}
];
const SPOTS=[{x:18,y:31},{x:75,y:28},{x:49,y:47},{x:22,y:67},{x:77,y:68}];
function BambooScene(){
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <svg className="h-full w-full" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="bambooSky" x2="0" y2="1"><stop stopColor="#b9eff2"/><stop offset="1" stopColor="#dcf2b6"/></linearGradient></defs>
      <rect width="1000" height="800" fill="url(#bambooSky)"/>
      <circle cx="780" cy="120" r="65" fill="#ffefac"/>
      <path d="M0 500Q250 390 520 475T1000 430V800H0Z" fill="#9ad48b"/>
      <path d="M0 625Q230 530 490 605T1000 550V800H0Z" fill="#69b87a"/>
      <ellipse cx="500" cy="760" rx="250" ry="90" fill="#8bd8df"/>
      {Array.from({length:18},(_,i)=>{const x=(i*157+29)%1020;const h=280+(i%4)*55;return <g key={i} transform={`translate(${x} ${670+(i%3)*35})`} opacity=".95">
        <rect x="-9" y={-h} width="18" height={h+60} rx="7" fill={i%2?"#4c9c62":"#58ae68"}/>
        {Array.from({length:5},(_,j)=><g key={j} transform={`translate(0 ${-j*65-30})`}>
          <path d="M-9 0H9" stroke="#2e7e50" strokeWidth="5"/>
          <path d="M0 0Q-38 -65 -80 -48Q-45 -9 0 0" fill="#4f9e5e"/>
          <path d="M0 0Q38 -62 80 -45Q47 -8 0 0" fill="#73bb77"/>
        </g>)}
      </g>})}
      <path d="M0 740Q210 690 460 740T1000 710V800H0Z" fill="#4b9b63"/>
    </svg>
  </div>;
}
export function BambooListenWorld({settings,onFinish,onHome,onHearLaury,onInteract,onFinalAnswer,onQuestionAudioStart,onQuestionAudioEnd,introPlaying}:{
 settings:Settings;onFinish:(score:number)=>void;onHome:()=>void;onHearLaury:()=>void;onInteract:()=>void;onFinalAnswer:()=>void;onQuestionAudioStart:()=>void;onQuestionAudioEnd:()=>void;introPlaying:boolean;
}){
 const [round,setRound]=useState(0);
 const [found,setFound]=useState(false);
 const [feedback,setFeedback]=useState("");
 const [hint,setHint]=useState(false);
 const [exit,setExit]=useState(false);
 const timer=useRef<number|null>(null);
 const voice=useRef<HTMLAudioElement|null>(null);
 const context=useRef<AudioContext|null>(null);
 const buffers=useRef<(AudioBuffer|null)[]>(Array(10).fill(null));
 const source=useRef<AudioBufferSourceNode|null>(null);
 const speaking=useRef(false);
 const [replay,setReplay]=useState(0);
 const audioCallbacks=useRef({start:onQuestionAudioStart,end:onQuestionAudioEnd});
 audioCallbacks.current={start:onQuestionAudioStart,end:onQuestionAudioEnd};
 const target=FRIENDS[round];
 useEffect(()=>{
   let cancelled=false;
   const ctx=new AudioContext();
   context.current=ctx;
   void Promise.all(FRIENDS.map(async (_,i)=>{
     try{
       const response=await fetch(`${import.meta.env.BASE_URL}audio/bamboo-question-${String(i+1).padStart(2,"0")}.mp3`);
       if(!response.ok)throw new Error("Missing question audio");
       const buffer=await ctx.decodeAudioData(await response.arrayBuffer());
       if(!cancelled)buffers.current[i]=buffer;
     }catch{ /* HTML audio remains a fallback */ }
   }));
   return ()=>{cancelled=true;if(timer.current!==null)window.clearTimeout(timer.current);source.current?.stop();voice.current?.pause();void ctx.close();if("speechSynthesis" in window)window.speechSynthesis.cancel();};
 },[]);
 function unlockAudio(){
   const ctx=context.current;
   if(ctx&&ctx.state==="suspended")void ctx.resume().catch(()=>{});
 }
 const friends=[round,(round+3)%10,(round+6)%10,(round+8)%10];
 const positions=friends.map((index,i)=>({index,spot:SPOTS[(i+round)%SPOTS.length]}));
 useEffect(()=>{
   if(introPlaying||!settings.sound||settings.quiet||found)return;
   let cancelled=false;
   voice.current?.pause();
   if("speechSynthesis" in window)window.speechSynthesis.cancel();
   speaking.current=true;
   audioCallbacks.current.start();
   const finish=()=>{if(cancelled)return;speaking.current=false;audioCallbacks.current.end();};
   const ctx=context.current;
   const buffer=buffers.current[round];
   if(ctx&&buffer&&ctx.state==="running"){
     const node=ctx.createBufferSource();
     node.buffer=buffer;
     node.connect(ctx.destination);
     source.current=node;
     node.onended=finish;
     node.start();
   }else{
     const clip=new Audio(`${import.meta.env.BASE_URL}audio/bamboo-question-${String(round+1).padStart(2,"0")}.mp3`);
     voice.current=clip;
     clip.onended=finish;
     clip.onerror=finish;
     void clip.play().catch(finish);
   }
   return ()=>{cancelled=true;voice.current?.pause();if(source.current){source.current.onended=null;try{source.current.stop();}catch{}source.current=null;}if(speaking.current){speaking.current=false;audioCallbacks.current.end();}};
 },[round,replay,introPlaying,settings.sound,settings.quiet,settings.slow,found]);
 function speak(){unlockAudio();onInteract();setReplay(n=>n+1);}
  function choose(index:number){
   unlockAudio();
   onInteract();
   if(found)return;
   if(index!==round){setFeedback("That's a "+FRIENDS[index].name+". Keep looking!");return;}
   voice.current?.pause();
   if(source.current){source.current.onended=null;try{source.current.stop();}catch{}source.current=null;}
   setFound(true);
   setFeedback("You found the "+target.name+"! ⭐");
   if(round===9)onFinalAnswer();
   timer.current=window.setTimeout(()=>{
     if(round===9)onFinish(1000);
     else {setRound(r=>r+1);setFound(false);setFeedback("");setHint(false);}
   },round===9?3500:settings.calm?600:1100);
 }
 return <div className="absolute inset-0 z-20 overflow-hidden text-[#254b37]">
   <BambooScene/>
   <div className="absolute inset-x-0 top-0 z-30 px-3 pt-[max(1rem,env(safe-area-inset-top))]">
     <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
       <button type="button" className="min-h-12 rounded-full bg-white px-3 font-bold shadow" onClick={()=>exit?onHome():setExit(true)}>{exit?"Tap again to exit":"🏠 Home"}</button>
       <span className="rounded-full bg-white px-3 py-2 text-sm font-bold shadow">🐼 Bamboo · {round+1}/10</span>
       <button type="button" className="min-h-12 rounded-full bg-[#7750f7] px-3 font-bold text-white shadow" onClick={onHearLaury}>🔊 Laury</button>
     </div>
     <div className="mx-auto mt-3 flex max-w-lg flex-col items-center gap-2 rounded-3xl bg-white/95 p-3 text-center shadow-xl">
       <h2 className="text-xl font-extrabold sm:text-2xl">🔎 Listen & Find!</h2>
       <p className="text-lg font-bold">Find the {target.name}!</p>
       <div className="flex gap-2">
         <button type="button" onClick={speak} className="min-h-11 rounded-full bg-[#7750f7] px-4 font-bold text-white">🔊 Repeat question</button>
         <button type="button" onClick={()=>setHint(true)} className="min-h-11 rounded-full bg-[#e3f4d6] px-4 font-bold">💡 Hint</button>
       </div>
       {hint&&<p className="text-sm font-bold">{target.hint}</p>}
     </div>
   </div>
   <div key={round} className="absolute inset-x-0 top-[35%] bottom-[15%] mx-auto max-w-5xl">
     {positions.map(({index,spot})=><button key={index} type="button" disabled={found} onClick={()=>choose(index)} aria-label={FRIENDS[index].name}
       className="absolute flex h-20 w-20 touch-manipulation items-center justify-center rounded-3xl border-2 border-white/60 bg-white/40 text-5xl shadow-md backdrop-blur-[2px] transition-transform active:scale-110 sm:h-28 sm:w-28 sm:text-7xl"
       style={{left:`calc(${spot.x}% - 2.5rem)`,top:`calc(${spot.y}% - 2.5rem)`}}>
       {FRIENDS[index].emoji}{found&&index===round&&<span className="absolute -right-3 -top-4 text-3xl">⭐</span>}
     </button>)}
   </div>
   <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex flex-col items-center gap-2 px-2">
     <p role="status" aria-live="polite" className="min-h-10 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-bold shadow-lg">{feedback||"Explore the forest. Take your time!"}</p>
     <div className="flex gap-1 rounded-full bg-white/95 px-3 py-2 shadow" aria-label={round+" of ten friends found"}>
       {Array.from({length:10},(_,i)=><span key={i} className="text-lg sm:text-2xl">{i<round||(found&&i===round)?"⭐":"☆"}</span>)}
     </div>
   </div>
 </div>;
}
