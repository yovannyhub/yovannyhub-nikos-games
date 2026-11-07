/** Decorative world scenery stays behind interactive game controls. */
export function WorldScenery({ world, calm }: { world: "meadow" | "ocean"; calm: boolean }) {
  const ocean = world === "ocean";
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={ocean ? "oceanSky" : "meadowSky"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ocean ? "#075c9a" : "#7acbfa"} />
          <stop offset=".52" stopColor={ocean ? "#15a6c5" : "#c6efff"} />
          <stop offset="1" stopColor={ocean ? "#08778c" : "#b5e89c"} />
        </linearGradient>
        <radialGradient id="sunGlow"><stop stopColor="#fffbd0" stopOpacity=".95"/><stop offset="1" stopColor="#fffbd0" stopOpacity="0"/></radialGradient>
      </defs>
      <rect width="1200" height="800" fill={ocean ? "url(#oceanSky)" : "url(#meadowSky)"}/>
      {ocean ? <>
        <path d="M0 0H1200V125Q930 85 750 122T300 105T0 132Z" fill="#a6f8fa" opacity=".28"/>
        {[140,350,640,930,1120].map((x,i)=><path key={x} d={`M${x} -10 l-155 570 h105 l180 -570Z`} fill="#d5ffff" opacity={i%2 ? ".09" : ".14"}/>)}
        <path d="M0 704Q180 664 360 704T720 705T1200 685V800H0Z" fill="#e6cf9b"/>
        <path d="M0 760Q220 725 430 768T830 758T1200 741V800H0Z" fill="#b5b68b"/>
        {[50,150,275,920,1030,1160].map((x,i)=><g key={x} transform={`translate(${x} 745)`}>
          <path d={`M0 0 Q${-35+i*3} -100 -18 -${175+i*15} M0 0 Q${35+i*2} -120 38 -${205-i*7} M0 0 Q0 -90 8 -155`} fill="none" stroke={i%2 ? "#1b8c6b" : "#137e62"} strokeWidth="15" strokeLinecap="round"/>
          <ellipse cx="-25" cy="-100" rx="13" ry="32" fill="#2db488" transform="rotate(-30 -25 -100)"/>
          <ellipse cx="28" cy="-125" rx="13" ry="35" fill="#39bb8c" transform="rotate(28 28 -125)"/>
        </g>)}
        {[90,1040,1130].map((x,i)=><g key={x} transform={`translate(${x} ${710+i*15})`}>
          <path d="M-48 20Q-85 -35 -42 -78Q-12 -45 0 -15Q14 -70 45 -80Q81 -25 48 20Z" fill={i===1 ? "#ff947f" : "#f6a15b"} stroke="#ffcb9d" strokeWidth="6"/>
          <circle cx="0" cy="10" r="14" fill="#ffe2ae"/>
        </g>)}
        {[ [105,235,.8],[1030,190,1],[1075,420,.65],[170,515,.55],[970,590,.8] ].map(([x,y,scale],i)=><g key={i} transform={`translate(${x} ${y}) scale(${scale})`}>
          <path d="M-50 0L-84 -32V32Z" fill={i%2 ? "#ffbf6c" : "#f5a0ba"}/>
          <ellipse cx="0" cy="0" rx="55" ry="32" fill={i%2 ? "#ffc66b" : "#ff9cbb"}/>
          <circle cx="30" cy="-7" r="5" fill="#264761"/><path d="M-15 -26L2 -47L16 -25" fill="#ffebaf"/>
        </g>)}
        {Array.from({length:18},(_,i)=><circle key={i} cx={35+(i*173)%1160} cy={45+(i*127)%610} r={4+i%4*3} fill="none" stroke="#d2ffff" strokeWidth="3" opacity=".48"/>)}
      </> : <>
        <circle cx="1000" cy="140" r="180" fill="url(#sunGlow)"/>
        <circle cx="1000" cy="140" r="63" fill="#fff3ad"/>
        {[ [110,140],[385,90],[790,200] ].map(([x,y],i)=><g key={i} fill="#ffffff" opacity=".9" transform={`translate(${x} ${y})`}>
          <ellipse cx="0" cy="22" rx="105" ry="30"/><circle cx="-48" cy="5" r="40"/><circle cx="12" cy="-16" r="52"/><circle cx="65" cy="7" r="37"/>
        </g>)}
        <path d="M0 550Q250 360 530 510T1200 445V800H0Z" fill="#7ccf81"/>
        <path d="M0 640Q340 490 650 620T1200 565V800H0Z" fill="#4ebc68"/>
        <path d="M0 735Q330 620 610 730T1200 655V800H0Z" fill="#2f9f58"/>
        {[65,180,1030,1140].map((x,i)=><g key={x} transform={`translate(${x} ${480+i%2*75})`}>
          <path d="M0 0V-150" stroke="#94674e" strokeWidth="23" strokeLinecap="round"/>
          <circle cx="-35" cy="-155" r="62" fill="#399d5b"/><circle cx="38" cy="-165" r="72" fill="#4bbd68"/><circle cx="0" cy="-210" r="68" fill="#64ce74"/>
        </g>)}
        {Array.from({length:24},(_,i)=>{const x=20+(i*197)%1180,y=675+(i*59)%115;return <g key={i} transform={`translate(${x} ${y})`}><path d="M0 0V-26" stroke="#286f42" strokeWidth="4"/>{[0,60,120,180,240,300].map(a=><ellipse key={a} cx="0" cy="-30" rx="7" ry="14" fill={i%3===0 ? "#f8a7cb" : i%3===1 ? "#ffe68b" : "#fff4f2"} transform={`rotate(${a} 0 -30)`}/>)}<circle cy="-30" r="7" fill="#f4b24f"/></g>})}
        {[ [130,320],[1080,300],[980,510] ].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><ellipse cx="-13" cy="0" rx="16" ry="22" fill="#ffafdb" opacity=".9"/><ellipse cx="13" cy="0" rx="16" ry="22" fill="#caa9f9" opacity=".9"/><path d="M0 -15V20" stroke="#5c6488" strokeWidth="3"/></g>)}
      </>}
    </svg>
    {!calm && <div className="absolute inset-0" style={{background: ocean ? "radial-gradient(circle at 50% 15%, rgba(180,255,255,.12), transparent 60%)" : "radial-gradient(circle at 50% 10%, rgba(255,255,255,.1), transparent 60%)"}}/>}
  </div>;
}
